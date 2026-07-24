const prisma = require('../config/database');
const { generateOrderNumber } = require('../utils/helpers');

const orderInclude = {
  items: true,
  statusHistory: { orderBy: { createdAt: 'desc' } },
  shippingAddress: true,
  payment: true,
};

// POST /api/orders - Place order from cart
async function placeOrder(req, res, next) {
  try {
    const { email, shippingAddressId, shippingMethod = 'standard', notes, shippingAddress, couponCode } = req.body;

    if (!email && !req.user) {
      return res.status(400).json({ error: 'Email is required for guest checkout' });
    }

    const userEmail = req.user?.email || email;

    // Get the cart
    const sessionToken = req.headers['x-cart-token'];
    let cart;
    if (req.user) {
      cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    } else if (sessionToken) {
      cart = await prisma.cart.findUnique({ where: { sessionToken } });
    }

    if (!cart) {
      return res.status(400).json({ error: 'Cart not found' });
    }

    const cartWithItems = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
            variant: true,
          },
        },
      },
    });

    if (!cartWithItems.items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cartWithItems.items) {
      if (!item.product.isActive) {
        return res.status(400).json({ error: `Product "${item.product.name}" is no longer available` });
      }
      // Check product stock
      if (item.product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Product "${item.product.name}" has insufficient stock (only ${item.product.stockQuantity} available)` });
      }
      // Check variant stock if applicable
      if (item.variant && item.variant.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Variant "${item.variant.name}" of "${item.product.name}" is out of stock` });
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cartWithItems.items.map(item => {
      const price = item.variant?.price ? Number(item.variant.price) : Number(item.product.price);
      const total = price * item.quantity;
      subtotal += total;
      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.variant?.name || null,
        price,
        quantity: item.quantity,
        total,
        imageUrl: item.product.images?.[0]?.url,
      };
    });

    // Get shipping rates from site settings (with fallbacks)
    const shippingSettings = await prisma.siteSetting.findMany({
      where: { key: { startsWith: 'shipping_' } },
    });
    const shippingMap = {};
    shippingSettings.forEach(s => { shippingMap[s.key] = parseFloat(s.value) || 0; });
    const shippingRates = {
      standard: shippingMap.shipping_standard_fee || 10,
      express: shippingMap.shipping_express_fee || 25,
      local_friday: shippingMap.shipping_local_friday_fee || 15,
      local_same_day: shippingMap.shipping_local_same_day_fee || 30,
    };
    const shippingCost = shippingRates[shippingMethod] || 10;
    const taxRateStr = (await prisma.siteSetting.findUnique({ where: { key: 'tax_rate' } }))?.value || '0.0875';
    const taxRate = parseFloat(taxRateStr);
    const tax = Math.round(subtotal * taxRate * 100) / 100;

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive) {
        const now = new Date();
        const valid =
          // Check start date
          (!coupon.startsAt || coupon.startsAt <= now) &&
          // Check expiry date
          (!coupon.expiresAt || coupon.expiresAt > now) &&
          // Check usage limit (null = unlimited, 0 = no uses)
          (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) &&
          // Check minimum order amount
          (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount));
        if (valid) {
          if (coupon.type === 'percentage') {
            discount = Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100;
          } else {
            discount = Math.min(Number(coupon.value), subtotal);
          }
          // Increment usage
          await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
        }
      }
    }

    const total = Math.round((subtotal + shippingCost + tax - discount) * 100) / 100;

    // Get or create shipping address
    let shippingAddr = null;
    if (shippingAddressId) {
      shippingAddr = await prisma.address.findUnique({ where: { id: shippingAddressId } });
    } else if (shippingAddress && req.user) {
      // Create address from inline data for logged-in users
      shippingAddr = await prisma.address.create({
        data: {
          userId: req.user.id,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          street: shippingAddress.street,
          apartment: shippingAddress.apartment || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          phone: shippingAddress.phone || '',
        },
      });
    }
    // Note: Guest users' address is captured in the payload but stored
    // in a simplified way since Address model requires a userId.
    // For guest checkout, the email field serves as the primary contact.

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user?.id || null,
        email: userEmail,
        status: 'confirmed',
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        shippingMethod,
        notes,
        shippingAddressId: shippingAddr?.id || null,
        paidAt: new Date(), // mock payment
        items: { create: orderItems },
        statusHistory: { create: { status: 'confirmed', notes: 'Order placed' } },
        payment: {
          create: {
            method: 'credit_card',
            amount: total,
            status: 'completed',
            paidAt: new Date(),
            transactionId: 'mock_txn_' + Date.now(),
          },
        },
      },
      include: orderInclude,
    });

    // Update stock
    for (const item of cartWithItems.items) {
      const variantId = item.variantId;
      const qty = item.quantity;
      if (variantId) {
        await prisma.productVariant.update({
          where: { id: variantId },
          data: { stockQuantity: { decrement: qty } },
        });
      }
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: qty } },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    console.log(`[Email Mock] Order confirmation sent to ${userEmail} for order ${order.orderNumber}`);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

// GET /api/me/orders
async function getUserOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// GET /api/me/orders/:id
async function getUserOrder(req, res, next) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: orderInclude,
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { placeOrder, getUserOrders, getUserOrder };
