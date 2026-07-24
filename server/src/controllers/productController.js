const prisma = require('../config/database');
const { paginate, slugify } = require('../utils/helpers');

const productSelect = {
  id: true, name: true, slug: true, shortDesc: true, price: true, comparePrice: true,
  sku: true, stockQuantity: true, isActive: true, isFeatured: true, isNew: true,
  isBestSeller: true, rating: true, reviewCount: true, fragranceNotes: true,
  createdAt: true,
  images: { orderBy: { sortOrder: 'asc' } },
  categories: { include: { category: true } },
  variants: { orderBy: { sortOrder: 'asc' } },
};

const productDetailSelect = {
  ...productSelect,
  description: true, ingredients: true, howToUse: true, weight: true, dimensions: true,
};

// GET /api/products
async function getProducts(req, res, next) {
  try {
    const { page, limit, category, minPrice, maxPrice, sort, featured, isNew, bestseller, search } = req.query;
    const { skip, take, page: currentPage, limit: pageLimit } = paginate(page, limit);

    const where = { isActive: true };
    if (category) {
      where.categories = { some: { category: { slug: category } } };
    }
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (featured === 'true') where.isFeatured = true;
    if (isNew === 'true') where.isNew = true;
    if (bestseller === 'true') where.isBestSeller = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'name-asc') orderBy = { name: 'asc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, select: productSelect, orderBy, skip, take }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: currentPage, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/featured
async function getFeatured(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: productSelect,
      take: 8,
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/new
async function getNew(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isNew: true },
      select: productSelect,
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/bestsellers
async function getBestsellers(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      select: productSelect,
      take: 8,
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:slug
async function getProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      select: productDetailSelect,
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:slug/related
async function getRelated(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { categories: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const categoryIds = product.categories.map(c => c.categoryId);
    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      select: productSelect,
      take: 4,
    });
    res.json({ products: related });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getFeatured, getNew, getBestsellers, getProduct, getRelated };
