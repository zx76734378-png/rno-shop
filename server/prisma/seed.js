const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // ==================== Clean ====================
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.heroBanner.deleteMany();
  await prisma.page.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.userMembership.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.address.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();

  // ==================== Users ====================
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@rno-shop.com', passwordHash, firstName: 'RNO', lastName: 'Admin', isAdmin: true },
  });

  const customer = await prisma.user.create({
    data: { email: 'customer@example.com', passwordHash, firstName: 'Jane', lastName: 'Doe' },
  });

  console.log('✓ Users created');

  // ==================== Categories ====================
  const cats = await Promise.all([
    prisma.category.create({ data: { name: 'Home Fragrance', slug: 'home-fragrance', description: 'Candles, room sprays, and incense for the home', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'Body Care', slug: 'body-care', description: 'Soaps, lotions, and body washes made with botanical ingredients', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Hand Care', slug: 'hand-care', description: 'Hand soaps and hand lotions', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Bath Essentials', slug: 'bath-essentials', description: 'Bath soaks, bath sets, and botanical bath products', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Skincare', slug: 'skincare', description: 'Botanical-based skincare formulations', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Pantry', slug: 'pantry', description: 'Olive oils, honey, preserves, and culinary delights', sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Garden', slug: 'garden', description: 'Fresh produce, flowers, and garden essentials', sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Home Goods', slug: 'home-goods', description: 'Dish soaps, surface cleaners, and home care', sortOrder: 8 } }),
    prisma.category.create({ data: { name: 'Gift Sets', slug: 'gift-sets', description: 'Curated gift collections for every occasion', sortOrder: 9 } }),
  ]);

  console.log('✓ Categories created');

  // ==================== Products ====================
  const products = [
    { name: 'Roma Heirloom Tomato Candle', slug: 'roma-heirloom-tomato-candle', price: 64, comparePrice: null, fragranceNotes: 'Tomato vine, basil, green leaves', shortDesc: 'Our signature candle. Earthy, green, and unexpectedly captivating.', description: '<p>Inspired by the heirloom tomatoes growing in our garden, this candle captures the essence of a Mediterranean summer. Notes of tomato vine, fresh basil, and green leaves create an unexpectedly captivating fragrance that fills any room with warmth.</p><p>Hand-poured in Los Angeles using a blend of vegetable wax and essential oils.</p>', stockQuantity: 100, isFeatured: true, isBestSeller: true, images: ['https://picsum.photos/seed/tomato-candle-1/800/1000', 'https://picsum.photos/seed/tomato-candle-2/800/1000', 'https://picsum.photos/seed/tomato-candle-3/800/1000'], variants: [{ name: '8 oz', price: 64, stockQuantity: 50 }, { name: '16 oz', price: 98, stockQuantity: 30 }], categories: [0, 8] },
    { name: 'Jasmine & Damask Rose Candle', slug: 'jasmine-damask-rose-candle', price: 68, comparePrice: null, fragranceNotes: 'Jasmine, Damask rose, sandalwood', shortDesc: 'A luxurious floral blend that transforms any space into a garden sanctuary.', description: '<p>A sophisticated blend of night-blooming jasmine and precious Damask rose, grounded with warm sandalwood. This candle creates an atmosphere of timeless elegance.</p><p>Hand-poured in Los Angeles using a blend of vegetable wax and essential oils.</p>', stockQuantity: 80, isFeatured: true, isBestSeller: true, images: ['https://picsum.photos/seed/jasmine-rose-1/800/1000', 'https://picsum.photos/seed/jasmine-rose-2/800/1000'], variants: [{ name: '8 oz', price: 68, stockQuantity: 40 }], categories: [0, 8] },
    { name: 'Douglas Fir & Vetiver Candle', slug: 'douglas-fir-vetiver-candle', price: 62, fragranceNotes: 'Douglas fir, vetiver, cedarwood', shortDesc: 'Forest floor meets mountain air. Grounding and refreshing.', description: '<p>Walk through a Pacific Northwest forest with this grounding blend of Douglas fir, earthy vetiver, and warm cedarwood.</p>', stockQuantity: 60, isFeatured: true, images: ['https://picsum.photos/seed/fir-candle-1/800/1000', 'https://picsum.photos/seed/fir-candle-2/800/1000'], variants: [{ name: '8 oz', price: 62, stockQuantity: 35 }], categories: [0] },
    { name: 'Rosemary & Clary Sage Body Wash', slug: 'rosemary-clary-sage-body-wash', price: 42, shortDesc: 'Invigorating botanical body wash that cleanses without stripping.', description: '<p>Start your morning with this energizing blend of rosemary and clary sage. Our gentle formula cleanses without stripping your skin of its natural oils.</p>', stockQuantity: 120, isFeatured: true, isNew: true, images: ['https://picsum.photos/seed/rosemary-wash-1/800/1000', 'https://picsum.photos/seed/rosemary-wash-2/800/1000'], variants: [{ name: '8 oz', price: 42, stockQuantity: 80 }, { name: '16 oz', price: 68, stockQuantity: 40 }], categories: [1] },
    { name: 'Manuka Rich Cream', slug: 'manuka-rich-cream', price: 48, comparePrice: null, shortDesc: 'Deeply nourishing cream with Manuka honey and botanicals.', description: '<p>A deeply nourishing cream formulated with Manuka honey, shea butter, and a blend of restorative botanicals. Rich yet fast-absorbing, it leaves skin feeling soft, smooth, and radiant.</p>', stockQuantity: 90, isFeatured: true, isBestSeller: true, images: ['https://picsum.photos/seed/manuka-cream-1/800/1000', 'https://picsum.photos/seed/manuka-cream-2/800/1000'], variants: [{ name: '2 oz', price: 48, stockQuantity: 50 }, { name: '4 oz', price: 82, stockQuantity: 40 }], categories: [1, 4] },
    { name: 'Garden Essentials Soap Brick', slug: 'garden-essentials-soap-brick', price: 28, shortDesc: 'Triple-milled vegetable soap with garden-fresh botanicals.', description: '<p>A generous triple-milled soap brick that lasts and lasts. Made with pure vegetable oils and scented with garden-fresh botanicals.</p>', stockQuantity: 200, isFeatured: false, isNew: true, images: ['https://picsum.photos/seed/soap-brick-1/800/1000', 'https://picsum.photos/seed/soap-brick-2/800/1000'], variants: [{ name: 'Rosemary', stockQuantity: 70 }, { name: 'Lavender', stockQuantity: 70 }, { name: 'Unscented', stockQuantity: 60 }], categories: [1, 8] },
    { name: 'Botanical Hand Soap', slug: 'botanical-hand-soap', price: 36, shortDesc: 'Gentle hand soap infused with botanical extracts.', description: '<p>A gentle, non-drying hand soap infused with a blend of botanical extracts. Leaves hands clean, soft, and lightly scented.</p>', stockQuantity: 150, images: ['https://picsum.photos/seed/hand-soap-1/800/1000', 'https://picsum.photos/seed/hand-soap-2/800/1000'], variants: [{ name: 'Rosemary Clary Sage', price: 36, stockQuantity: 50 }, { name: 'Fleur de Citron', price: 36, stockQuantity: 50 }, { name: 'Garden Essentials', price: 36, stockQuantity: 50 }], categories: [2] },
    { name: 'Botanical Hand Lotion', slug: 'botanical-hand-lotion', price: 34, shortDesc: 'Lightweight, fast-absorbing hand lotion.', description: '<p>Keep your hands soft and nourished with this lightweight, fast-absorbing lotion. Formulated with shea butter and botanical extracts.</p>', stockQuantity: 130, images: ['https://picsum.photos/seed/hand-lotion-1/800/1000'], variants: [{ name: 'Rosemary Clary Sage', price: 34, stockQuantity: 45 }, { name: 'Fleur de Citron', price: 34, stockQuantity: 45 }], categories: [2] },
    { name: 'Bath Soak – Lavender & Eucalyptus', slug: 'bath-soak-lavender-eucalyptus', price: 45, shortDesc: 'Mineral-rich bath soak for deep relaxation.', description: '<p>Unwind after a long day with this mineral-rich bath soak. Lavender calms the mind while eucalyptus clears the senses. Epsom and dead sea salts soothe tired muscles.</p>', stockQuantity: 70, isNew: true, images: ['https://picsum.photos/seed/bath-soak-1/800/1000'], variants: [{ name: '16 oz', price: 45, stockQuantity: 70 }], categories: [3] },
    { name: 'Extra Virgin Olive Oil', slug: 'extra-virgin-olive-oil', price: 38, shortDesc: 'Cold-pressed from our own olive trees in Los Angeles.', description: '<p>Harvested and cold-pressed from the century-old olive trees growing on the Estate. This oil is grassy, peppery, and incredibly fresh. Use it to finish salads, drizzle over roasted vegetables, or simply dip with bread.</p>', stockQuantity: 50, isFeatured: true, images: ['https://picsum.photos/seed/olive-oil-1/800/1000', 'https://picsum.photos/seed/olive-oil-2/800/1000'], variants: [{ name: '500ml', price: 38, stockQuantity: 50 }], categories: [5] },
    { name: 'Wildflower Honey', slug: 'wildflower-honey', price: 28, shortDesc: 'Raw, unfiltered honey from our Estate hives.', description: '<p>Our bees forage on the wildflowers, herbs, and fruit trees of the Estate, producing this complex, aromatic honey. Raw and unfiltered, it captures the taste of our garden in every jar.</p>', stockQuantity: 40, isFeatured: true, images: ['https://picsum.photos/seed/honey-1/800/1000', 'https://picsum.photos/seed/honey-2/800/1000'], variants: [{ name: '8 oz', price: 28, stockQuantity: 40 }], categories: [5] },
    { name: 'Organic Tomato Preserves', slug: 'organic-tomato-preserves', price: 22, shortDesc: 'Slow-cooked heirloom tomato preserves from our garden.', description: '<p>Made from the same heirloom tomatoes that inspired our signature candle. These preserves are slow-cooked in small batches with a touch of sugar and spices. Perfect on crusty bread with goat cheese.</p>', stockQuantity: 30, images: ['https://picsum.photos/seed/preserves-1/800/1000'], variants: [{ name: '12 oz', price: 22, stockQuantity: 30 }], categories: [5] },
    { name: 'Room Spray – Clarity', slug: 'room-spray-clarity', price: 44, shortDesc: 'Instant atmosphere. A few spritzes transform any room.', description: '<p>Our Clarity room spray combines rosemary, peppermint, and lemon to sharpen focus and create a clean, energized atmosphere.</p>', stockQuantity: 80, images: ['https://picsum.photos/seed/spray-clarity-1/800/1000'], variants: [{ name: '4 oz', price: 44, stockQuantity: 80 }], categories: [0] },
    { name: 'Room Spray – Euphoria', slug: 'room-spray-euphoria', price: 44, shortDesc: 'Uplifting and joyful. A burst of citrus and florals.', description: '<p>Euphoria blends bergamot, neroli, and jasmine for an uplifting, joyful atmosphere that brightens any space.</p>', stockQuantity: 65, images: ['https://picsum.photos/seed/spray-euphoria-1/800/1000'], variants: [{ name: '4 oz', price: 44, stockQuantity: 65 }], categories: [0] },
    { name: 'Dish Soap – Garden Essentials', slug: 'dish-soap-garden-essentials', price: 24, shortDesc: 'Plant-based dish soap that actually works.', description: '<p>A powerful plant-based dish soap that cuts through grease while being gentle on your hands and the planet. Scented with garden-fresh herbs.</p>', stockQuantity: 100, images: ['https://picsum.photos/seed/dish-soap-1/800/1000'], variants: [{ name: '16 oz', price: 24, stockQuantity: 100 }], categories: [7] },
    { name: 'Surface Cleaner – Rosemary', slug: 'surface-cleaner-rosemary', price: 22, shortDesc: 'Non-toxic multi-surface cleaner with rosemary.', description: '<p>An effective, non-toxic cleaner for all surfaces. Rosemary essential oil provides natural antibacterial properties and a fresh, clean scent.</p>', stockQuantity: 90, images: ['https://picsum.photos/seed/surface-cleaner-1/800/1000'], variants: [{ name: '16 oz', price: 22, stockQuantity: 90 }], categories: [7] },
    { name: 'The Estate Gift Set', slug: 'estate-gift-set', price: 148, comparePrice: 180, shortDesc: 'Our signature collection in a beautiful gift box.', description: '<p>The perfect introduction to RNO-SHOP. Includes our Roma Heirloom Tomato Candle, Garden Essentials Soap Brick, Botanical Hand Soap, and Botanical Hand Lotion in a beautiful gift box.</p>', stockQuantity: 25, isBestSeller: true, images: ['https://picsum.photos/seed/gift-set-1/800/1000', 'https://picsum.photos/seed/gift-set-2/800/1000'], categories: [8] },
    { name: 'Exfoliating Body Scrub', slug: 'exfoliating-body-scrub', price: 52, shortDesc: 'Sea salt and botanical oil scrub for silky smooth skin.', description: '<p>A luxurious body scrub blending fine sea salt with a nourishing cocktail of jojoba, almond, and olive oils. Gently exfoliates while deeply moisturizing.</p>', stockQuantity: 55, isNew: true, images: ['https://picsum.photos/seed/body-scrub-1/800/1000'], variants: [{ name: '8 oz', price: 52, stockQuantity: 55 }], categories: [1] },
    { name: 'Fleur de Citron Candle', slug: 'fleur-de-citron-candle', price: 62, shortDesc: 'Bright citrus blossoms with a warm, sunny finish.', description: '<p>Sun-warmed citrus trees in bloom. This candle captures the essence of a Mediterranean lemon grove with notes of lemon blossom, petitgrain, and a hint of honey.</p>', stockQuantity: 70, images: ['https://picsum.photos/seed/citron-candle-1/800/1000', 'https://picsum.photos/seed/citron-candle-2/800/1000'], variants: [{ name: '8 oz', price: 62, stockQuantity: 70 }], categories: [0] },
    { name: 'Adriatic Muscatel Sage Candle', slug: 'adriatic-muscatel-sage-candle', price: 66, shortDesc: 'Herbaceous sage with sun-warmed Adriatic coastal breeze.', description: '<p>Inspired by the wild sage that grows along the Adriatic coast. Clean, herbaceous, and transporting.</p>', stockQuantity: 45, images: ['https://picsum.photos/seed/sage-candle-1/800/1000'], variants: [{ name: '8 oz', price: 66, stockQuantity: 45 }], categories: [0] },
  ];

  for (const p of products) {
    const { images, variants, categories, ...productData } = p;
    const product = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images.map((url, i) => ({ url, altText: `${productData.name} - Image ${i + 1}`, sortOrder: i, isPrimary: i === 0 })),
        },
        variants: variants ? {
          create: variants.map((v, i) => ({ name: v.name, price: v.price || null, stockQuantity: v.stockQuantity, sortOrder: i })),
        } : undefined,
        categories: {
          create: categories.map(ci => ({ categoryId: cats[ci].id })),
        },
      },
    });
    console.log(`  ✓ ${product.name}`);
  }

  console.log('✓ Products created');

  // ==================== Hero Banners ====================
  await prisma.heroBanner.createMany({
    data: [
      { title: 'The Home for Radical Pleasure', subtitle: 'Discover our collection of botanically-driven fragrances, body care, and pantry essentials.', imageDesktop: 'https://picsum.photos/seed/hero-1/1440/800', imageMobile: 'https://picsum.photos/seed/hero-1/750/1000', buttonText: 'Shop All', buttonLink: '/shop', sortOrder: 1 },
      { title: 'The Roma Heirloom Tomato Candle', subtitle: 'Our signature scent. Earthy, green, and unexpectedly captivating.', imageDesktop: 'https://picsum.photos/seed/hero-2/1440/800', imageMobile: 'https://picsum.photos/seed/hero-2/750/1000', buttonText: 'Shop Now', buttonLink: '/products/roma-heirloom-tomato-candle', sortOrder: 2 },
      { title: 'Gifts from the Garden', subtitle: 'Curated gift sets featuring our most-loved products.', imageDesktop: 'https://picsum.photos/seed/hero-3/1440/800', imageMobile: 'https://picsum.photos/seed/hero-3/750/1000', buttonText: 'Explore Gifts', buttonLink: '/collections/gift-sets', sortOrder: 3 },
    ],
  });

  console.log('✓ Hero banners created');

  // ==================== Pages ====================
  await prisma.page.createMany({
    data: [
      {
        title: 'The Estate', slug: 'the-estate', isPublished: true, sortOrder: 1,
        content: `<h2>Welcome to RNO-SHOP</h2><p>RNO-SHOP is your destination for international modern home essentials. We curate the finest fragrances, body care, and home goods from around the world.</p><p>Every product in our collection is selected for its quality, craftsmanship, and ability to elevate your daily rituals. From luxury candles to organic pantry staples, we bring you the best of modern living.</p><h3>Our Philosophy</h3><p>We believe that quality living starts at home. We partner with artisans and brands who share our commitment to excellence, sustainability, and timeless design.</p>`,
        metaTitle: 'The Estate - RNO-SHOP', metaDescription: 'Discover the story behind RNO-SHOP, your destination for international modern home essentials.'
      },
      {
        title: 'FAQ', slug: 'faq', isPublished: true, sortOrder: 2,
        content: `<h2>Frequently Asked Questions</h2>`,
        metaTitle: 'FAQ - RNO-SHOP', metaDescription: 'Frequently asked questions about RNO-SHOP products, shipping, and returns.'
      },
      {
        title: 'The RNO Fund', slug: 'the-rno-fund', isPublished: true, sortOrder: 3,
        content: `<h2>The RNO Fund</h2><p>The RNO Fund supports communities and environmental initiatives around the world. A portion of every purchase goes directly to causes we care about.</p><p>When you shop at RNO-SHOP, you're not just bringing beauty into your home — you're helping to make a positive impact on communities and the planet.</p>`,
        metaTitle: 'The RNO Fund - RNO-SHOP', metaDescription: 'Learn about the RNO Fund, supporting communities and environmental initiatives.'
      },
    ],
  });

  console.log('✓ Pages created');

  // ==================== FAQs ====================
  await prisma.fAQ.createMany({
    data: [
      { question: 'Where are your products made?', answer: 'All of our products are made in Los Angeles, California, using ingredients sourced from over 125 small farms and collaborators.', category: 'Products', sortOrder: 1 },
      { question: 'Are your products cruelty-free?', answer: 'Yes. We never test on animals and all of our products are 100% cruelty-free.', category: 'Products', sortOrder: 2 },
      { question: 'What is your return policy?', answer: 'We offer free returns within 30 days for eligible (unused) candles. Pantry items, body care, soaps, skincare, and personalized items are final sale.', category: 'Shipping & Returns', sortOrder: 3 },
      { question: 'Do you offer local delivery?', answer: 'Yes! We offer local delivery in Los Angeles on Fridays for $15, and same-day delivery Monday through Friday for $30.', category: 'Shipping & Returns', sortOrder: 4 },
      { question: 'How long does shipping take?', answer: 'Standard shipping takes 3-7 business days within the continental US. Express shipping takes 1-2 business days.', category: 'Shipping & Returns', sortOrder: 5 },
      { question: 'What is the Estate Membership?', answer: 'The Estate Membership is our annual subscription program. Members receive free shipping on all orders, seasonal gifts, 20% off gift sets, and exclusive access to limited-edition products.', category: 'Membership', sortOrder: 6 },
      { question: 'Can I visit the store?', answer: 'RNO-SHOP is an online-only store. We occasionally host seasonal pop-up shops and events — sign up for our newsletter to stay informed.', category: 'General', sortOrder: 7 },
      { question: 'How can I contact customer service?', answer: 'You can reach our team at hello@rno-shop.com, Monday through Friday, 10am to 5pm.', category: 'General', sortOrder: 8 },
    ],
  });

  console.log('✓ FAQs created');

  // ==================== Membership ====================
  await prisma.membership.create({
    data: {
      name: 'Estate Membership', slug: 'estate-membership', price: 95, durationMonths: 12,
      description: 'Join RNO-SHOP and enjoy a year of premium benefits: free shipping, seasonal gifts, exclusive discounts, and more.',
      benefits: JSON.stringify(['Free shipping on every order', 'Seasonal gifts (4 per year)', '20% off gift sets', 'Early access to new products', 'Exclusive member-only products']),
    },
  });

  console.log('✓ Memberships created');

  // ==================== Coupon ====================
  await prisma.coupon.create({
    data: { code: 'WELCOME10', type: 'percentage', value: 10, usageLimit: 100, isActive: true },
  });

  console.log('✓ Coupons created');

  // ==================== Site Settings ====================
  await prisma.siteSetting.createMany({
    data: [
      { key: 'site_name', value: 'RNO-SHOP', group: 'general' },
      { key: 'tagline', value: 'International Modern Home', group: 'general' },
      { key: 'contact_email', value: 'hello@rno-shop.com', group: 'general' },
      { key: 'contact_phone', value: '', group: 'general' },
      { key: 'shipping_standard_fee', value: '10', group: 'shipping' },
      { key: 'shipping_express_fee', value: '25', group: 'shipping' },
      { key: 'shipping_local_friday_fee', value: '15', group: 'shipping' },
      { key: 'shipping_local_same_day_fee', value: '30', group: 'shipping' },
      { key: 'tax_rate', value: '0.0875', group: 'tax' },
      { key: 'currency', value: 'USD', group: 'general' },
    ],
  });

  console.log('✓ Site settings created');

  // ==================== Customer Address ====================
  await prisma.address.create({
    data: {
      userId: customer.id, label: 'Home', firstName: 'Jane', lastName: 'Doe',
      street: '1234 Sunset Boulevard', apartment: 'Apt 5', city: 'Los Angeles', state: 'CA', zipCode: '90028', isDefault: true,
    },
  });

  console.log('✓ Sample address created');

  console.log('\n✅ Seed complete!');
  console.log('   Admin: admin@rno-shop.com / password123');
  console.log('   Customer: customer@example.com / password123\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
