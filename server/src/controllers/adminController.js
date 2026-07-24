const prisma = require('../config/database');
const { slugify, paginate } = require('../utils/helpers');

// ==================== Dashboard ====================

async function getDashboard(req, res, next) {
  try {
    const [totalOrders, totalCustomers, totalProducts, totalRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ['cancelled', 'refunded'] } } }),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 10, orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const topProducts = await prisma.product.findMany({
      take: 5, orderBy: { reviewCount: 'desc' },
      where: { isActive: true },
      select: { id: true, name: true, price: true, reviewCount: true, rating: true },
    });

    // Revenue for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const recentRevenue = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { total: true },
      where: { createdAt: { gte: sevenDaysAgo }, status: { notIn: ['cancelled', 'refunded'] } },
    });

    res.json({
      stats: {
        totalOrders,
        totalCustomers,
        totalProducts,
        totalRevenue: totalRevenue._sum.total || 0,
      },
      recentOrders,
      topProducts,
      recentRevenue,
    });
  } catch (err) {
    next(err);
  }
}

// ==================== Products Admin ====================

async function adminGetProducts(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const { skip, take, page: currentPage, limit: pageLimit } = paginate(page, limit);
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take,
        include: { images: true, categories: { include: { category: true } }, variants: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ products, total, page: currentPage, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) });
  } catch (err) {
    next(err);
  }
}

