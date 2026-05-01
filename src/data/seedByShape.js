/**
 * Adds 3 men + 3 women hairstyles for EACH of the 6 face shapes.
 * Each hairstyle has that shape as its FIRST (primary) suitableFor entry.
 * Run: node src/data/seedByShape.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Hairstyle = require('../models/Hairstyle');

const data = [

  // ════════════════════════════════════════════════════════════
  // OVAL — men
  // ════════════════════════════════════════════════════════════
  {
    name: 'Ivy League Cut',
    description: 'A longer crew cut with a side part. Clean, versatile, and works perfectly with oval proportions.',
    gender: 'men', suitableFor: ['oval', 'square'], tags: ['Classic', 'Preppy', 'Versatile'],
    trending: false, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  },
  {
    name: 'French Crop',
    description: 'Short on the sides with a textured fringe on top. Effortlessly stylish for oval faces.',
    gender: 'men', suitableFor: ['oval', 'heart'], tags: ['Modern', 'Fringe', 'Short'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80',
  },
  {
    name: 'Buzz Cut',
    description: 'Uniform short length all over. Highlights the balanced proportions of an oval face beautifully.',
    gender: 'men', suitableFor: ['oval', 'oblong'], tags: ['Short', 'Minimal', 'Bold'],
    trending: false, rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // OVAL — women
  // ════════════════════════════════════════════════════════════
  {
    name: 'Sleek Straight',
    description: 'Pin-straight hair with a center or side part. Showcases the balanced proportions of an oval face.',
    gender: 'women', suitableFor: ['oval', 'oblong'], tags: ['Sleek', 'Polished', 'Straight'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  },
  {
    name: 'Voluminous Blowout',
    description: 'Full, bouncy blowout with volume at the roots. Glamorous and flattering on oval faces.',
    gender: 'women', suitableFor: ['oval', 'round'], tags: ['Volume', 'Glamorous', 'Blowout'],
    trending: true, rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  },
  {
    name: 'Shaggy Layers',
    description: 'Choppy, layered cut with a lived-in texture. Adds personality and movement to oval faces.',
    gender: 'women', suitableFor: ['oval', 'square'], tags: ['Shaggy', 'Layers', 'Textured'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // ROUND — men
  // ════════════════════════════════════════════════════════════
  {
    name: 'High Top Fade',
    description: 'Flat top with a high fade. The vertical height dramatically elongates a round face.',
    gender: 'men', suitableFor: ['round', 'square'], tags: ['Height', 'Fade', 'Bold'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1583195764036-46f3e6b7e5e5?w=400&q=80',
  },
  {
    name: 'Slicked Back Fade',
    description: 'Hair combed straight back with a clean fade. Creates length and a sharp, defined look.',
    gender: 'men', suitableFor: ['round', 'oval'], tags: ['Sleek', 'Fade', 'Sharp'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
  },
  {
    name: 'Angular Fringe',
    description: 'Diagonal fringe that cuts across the forehead. Adds angles to soften the roundness.',
    gender: 'men', suitableFor: ['round', 'heart'], tags: ['Angular', 'Fringe', 'Modern'],
    trending: false, rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // ROUND — women
  // ════════════════════════════════════════════════════════════
  {
    name: 'Long Side Part',
    description: 'Long hair with a deep side part. Creates asymmetry that slims and elongates a round face.',
    gender: 'women', suitableFor: ['round', 'oval'], tags: ['Long', 'Asymmetric', 'Slimming'],
    trending: false, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&q=80',
  },
  {
    name: 'Waterfall Braid',
    description: 'Cascading braid that adds vertical flow. Draws the eye downward to elongate a round face.',
    gender: 'women', suitableFor: ['round', 'heart'], tags: ['Braid', 'Romantic', 'Elegant'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=400&q=80',
  },
  {
    name: 'Asymmetric Bob',
    description: 'Bob that is longer on one side. The diagonal line creates the illusion of a slimmer face.',
    gender: 'women', suitableFor: ['round', 'square'], tags: ['Bob', 'Asymmetric', 'Edgy'],
    trending: true, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1554519515-242161756769?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // SQUARE — men
  // ════════════════════════════════════════════════════════════
  {
    name: 'Loose Waves',
    description: 'Medium-length hair with loose, natural waves. Softens the strong jawline of a square face.',
    gender: 'men', suitableFor: ['square', 'oval'], tags: ['Waves', 'Soft', 'Natural'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
  {
    name: 'Taper Fade with Curls',
    description: 'Natural curls on top with a taper fade. The soft curls contrast beautifully with a square jaw.',
    gender: 'men', suitableFor: ['square', 'round'], tags: ['Curly', 'Fade', 'Soft'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=400&q=80',
  },
  {
    name: 'Disconnected Undercut',
    description: 'Shaved sides with longer, textured top. The contrast adds visual interest and softens angles.',
    gender: 'men', suitableFor: ['square', 'oblong'], tags: ['Undercut', 'Edgy', 'Textured'],
    trending: true, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // SQUARE — women
  // ════════════════════════════════════════════════════════════
  {
    name: 'Loose Updo',
    description: 'Relaxed updo with face-framing pieces. Softens the jaw while keeping hair elegant.',
    gender: 'women', suitableFor: ['square', 'heart'], tags: ['Updo', 'Elegant', 'Soft'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400&q=80',
  },
  {
    name: 'Textured Lob',
    description: 'Long bob with choppy, textured ends. The movement softens the strong jawline.',
    gender: 'women', suitableFor: ['square', 'oval'], tags: ['Lob', 'Textured', 'Modern'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80',
  },
  {
    name: 'Romantic Curls',
    description: 'Full, romantic curls that cascade past the shoulders. Softens angular features beautifully.',
    gender: 'women', suitableFor: ['square', 'diamond'], tags: ['Curly', 'Romantic', 'Volume'],
    trending: false, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // HEART — men
  // ════════════════════════════════════════════════════════════
  {
    name: 'Quiff with Fade',
    description: 'Volume on top with a clean fade. Keeps the top moderate to avoid emphasizing the wide forehead.',
    gender: 'men', suitableFor: ['heart', 'oval'], tags: ['Quiff', 'Fade', 'Modern'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
  },
  {
    name: 'Curtain Hair',
    description: 'Medium-length hair parted in the middle, falling to either side. Reduces forehead width naturally.',
    gender: 'men', suitableFor: ['heart', 'oblong'], tags: ['Curtain', 'Retro', 'Soft'],
    trending: true, rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Stubble + Short Back',
    description: 'Short hair with a beard. The beard adds width to the narrow chin, perfectly balancing a heart face.',
    gender: 'men', suitableFor: ['heart', 'square'], tags: ['Beard', 'Short', 'Balancing'],
    trending: false, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // HEART — women
  // ════════════════════════════════════════════════════════════
  {
    name: 'Chin-Length Bob',
    description: 'Bob cut at chin level adds width at the jaw to balance the narrow chin of a heart face.',
    gender: 'women', suitableFor: ['heart', 'diamond'], tags: ['Bob', 'Balancing', 'Chic'],
    trending: false, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
  },
  {
    name: 'Lob with Waves',
    description: 'Long bob with waves at the ends adds volume near the jaw to balance the wider forehead.',
    gender: 'women', suitableFor: ['heart', 'round'], tags: ['Lob', 'Waves', 'Volume'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80',
  },
  {
    name: 'Layered Pixie',
    description: 'Textured pixie with volume at the sides near the jaw. Balances the heart shape beautifully.',
    gender: 'women', suitableFor: ['heart', 'oval'], tags: ['Pixie', 'Textured', 'Bold'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // OBLONG — men
  // ════════════════════════════════════════════════════════════
  {
    name: 'Side Part with Volume',
    description: 'Volume on the sides with a side part adds width to a long face. Classic and polished.',
    gender: 'men', suitableFor: ['oblong', 'oval'], tags: ['Volume', 'Width', 'Classic'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=400&q=80',
  },
  {
    name: 'Afro Style',
    description: 'Natural afro with volume on the sides adds width beautifully to an oblong face.',
    gender: 'men', suitableFor: ['oblong', 'round'], tags: ['Afro', 'Natural', 'Volume'],
    trending: false, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1583195764036-46f3e6b7e5e5?w=400&q=80',
  },
  {
    name: 'Blunt Fringe Cut',
    description: 'Short cut with a blunt fringe. The horizontal fringe line breaks up the length of an oblong face.',
    gender: 'men', suitableFor: ['oblong', 'heart'], tags: ['Fringe', 'Short', 'Shortening'],
    trending: false, rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // OBLONG — women
  // ════════════════════════════════════════════════════════════
  {
    name: 'Side-Parted Layers',
    description: 'Layers with a side part add volume at the sides to widen an oblong face.',
    gender: 'women', suitableFor: ['oblong', 'diamond'], tags: ['Layers', 'Volume', 'Side-Part'],
    trending: false, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
  },
  {
    name: 'Full Fringe',
    description: 'Straight-across full fringe shortens the appearance of a long face dramatically.',
    gender: 'women', suitableFor: ['oblong', 'square'], tags: ['Fringe', 'Shortening', 'Bold'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
  },
  {
    name: 'Voluminous Curls',
    description: 'Big, voluminous curls add width on the sides to balance the length of an oblong face.',
    gender: 'women', suitableFor: ['oblong', 'heart'], tags: ['Curly', 'Volume', 'Width'],
    trending: false, rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // DIAMOND — men
  // ════════════════════════════════════════════════════════════
  {
    name: 'Side-Swept Fringe',
    description: 'Fringe swept to one side adds width to the narrow forehead of a diamond face.',
    gender: 'men', suitableFor: ['diamond', 'heart'], tags: ['Fringe', 'Width', 'Soft'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80',
  },
  {
    name: 'Classic Pompadour',
    description: 'Height and width at the top balances the narrow forehead of a diamond face.',
    gender: 'men', suitableFor: ['diamond', 'oval'], tags: ['Pompadour', 'Classic', 'Volume'],
    trending: true, rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
  },
  {
    name: 'Medium Shag',
    description: 'Layered shag with volume at the top and bottom balances the wide cheekbones.',
    gender: 'men', suitableFor: ['diamond', 'oblong'], tags: ['Shag', 'Balanced', 'Layers'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },

  // ════════════════════════════════════════════════════════════
  // DIAMOND — women
  // ════════════════════════════════════════════════════════════
  {
    name: 'Layered Waves',
    description: 'Layers add volume at the top and bottom, balancing the wide cheekbones of a diamond face.',
    gender: 'women', suitableFor: ['diamond', 'square'], tags: ['Waves', 'Balanced', 'Layers'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
  },
  {
    name: 'Half-Up with Volume',
    description: 'Volume at the crown adds width to the forehead while the loose lower half balances the chin.',
    gender: 'women', suitableFor: ['diamond', 'heart'], tags: ['Half-Up', 'Volume', 'Balanced'],
    trending: false, rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  },
  {
    name: 'Textured Bob with Bangs',
    description: 'Bob with side-swept bangs adds width to the forehead and chin, minimizing cheekbone width.',
    gender: 'women', suitableFor: ['diamond', 'oval'], tags: ['Bob', 'Bangs', 'Textured'],
    trending: true, rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'hairmatch' });
    console.log('Connected to MongoDB\n');

    let added = 0;
    const shapes = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond'];

    for (const shape of shapes) {
      for (const gender of ['men', 'women']) {
        // Count existing hairstyles where this shape is the PRIMARY (first) entry
        const existing = await Hairstyle.countDocuments({
          'suitableFor.0': shape,
          gender,
        });

        // Get the 3 entries for this shape+gender from our data
        const entries = data.filter(
          (h) => h.suitableFor[0] === shape && h.gender === gender
        );

        if (existing >= 3) {
          console.log(`✓ ${shape} / ${gender} — already has ${existing} (skipping)`);
          continue;
        }

        const toAdd = entries.slice(0, 3 - existing);
        if (toAdd.length > 0) {
          await Hairstyle.insertMany(toAdd);
          added += toAdd.length;
          console.log(`+ ${shape} / ${gender} — added ${toAdd.length} (was ${existing})`);
        }
      }
    }

    console.log(`\n✅ Done — added ${added} new hairstyles`);

    // Final count
    console.log('\nFinal counts:');
    for (const shape of shapes) {
      const men   = await Hairstyle.countDocuments({ suitableFor: shape, gender: 'men' });
      const women = await Hairstyle.countDocuments({ suitableFor: shape, gender: 'women' });
      console.log(`  ${shape.padEnd(8)} men: ${men}  women: ${women}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

seed();
