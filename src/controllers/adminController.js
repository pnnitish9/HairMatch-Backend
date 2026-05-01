const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Hairstyle = require('../models/Hairstyle');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

// @desc  Get dashboard overview stats
// @route GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOf7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startOf30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalAnalyses,
      analysesToday,
      analysesLast7,
      analysesLast30,
      totalHairstyles,
      newUsersLast7,
    ] = await Promise.all([
      User.countDocuments(),
      Analysis.countDocuments(),
      Analysis.countDocuments({ createdAt: { $gte: startOfToday } }),
      Analysis.countDocuments({ createdAt: { $gte: startOf7Days } }),
      Analysis.countDocuments({ createdAt: { $gte: startOf30Days } }),
      Hairstyle.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOf7Days } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAnalyses,
        analysesToday,
        analysesLast7,
        analysesLast30,
        totalHairstyles,
        newUsersLast7,
      },
    });
  } catch (err) { next(err); }
};

// @desc  Analyses per day for last N days (chart data)
// @route GET /api/admin/analytics/daily?days=30
const getDailyAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Analysis.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with 0
    const map = {};
    data.forEach((d) => { map[d._id] = d.count; });
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, count: map[key] || 0 });
    }

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// @desc  Face shape distribution
// @route GET /api/admin/analytics/face-shapes
const getFaceShapeStats = async (req, res, next) => {
  try {
    const data = await Analysis.aggregate([
      { $group: { _id: '$faceShape', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// @desc  Gender distribution
// @route GET /api/admin/analytics/gender
const getGenderStats = async (req, res, next) => {
  try {
    // Count from analysis formData gender field (stored in recommendations keys)
    const men   = await Analysis.countDocuments({ 'recommendations.men.0': { $exists: true } });
    const women = await Analysis.countDocuments({ 'recommendations.women.0': { $exists: true } });
    res.json({ success: true, data: { men, women } });
  } catch (err) { next(err); }
};

// ─── USERS ────────────────────────────────────────────────────────────────────

// @desc  Get all users (paginated)
// @route GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 15;
    const search = req.query.search || '';
    const skip  = (page - 1) * limit;

    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// @desc  Toggle user role (user <-> admin)
// @route PATCH /api/admin/users/:id/role
const toggleUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    res.json({ success: true, message: `Role updated to ${user.role}.`, data: user });
  } catch (err) { next(err); }
};

// @desc  Delete a user
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    await Analysis.deleteMany({ user: user._id });
    await user.deleteOne();
    res.json({ success: true, message: 'User and their analyses deleted.' });
  } catch (err) { next(err); }
};

// ─── HAIRSTYLES ───────────────────────────────────────────────────────────────

// @desc  Get all hairstyles (admin — full data, paginated)
// @route GET /api/admin/hairstyles
const getHairstyles = async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 12;
    const search = req.query.search || '';
    const gender = req.query.gender || '';
    const skip   = (page - 1) * limit;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (gender) filter.gender = gender;

    const [hairstyles, total] = await Promise.all([
      Hairstyle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Hairstyle.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: hairstyles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// @desc  Create hairstyle
// @route POST /api/admin/hairstyles
const createHairstyle = async (req, res, next) => {
  try {
    const { name, description, gender, suitableFor, tags, trending, rating } = req.body;

    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'hairmatch/hairstyles');
      imageUrl = result.secure_url;
    }

    const hairstyle = await Hairstyle.create({
      name, description, gender,
      suitableFor: Array.isArray(suitableFor) ? suitableFor : JSON.parse(suitableFor || '[]'),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      trending: trending === 'true' || trending === true,
      rating: parseFloat(rating) || 4.0,
      imageUrl,
    });

    res.status(201).json({ success: true, message: 'Hairstyle created.', data: hairstyle });
  } catch (err) { next(err); }
};

// @desc  Update hairstyle
// @route PUT /api/admin/hairstyles/:id
const updateHairstyle = async (req, res, next) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.id);
    if (!hairstyle) return res.status(404).json({ success: false, message: 'Hairstyle not found.' });

    const { name, description, gender, suitableFor, tags, trending, rating } = req.body;

    if (req.file) {
      if (hairstyle.imageUrl) {
        const publicId = hairstyle.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      const result = await uploadToCloudinary(req.file.buffer, 'hairmatch/hairstyles');
      hairstyle.imageUrl = result.secure_url;
    }

    if (name)             hairstyle.name        = name;
    if (description)      hairstyle.description = description;
    if (gender)           hairstyle.gender      = gender;
    if (suitableFor)      hairstyle.suitableFor = Array.isArray(suitableFor) ? suitableFor : JSON.parse(suitableFor);
    if (tags !== undefined) hairstyle.tags       = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (trending !== undefined) hairstyle.trending = trending === 'true' || trending === true;
    if (rating)           hairstyle.rating      = parseFloat(rating);

    await hairstyle.save();
    res.json({ success: true, message: 'Hairstyle updated.', data: hairstyle });
  } catch (err) { next(err); }
};

// @desc  Delete hairstyle
// @route DELETE /api/admin/hairstyles/:id
const deleteHairstyle = async (req, res, next) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.id);
    if (!hairstyle) return res.status(404).json({ success: false, message: 'Hairstyle not found.' });

    if (hairstyle.imageUrl) {
      const publicId = hairstyle.imageUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await hairstyle.deleteOne();
    res.json({ success: true, message: 'Hairstyle deleted.' });
  } catch (err) { next(err); }
};

module.exports = {
  getStats, getDailyAnalytics, getFaceShapeStats, getGenderStats,
  getUsers, toggleUserRole, deleteUser,
  getHairstyles, createHairstyle, updateHairstyle, deleteHairstyle,
};