async function adminGetProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true, categories: { include: { category: true } }, variants: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function adminCreateProduct(req, res, next) {
  try {
    const { name, description, shortDesc, price, comparePrice, sku, stockQuantity, isActive, isFeatured, isNew, isBestSeller, categoryIds, images, variants, ingredients, howToUse, fragranceNotes } = req.body;

    const slug = slugify(name);
    const product = await prisma.product.create({
      data: {
        name, slug, description, shortDesc, price, comparePrice, sku,
        stockQuantity: stockQuantity || 0,
        isActive: isActive !== false, isFeatured: !!isFeatured, isNew: !!isNew, isBestSeller: !!isBestSeller,
        ingredients, howToUse, fragranceNotes,
        images: images?.length ? { create: images.map((url, i) => ({ url, sortOrder: i, isPrimary: i === 0 })) } : undefined,
        variants: variants?.length ? { create: variants.map((v, i) => ({ name: v.name, sku: v.sku, price: v.price, stockQuantity: v.stockQuantity || 0, sortOrder: i })) } : undefined,
        categories: categoryIds?.length ? { create: categoryIds.map(cid => ({ categoryId: cid })) } : undefined,
      },
      include: { images: true, categories: { include: { category: true } }, variants: true },
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateProduct(req, res, next) {
  try {
    const { name, description, shortDesc, price, comparePrice, sku, stockQuantity, isActive, isFeatured, isNew, isBestSeller, categoryIds, variants, images, ingredients, howToUse, fragranceNotes } = req.body;

    let data = { description, shortDesc, price, comparePrice, sku, stockQuantity, isActive, isFeatured, isNew, isBestSeller, ingredients, howToUse, fragranceNotes };
    if (name) { data.name = name; data.slug = slugify(name); }

    // Handle variants update: delete old, create new
    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
      await prisma.productVariant.createMany({
        data: variants.map((v, i) => ({
          productId: req.params.id,
          name: v.name,
          sku: v.sku || null,
          price: v.price || null,
          stockQuantity: v.stockQuantity || 0,
          sortOrder: i,
        })),
      });
    }

    // Handle images (URLs pasted in textarea)
    if (images && Array.isArray(images) && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.filter(Boolean).map((url, i) => ({
          productId: req.params.id,
          url: url.trim(),
          sortOrder: i + 100, // add after existing uploaded images
          isPrimary: false,
        })),
      });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { images: true, categories: { include: { category: true } }, variants: true },
    });

    if (categoryIds) {
      await prisma.productCategory.deleteMany({ where: { productId: product.id } });
      await prisma.productCategory.createMany({
        data: categoryIds.map(cid => ({ productId: product.id, categoryId: cid })),
      });
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function adminDeleteProduct(req, res, next) {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
}

async function adminUploadProductImage(req, res, next) {
  try {
    const url = `/uploads/products/${req.file.filename}`;
    const image = await prisma.productImage.create({
      data: { productId: req.params.id, url, altText: req.body.altText, isPrimary: req.body.isPrimary === 'true' },
    });
    res.status(201).json({ image });
  } catch (err) {
    next(err);
  }
}

async function adminAddProductImageUrl(req, res, next) {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const image = await prisma.productImage.create({
      data: { productId: req.params.id, url },
    });
    res.status(201).json({ image });
  } catch (err) {
    next(err);
  }
}

async function adminDeleteProductImage(req, res, next) {
  try {
    const image = await prisma.productImage.findFirst({
      where: { id: req.params.imageId, productId: req.params.id },
    });
    if (!image) return res.status(404).json({ error: 'Image not found' });
    await prisma.productImage.delete({ where: { id: req.params.imageId } });
    res.json({ message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
}

// ==================== Categories Admin ====================

async function adminGetCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true, parent: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

async function adminCreateCategory(req, res, next) {
  try {
    const { name, description, parentId, image, sortOrder } = req.body;
    const category = await prisma.category.create({
      data: { name, slug: slugify(name), description, parentId, image, sortOrder },
    });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateCategory(req, res, next) {
  try {
    const { name, description, parentId, image, sortOrder, isActive } = req.body;
    const data = { description, parentId, image, sortOrder, isActive };
    if (name) { data.name = name; data.slug = slugify(name); }
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

async function adminDeleteCategory(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

// ==================== Orders Admin ====================

async function adminGetOrders(req, res, next) {
  try {
    const { page, limit, status, search } = req.query;
    const { skip, take, page: currentPage, limit: pageLimit } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take,
        include: { items: true, payment: true, shippingAddress: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total, page: currentPage, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) });
  } catch (err) {
    next(err);
  }
}

async function adminGetOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'desc' } }, shippingAddress: true, payment: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateOrderStatus(req, res, next) {
  try {
    const { status, notes } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updateData = { status };
    if (status === 'delivered') updateData.deliveredAt = new Date();
    if (status === 'cancelled') updateData.cancelledAt = new Date();
    if (status === 'shipped') updateData.shippedAt = new Date();

    await prisma.order.update({
      where: { id: req.params.id },
      data: { ...updateData, statusHistory: { create: { status, notes } } },
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'desc' } }, shippingAddress: true, payment: true },
    });
    res.json({ order: updatedOrder });
  } catch (err) {
    next(err);
  }
}

// ==================== Users Admin ====================

async function adminGetUsers(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const { skip, take, page: currentPage, limit: pageLimit } = paginate(page, limit);
    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, select: { id: true, email: true, firstName: true, lastName: true, isAdmin: true, isActive: true, createdAt: true, _count: { select: { orders: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, page: currentPage, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) });
  } catch (err) {
    next(err);
  }
}

async function adminGetUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, isAdmin: true, isActive: true, createdAt: true, orders: { include: { items: true }, orderBy: { createdAt: 'desc' } }, membership: { include: { membership: true } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// ==================== Pages Admin ====================

async function adminGetPages(req, res, next) {
  try {
    const pages = await prisma.page.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ pages });
  } catch (err) {
    next(err);
  }
}

async function adminGetPage(req, res, next) {
  try {
    const page = await prisma.page.findUnique({ where: { id: req.params.id } });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json({ page });
  } catch (err) {
    next(err);
  }
}

async function adminCreatePage(req, res, next) {
  try {
    const { title, slug, content, excerpt, isPublished, template, metaTitle, metaDescription } = req.body;
    const page = await prisma.page.create({
      data: { title, slug: slug || slugify(title), content, excerpt, isPublished, template, metaTitle, metaDescription },
    });
    res.status(201).json({ page });
  } catch (err) {
    next(err);
  }
}

async function adminUpdatePage(req, res, next) {
  try {
    const { title, slug, content, excerpt, isPublished, template, metaTitle, metaDescription } = req.body;
    const data = { content, excerpt, isPublished, template, metaTitle, metaDescription };
    if (title) { data.title = title; data.slug = slug || slugify(title); }
    const page = await prisma.page.update({ where: { id: req.params.id }, data });
    res.json({ page });
  } catch (err) {
    next(err);
  }
}

async function adminDeletePage(req, res, next) {
  try {
    await prisma.page.delete({ where: { id: req.params.id } });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    next(err);
  }
}

// ==================== Banners Admin ====================

async function adminGetBanners(req, res, next) {
  try {
    const banners = await prisma.heroBanner.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ banners });
  } catch (err) {
    next(err);
  }
}

