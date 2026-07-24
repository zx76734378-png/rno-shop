const prisma = require('../config/database');

// GET /api/pages/:slug
async function getPage(req, res, next) {
  try {
    const page = await prisma.page.findUnique({ where: { slug: req.params.slug } });
    if (!page || !page.isPublished) return res.status(404).json({ error: 'Page not found' });
    res.json({ page });
  } catch (err) {
    next(err);
  }
}

// GET /api/hero-banners
async function getHeroBanners(req, res, next) {
  try {
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ banners });
  } catch (err) {
    next(err);
  }
}

// GET /api/faqs
async function getFaqs(req, res, next) {
  try {
    const { category } = req.query;
    const where = { isPublished: true };
    if (category) where.category = category;
    const faqs = await prisma.fAQ.findMany({ where, orderBy: { sortOrder: 'asc' } });
    res.json({ faqs });
  } catch (err) {
    next(err);
  }
}

// GET /api/site-settings
async function getSiteSettings(req, res, next) {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json({ settings: result });
  } catch (err) {
    next(err);
  }
}

// GET /api/memberships
async function getMemberships(req, res, next) {
  try {
    const memberships = await prisma.membership.findMany({ where: { isActive: true } });
    res.json({ memberships });
  } catch (err) {
    next(err);
  }
}

// POST /api/memberships/subscribe
async function subscribeMembership(req, res, next) {
  try {
    const { membershipId } = req.body;
    const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
    if (!membership) return res.status(404).json({ error: 'Membership not found' });

    const existing = await prisma.userMembership.findUnique({ where: { userId: req.user.id } });
    if (existing?.isActive) return res.status(400).json({ error: 'Already an active member' });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + membership.durationMonths);

    const userMembership = await prisma.userMembership.upsert({
      where: { userId: req.user.id },
      update: { membershipId: membership.id, startDate: new Date(), endDate, isActive: true },
      create: { userId: req.user.id, membershipId: membership.id, startDate: new Date(), endDate },
    });

    res.status(201).json({ membership: userMembership, message: 'Welcome to RNO-SHOP!' });
  } catch (err) {
    next(err);
  }
}

// POST /api/newsletter/subscribe
async function subscribeNewsletter(req, res, next) {
  try {
    const { email } = req.body;
    await prisma.subscriber.upsert({
      where: { email },
      update: { isActive: true, subscribedAt: new Date() },
      create: { email },
    });
    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
async function createReview(req, res, next) {
  try {
    const { productId, rating, title, body } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId, userId: req.user.id } },
    });
    if (existing) return res.status(400).json({ error: 'You already reviewed this product' });

    const review = await prisma.review.create({
      data: { productId, userId: req.user.id, rating, title, body },
    });

    // Update product aggregate rating
    const agg = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: { rating: Math.round((agg._avg.rating || 0) * 10) / 10, reviewCount: agg._count.rating },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:productId/reviews
async function getProductReviews(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId, isApproved: true },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPage, getHeroBanners, getFaqs, getSiteSettings, getMemberships, subscribeMembership, subscribeNewsletter, createReview, getProductReviews };
