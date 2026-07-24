const prisma = require('../config/database');

// GET /api/me/addresses
async function getAddresses(req, res, next) {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ addresses });
  } catch (err) {
    next(err);
  }
}

// POST /api/me/addresses
async function createAddress(req, res, next) {
  try {
    const { label, firstName, lastName, street, apartment, city, state, zipCode, country, phone, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: {
        userId: req.user.id, label, firstName, lastName, street, apartment, city, state, zipCode, country, phone, isDefault,
      },
    });
    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
}

// PUT /api/me/addresses/:id
async function updateAddress(req, res, next) {
  try {
    const addr = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    const { label, firstName, lastName, street, apartment, city, state, zipCode, country, phone, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: { label, firstName, lastName, street, apartment, city, state, zipCode, country, phone, isDefault },
    });
    res.json({ address });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/me/addresses/:id
async function deleteAddress(req, res, next) {
  try {
    const addr = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
}

// GET /api/me/wishlist
async function getWishlist(req, res, next) {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, comparePrice: true, isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const products = items.map(i => ({ ...i.product, wishlistItemId: i.id }));
    res.json({ wishlist: products });
  } catch (err) {
    next(err);
  }
}

// POST /api/me/wishlist
async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (existing) return res.json({ message: 'Already in wishlist' });

    await prisma.wishlistItem.create({ data: { userId: req.user.id, productId } });
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/me/wishlist/:productId
async function removeFromWishlist(req, res, next) {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress, getWishlist, addToWishlist, removeFromWishlist };
