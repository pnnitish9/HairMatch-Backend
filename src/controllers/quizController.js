const Hairstyle = require('../models/Hairstyle');

/**
 * Quiz answer → face shape mapping logic
 *
 * Q1: Face shape self-assessment
 *   oval | round | square | heart | oblong | diamond | unsure
 *
 * Q2: Lifestyle
 *   professional | casual | active | creative
 *
 * Q3: Hair texture
 *   straight | wavy | curly | coily
 *
 * Q4: Maintenance preference
 *   low | medium | high
 *
 * Q5: Style vibe
 *   classic | modern | bold | natural
 */

// Maps quiz answers to a face shape (or best guess when unsure)
const resolveFaceShape = (answers) => {
  const { faceShape, lifestyle, hairTexture, maintenance, vibe } = answers;

  // If user knows their face shape, use it directly
  if (faceShape && faceShape !== 'unsure') return faceShape;

  // Heuristic fallback when user selects "unsure"
  // Use lifestyle + vibe to suggest a common shape
  if (lifestyle === 'professional' && vibe === 'classic') return 'oval';
  if (lifestyle === 'active')                              return 'round';
  if (lifestyle === 'creative' && vibe === 'bold')         return 'square';
  if (vibe === 'natural')                                  return 'heart';
  if (maintenance === 'low')                               return 'oblong';
  return 'oval'; // safest default
};

// Build tag preferences from quiz answers
const buildTagPreferences = (answers) => {
  const tags = [];
  const { lifestyle, hairTexture, maintenance, vibe } = answers;

  if (lifestyle === 'professional') tags.push('Formal', 'Classic', 'Sleek');
  if (lifestyle === 'casual')       tags.push('Casual', 'Natural', 'Relaxed');
  if (lifestyle === 'active')       tags.push('Short', 'Low-maintenance');
  if (lifestyle === 'creative')     tags.push('Bold', 'Edgy', 'Trendy');

  if (hairTexture === 'curly')      tags.push('Curly');
  if (hairTexture === 'wavy')       tags.push('Wavy', 'Waves');
  if (hairTexture === 'straight')   tags.push('Sleek', 'Classic');
  if (hairTexture === 'coily')      tags.push('Natural', 'Volume');

  if (maintenance === 'low')        tags.push('Low-maintenance', 'Short');
  if (maintenance === 'high')       tags.push('Volume', 'Formal');

  if (vibe === 'classic')           tags.push('Classic', 'Timeless');
  if (vibe === 'modern')            tags.push('Modern', 'Trendy');
  if (vibe === 'bold')              tags.push('Bold', 'Edgy');
  if (vibe === 'natural')           tags.push('Natural', 'Soft');

  return [...new Set(tags)]; // deduplicate
};

// Score a hairstyle against preferred tags (higher = better match)
const scoreStyle = (hairstyle, preferredTags) => {
  if (!hairstyle.tags?.length) return 0;
  return hairstyle.tags.filter((t) =>
    preferredTags.some((pt) => pt.toLowerCase() === t.toLowerCase())
  ).length;
};

// @desc  Get hairstyle recommendations from quiz answers
// @route POST /api/quiz/recommend
// @access Private
const getQuizRecommendations = async (req, res, next) => {
  try {
    const { faceShape, lifestyle, hairTexture, maintenance, vibe, gender } = req.body;

    if (!gender || !['men', 'women'].includes(gender)) {
      return res.status(400).json({ success: false, message: 'Gender is required.' });
    }

    const answers = { faceShape, lifestyle, hairTexture, maintenance, vibe };
    const resolvedShape  = resolveFaceShape(answers);
    const preferredTags  = buildTagPreferences(answers);

    // Fetch all matching hairstyles for this shape + gender
    const hairstyles = await Hairstyle.find({
      suitableFor: resolvedShape,
      gender,
    }).lean();

    // Score and sort by tag match
    const scored = hairstyles
      .map((h) => ({ ...h, _score: scoreStyle(h, preferredTags) }))
      .sort((a, b) => b._score - a._score || (b.avgRating || b.rating) - (a.avgRating || a.rating));

    // Return top 6
    const recommendations = scored.slice(0, 6);

    res.json({
      success: true,
      data: {
        resolvedShape,
        gender,
        preferredTags,
        recommendations,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getQuizRecommendations };
