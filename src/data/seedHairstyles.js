/**
 * Seed script — populates the Hairstyle collection with real data.
 * Run: node src/data/seedHairstyles.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Hairstyle = require('../models/Hairstyle');

const hairstyles = [
  // ─── MEN ───────────────────────────────────────────────────────────────────
  {
    name: 'Classic Pompadour',
    description: 'Voluminous on top with short sides. A timeless style that adds height and works for formal and casual occasions.',
    gender: 'men',
    suitableFor: ['oval', 'round', 'oblong', 'diamond'],
    tags: ['Classic', 'Formal', 'Versatile', 'Volume'],
    trending: true,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
  },
  {
    name: 'Textured Quiff',
    description: 'Modern quiff with a textured finish. Works for casual and smart-casual occasions with a contemporary edge.',
    gender: 'men',
    suitableFor: ['oval', 'round', 'heart', 'diamond'],
    tags: ['Modern', 'Casual', 'Textured'],
    trending: true,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
  },
  {
    name: 'Slick Back Undercut',
    description: 'Sleek, polished look with shaved sides and slicked-back top. Sharp and professional.',
    gender: 'men',
    suitableFor: ['oval', 'round', 'square'],
    tags: ['Formal', 'Sleek', 'Undercut'],
    trending: false,
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80',
  },
  {
    name: 'High Fade + Volume Top',
    description: 'Height on top with tight sides creates an elongating effect. Ideal for round and square faces.',
    gender: 'men',
    suitableFor: ['round', 'square', 'heart'],
    tags: ['Height', 'Modern', 'Fade'],
    trending: true,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80',
  },
  {
    name: 'Crew Cut',
    description: 'Short, clean, and low-maintenance. Always in style and works for almost every face shape.',
    gender: 'men',
    suitableFor: ['oval', 'square', 'oblong'],
    tags: ['Short', 'Clean', 'Low-maintenance'],
    trending: false,
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=400&q=80',
  },
  {
    name: 'Curly Top Fade',
    description: 'Embrace natural curls on top with a clean fade on the sides. Adds volume and personality.',
    gender: 'men',
    suitableFor: ['oval', 'oblong', 'square'],
    tags: ['Curly', 'Fade', 'Natural'],
    trending: true,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=400&q=80',
  },
  {
    name: 'Faux Hawk',
    description: 'Central strip of height adds length to a round face. Bold and edgy without the full commitment.',
    gender: 'men',
    suitableFor: ['round', 'heart', 'oblong'],
    tags: ['Edgy', 'Height', 'Bold'],
    trending: false,
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80',
  },
  {
    name: 'Side Part Classic',
    description: 'A timeless side part with a clean line. Polished and professional, adds asymmetry to angular features.',
    gender: 'men',
    suitableFor: ['square', 'diamond', 'oval', 'heart'],
    tags: ['Classic', 'Asymmetric', 'Formal'],
    trending: false,
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=400&q=80',
  },
  {
    name: 'Textured Fringe',
    description: 'Fringe reduces forehead width and balances proportions. Great for heart and diamond face shapes.',
    gender: 'men',
    suitableFor: ['heart', 'diamond', 'oblong'],
    tags: ['Fringe', 'Balancing', 'Textured'],
    trending: true,
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Medium Length Shag',
    description: 'Layered shag with volume at the sides adds width to oblong and square faces. Relaxed and stylish.',
    gender: 'men',
    suitableFor: ['oblong', 'square', 'diamond'],
    tags: ['Shag', 'Layers', 'Volume'],
    trending: true,
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },

  // ─── WOMEN ─────────────────────────────────────────────────────────────────
  {
    name: 'Long Layers',
    description: 'Flowing layers that add movement and dimension to long hair. One of the most universally flattering styles.',
    gender: 'women',
    suitableFor: ['oval', 'round', 'square', 'oblong'],
    tags: ['Long', 'Elegant', 'Layers'],
    trending: false,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
  },
  {
    name: 'Classic Bob',
    description: 'Chin to shoulder length, clean and chic. A timeless classic that works beautifully for oval and heart faces.',
    gender: 'women',
    suitableFor: ['oval', 'heart', 'oblong', 'diamond'],
    tags: ['Classic', 'Chic', 'Bob'],
    trending: false,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
  },
  {
    name: 'Beach Waves',
    description: 'Effortless wavy texture for a relaxed, natural look. Ideal for square and heart faces.',
    gender: 'women',
    suitableFor: ['oval', 'square', 'heart', 'oblong'],
    tags: ['Wavy', 'Casual', 'Natural'],
    trending: true,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80',
  },
  {
    name: 'Pixie Cut',
    description: 'Short and bold — showcases your facial features perfectly. Best for oval and oblong faces.',
    gender: 'women',
    suitableFor: ['oval', 'oblong', 'square'],
    tags: ['Short', 'Bold', 'Low-maintenance'],
    trending: false,
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&q=80',
  },
  {
    name: 'Side-Swept Bangs',
    description: 'Soft side-swept bangs add a romantic touch and reduce the appearance of a wide forehead.',
    gender: 'women',
    suitableFor: ['oval', 'square', 'heart', 'diamond'],
    tags: ['Romantic', 'Soft', 'Bangs'],
    trending: false,
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
  },
  {
    name: 'High Bun',
    description: 'Adds vertical height to balance round proportions. Elegant and versatile for any occasion.',
    gender: 'women',
    suitableFor: ['round', 'heart', 'square'],
    tags: ['Height', 'Elegant', 'Updo'],
    trending: false,
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400&q=80',
  },
  {
    name: 'Curtain Bangs',
    description: 'Parted in the middle, frames the face and adds length. Trendy and flattering for oblong faces.',
    gender: 'women',
    suitableFor: ['round', 'oblong', 'diamond'],
    tags: ['Bangs', 'Framing', 'Trendy'],
    trending: true,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
  },
  {
    name: 'Layered Lob',
    description: 'Long bob with layers adds movement and length. Ideal for round and heart faces.',
    gender: 'women',
    suitableFor: ['round', 'heart', 'oval'],
    tags: ['Lob', 'Layers', 'Modern'],
    trending: true,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80',
  },
  {
    name: 'Soft Waves',
    description: 'Loose waves soften the strong jawline of a square face. Romantic and feminine.',
    gender: 'women',
    suitableFor: ['square', 'diamond', 'oval'],
    tags: ['Soft', 'Romantic', 'Waves'],
    trending: false,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
  },
  {
    name: 'Blunt Bob',
    description: 'Horizontal lines of a blunt bob add width to a long face. Bold and modern.',
    gender: 'women',
    suitableFor: ['oblong', 'oval'],
    tags: ['Bob', 'Width', 'Bold'],
    trending: false,
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1554519515-242161756769?w=400&q=80',
  },
  {
    name: 'Half-Up Half-Down',
    description: 'Keeps volume at the lower half to balance heart face proportions. Versatile and effortless.',
    gender: 'women',
    suitableFor: ['heart', 'diamond', 'oval'],
    tags: ['Half-Up', 'Balanced', 'Versatile'],
    trending: false,
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=400&q=80',
  },
  {
    name: 'Braided Crown',
    description: 'Crown braid adds width across the top of the head. Elegant and bohemian.',
    gender: 'women',
    suitableFor: ['oblong', 'oval', 'square'],
    tags: ['Braid', 'Crown', 'Bohemian'],
    trending: false,
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    name: 'Wispy Pixie',
    description: 'Soft, wispy pixie with texture to soften angular features. Delicate and feminine.',
    gender: 'women',
    suitableFor: ['square', 'heart', 'oval'],
    tags: ['Pixie', 'Textured', 'Soft'],
    trending: false,
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
  },
  {
    name: 'Shoulder-Length Waves',
    description: 'Waves at shoulder length add width and movement to long faces. Dynamic and flattering.',
    gender: 'women',
    suitableFor: ['oblong', 'diamond', 'oval'],
    tags: ['Waves', 'Width', 'Medium'],
    trending: true,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'hairmatch' });
    console.log('Connected to MongoDB');

    // Only delete the seeded hairstyles (those without userRatings) to preserve user-created ones
    const deleted = await Hairstyle.deleteMany({ userRatings: { $size: 0 }, totalRatings: 0 });
    console.log(`Cleared ${deleted.deletedCount} existing seed hairstyles`);

    const inserted = await Hairstyle.insertMany(hairstyles);
    console.log(`✅ Seeded ${inserted.length} hairstyles successfully`);

    const total = await Hairstyle.countDocuments();
    console.log(`Total hairstyles in DB: ${total}`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
