const prisma = require('../config/database');

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    const rootCategories = categories.filter(c => !c.parentId);
    res.json({ categories: rootCategories });
  } catch (err) {
    next(err);
  }
}

// GET /api/categories/:slug
async function getCategory(req, res, next) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { children: true, parent: true },
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, getCategory };