async function adminCreateBanner(req, res, next) {
  try {
    const { title, subtitle, imageDesktop, imageMobile, buttonText, buttonLink, isActive, sortOrder } = req.body;
    const banner = await prisma.heroBanner.create({
      data: { title, subtitle, imageDesktop, imageMobile, buttonText, buttonLink, isActive, sortOrder },
    });
    res.status(201).json({ banner });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateBanner(req, res, next) {
  try {
    const { title, subtitle, imageDesktop, imageMobile, buttonText, buttonLink, isActive, sortOrder } = req.body;
    const banner = await prisma.heroBanner.update({
      where: { id: req.params.id },
      data: { title, subtitle, imageDesktop, imageMobile, buttonText, buttonLink, isActive, sortOrder },
    });
    res.json({ banner });
  } catch (err) {
    next(err);
  }
}

async function adminDeleteBanner(req, res, next) {
  try {
    await prisma.heroBanner.delete({ where: { id: req.params.id } });
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
}

// ==================== Coupons Admin ====================

async function adminGetCoupons(req, res, next) {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ coupons });
  } catch (err) {
    next(err);
  }
}

async function adminCreateCoupon(req, res, next) {
  try {
    const { code, type, value, minOrderAmount, usageLimit, isActive, startsAt, expiresAt } = req.body;
    const coupon = await prisma.coupon.create({ data: { code, type, value, minOrderAmount, usageLimit, isActive, startsAt: startsAt ? new Date(startsAt) : null, expiresAt: expiresAt ? new Date(expiresAt) : null } });
    res.status(201).json({ coupon });
  } catch (err) {
    next(err);
  }
}

async function adminDeleteCoupon(req, res, next) {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
}

// ==================== Reviews Admin ====================

async function adminGetReviews(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      include: { product: { select: { name: true } }, user: { select: { email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

async function recalcProductRating(productId) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round((agg._avg.rating || 0) * 10) / 10,
      reviewCount: agg._count.rating,
    },
  });
}

async function adminApproveReview(req, res, next) {
  try {
    const review = await prisma.review.update({ where: { id: req.params.id }, data: { isApproved: true } });
    await recalcProductRating(review.productId);
    res.json({ message: 'Review approved' });
  } catch (err) {
    next(err);
  }
}

async function adminDeleteReview(req, res, next) {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    await prisma.review.delete({ where: { id: req.params.id } });
    await recalcProductRating(review.productId);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
}

// ==================== Settings ====================

async function adminGetSettings(req, res, next) {
  try {
    const settings = await prisma.siteSetting.findMany();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateSettings(req, res, next) {
  try {
    const { settings } = req.body;
    for (const { key, value, group } of settings) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: typeof value === 'string' ? value : JSON.stringify(value), group },
        create: { key, value: typeof value === 'string' ? value : JSON.stringify(value), group },
      });
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    next(err);
  }
}

// ==================== Media ====================

async function adminGetMedia(req, res, next) {
  try {
    const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ media });
  } catch (err) {
    next(err);
  }
}

async function adminUploadMedia(req, res, next) {
  try {
    const media = await prisma.media.create({
      data: {
        filename: req.file.originalname,
        url: `/uploads/general/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        folder: req.body.folder || 'general',
      },
    });
    res.status(201).json({ media });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  adminGetProducts, adminGetProduct, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminUploadProductImage, adminAddProductImageUrl, adminDeleteProductImage,
  adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminGetOrders, adminGetOrder, adminUpdateOrderStatus,
  adminGetUsers, adminGetUser,
  adminGetPages, adminGetPage, adminCreatePage, adminUpdatePage, adminDeletePage,
  adminGetBanners, adminCreateBanner, adminUpdateBanner, adminDeleteBanner,
  adminGetCoupons, adminCreateCoupon, adminDeleteCoupon,
  adminGetReviews, adminApproveReview, adminDeleteReview,
  adminGetSettings, adminUpdateSettings,
  adminGetMedia, adminUploadMedia,
};
