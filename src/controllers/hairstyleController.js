const Hairstyle = require('../models/Hairstyle');
const Analysis  = require('../models/Analysis');

// @desc    Get trending hairstyles — public, no auth
// @route   GET /api/hairstyles/trending
// @access  Public
const getTrending = async (req, res, next) => {
  try {
    const { gender, sort = 'popular', limit = 12 } = req.query;
    const pageLimit = Math.min(parseInt(limit) || 12, 24);

    // ── Step 1: Count how many times each hairstyle was recommended ────────
    // Analyses store recommendations as embedded docs with _id matching Hairstyle._id
    const [menCounts, womenCounts] = await Promise.all([
      Analysis.aggregate([
        { $unwind: '$recommendations.men' },
        { $group: { _id: '$recommendations.men._id', count: { $sum: 1 } } },
      ]),
      Analysis.aggregate([
        { $unwind: '$recommendations.women' },
        { $group: { _id: '$recommendations.women._id', count: { $sum: 1 } } },
      ]),
    ]);

    // Build a map: hairstyleId → recommendation count
    const recCountMap = {};
    [...menCounts, ...womenCounts].forEach(({ _id, count }) => {
      if (!_id) return;
      const key = _id.toString();
      recCountMap[key] = (recCountMap[key] || 0) + count;
    });

    // ── Step 2: Fetch hairstyles ───────────────────────────────────────────
    const filter = {};
    if (gender && ['men', 'women'].includes(gender)) filter.gender = gender;

    const hairstyles = await Hairstyle.find(filter)
      .select('-userRatings')
      .lean();

    // ── Step 3: Attach recommendation count to each hairstyle ─────────────
    const enriched = hairstyles.map((h) => ({
      ...h,
      recommendationCount: recCountMap[h._id.toString()] || 0,
      displayRating: h.avgRating || h.rating || 0,
    }));

    // ── Step 4: Sort based on query param ─────────────────────────────────
    const sorted = enriched.sort((a, b) => {
      if (sort === 'rating') {
        return b.displayRating - a.displayRating || b.recommendationCount - a.recommendationCount;
      }
      if (sort === 'reviews') {
        return b.totalRatings - a.totalRatings || b.displayRating - a.displayRating;
      }
      // Default: 'popular' — weighted score combining recommendations + rating + reviews
      const scoreA = a.recommendationCount * 2 + a.displayRating * 10 + a.totalRatings * 3;
      const scoreB = b.recommendationCount * 2 + b.displayRating * 10 + b.totalRatings * 3;
      return scoreB - scoreA;
    });

    const result = sorted.slice(0, pageLimit);

    // ── Step 5: Compute platform stats ────────────────────────────────────
    const [totalAnalyses, totalReviews] = await Promise.all([
      Analysis.countDocuments(),
      Hairstyle.aggregate([{ $group: { _id: null, total: { $sum: '$totalRatings' } } }]),
    ]);

    res.json({
      success: true,
      count: result.length,
      stats: {
        totalAnalyses,
        totalReviews: totalReviews[0]?.total || 0,
        totalHairstyles: hairstyles.length,
      },
      data: result,
    });
  } catch (error) { next(error); }
};

// @desc    Get hairstyles by face shape and gender
// @route   GET /api/hairstyles?faceShape=oval&gender=men
// @access  Private
const getHairstyles = async (req, res, next) => {
  try {
    const { faceShape, gender, trending } = req.query;
    const filter = {};
    if (faceShape) filter.suitableFor = faceShape;
    if (gender)    filter.gender = gender;
    if (trending === 'true') filter.trending = true;
    const hairstyles = await Hairstyle.find(filter)
      .sort({ avgRating: -1, rating: -1, trending: -1 })
      .select('-userRatings') // don't send full ratings array to users
      .lean();
    res.json({ success: true, count: hairstyles.length, data: hairstyles });
  } catch (error) { next(error); }
};

// @desc    Get single hairstyle with feedback
// @route   GET /api/hairstyles/:id
// @access  Private
const getHairstyle = async (req, res, next) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.id)
      .populate('userRatings.user', 'name avatar')
      .lean();
    if (!hairstyle) {
      return res.status(404).json({ success: false, message: 'Hairstyle not found.' });
    }
    res.json({ success: true, data: hairstyle });
  } catch (error) { next(error); }
};

// @desc    Submit rating + feedback for a hairstyle
// @route   POST /api/hairstyles/:id/rate
// @access  Private
const rateHairstyle = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please write a short feedback comment.' });
    }

    const hairstyle = await Hairstyle.findById(req.params.id);
    if (!hairstyle) {
      return res.status(404).json({ success: false, message: 'Hairstyle not found.' });
    }

    // Check if user already rated — update existing rating
    const existingIdx = hairstyle.userRatings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIdx !== -1) {
      hairstyle.userRatings[existingIdx].rating  = rating;
      hairstyle.userRatings[existingIdx].comment = comment.trim();
    } else {
      hairstyle.userRatings.push({
        user:    req.user._id,
        rating:  Number(rating),
        comment: comment.trim(),
      });
    }

    // Recompute average
    const total = hairstyle.userRatings.length;
    const sum   = hairstyle.userRatings.reduce((acc, r) => acc + r.rating, 0);
    hairstyle.avgRating    = Math.round((sum / total) * 10) / 10;
    hairstyle.totalRatings = total;

    await hairstyle.save();

    res.json({
      success: true,
      message: existingIdx !== -1 ? 'Your review has been updated.' : 'Thank you for your feedback!',
      data: {
        avgRating:    hairstyle.avgRating,
        totalRatings: hairstyle.totalRatings,
      },
    });
  } catch (error) { next(error); }
};

// @desc    Get all feedback for a hairstyle
// @route   GET /api/hairstyles/:id/feedback
// @access  Private
const getFeedback = async (req, res, next) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.id)
      .populate('userRatings.user', 'name avatar')
      .lean();
    if (!hairstyle) {
      return res.status(404).json({ success: false, message: 'Hairstyle not found.' });
    }
    // Sort newest first
    const feedback = [...(hairstyle.userRatings || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({ success: true, data: feedback });
  } catch (error) { next(error); }
};

module.exports = { getHairstyles, getHairstyle, rateHairstyle, getFeedback, getTrending };
