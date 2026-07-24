const prisma = require('../config/database');
const crypto = require('crypto');

function getCartToken(req) {
  return req.headers['x-cart-token'] || req.query.cartToken;
}

async function findOrCreateCart(userId, sessionToken) {
  let cart;
  if (userId) {
    cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });
  } else if (sessionToken) {
    cart = await prisma.cart.findUnique({ where: { sessionToken } });
    if (!cart) cart = await prisma.cart.create({ data: { sessionToken } });
  } else {
    cart = await prisma.cart.create({
      data: { sessionToken: crypto.randomUUID() },
    });
  }
  return cart;
}

const cartInclude = {
  items: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, comparePrice: true, stockQuantity: true, isActive: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      },
      variant: { select: { id: true, name: true, price: true, stockQuantity: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
};

// GET /api/cart
async function getCart(req, res, next) {
  try {
    const sessionToken = getCartToken(req);
    const cart = await findOrCreateCart(req.user?.id, sessionToken);
    const fullCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });
    res.json({ cart: formatCartResponse(fullCart) });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart/items
async function addItem(req, res, next) {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const sessionToken = getCartToken(req);
    const cart = await findOrCreateCart(req.user?.id, sessionToken);

    // Check product exists and is active
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already exists
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + parseInt(quantity) },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variantId || null, quantity: parseInt(quantity) },
      });
    }

    const fullCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
    res.json({ cart: formatCartResponse(fullCart) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/cart/items/:itemId
async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const sessionToken = getCartToken(req);
    const cart = await findOrCreateCart(req.user?.id, sessionToken);

    const item = await prisma.cartItem.findFirst({ where: { id: req.params.itemId, cartId: cart.id } });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    if (parseInt(quantity) <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: parseInt(quantity) } });
    }

    const fullCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
    res.json({ cart: formatCartResponse(fullCart) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/items/:itemId
async function removeItem(req, res, next) {
  try {
    const sessionToken = getCartToken(req);
    const cart = await findOrCreateCart(req.user?.id, sessionToken);

    const item = await prisma.cartItem.findFirst({ where: { id: req.params.itemId, cartId: cart.id } });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    await prisma.cartItem.delete({ where: { id: item.id } });

    const fullCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
    res.json({ cart: formatCartResponse(fullCart) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart
async function clearCart(req, res, next) {
  try {
    const sessionToken = getCartToken(req);
    const cart = await findOrCreateCart(req.user?.id, sessionToken);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const fullCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
    res.json({ cart: formatCartResponse(fullCart) });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart/coupon (simple mock)
async function applyCoupon(req, res, next) {
  try {
    const { code } = req.body;
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }
    res.json({ coupon: { code: coupon.code, type: coupon.type, value: Number(coupon.value) } });
  } catch (err) {
    next(err);
  }
}

function formatCartResponse(cart) {
  const items = cart.items.map(item => {
    const variant = item.variant;
    const product = item.product;
    const price = variant?.price ? Number(variant.price) : Number(product.price);
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      product: { id: product.id, name: product.name, slug: product.slug, stockQuantity: product.stockQuantity },
      variant: variant ? { id: variant.id, name: variant.name } : null,
      price,
      quantity: item.quantity,
      total: price * item.quantity,
      image: product.images?.[0]?.url,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);

  return {
    id: cart.id,
    sessionToken: cart.sessionToken,
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
  };
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon };
