const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getStats, getDailyAnalytics, getFaceShapeStats, getGenderStats,
  getUsers, toggleUserRole, deleteUser,
  getHairstyles, createHairstyle, updateHairstyle, deleteHairstyle,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Analytics
router.get('/stats',                    getStats);
router.get('/analytics/daily',          getDailyAnalytics);
router.get('/analytics/face-shapes',    getFaceShapeStats);
router.get('/analytics/gender',         getGenderStats);

// Users
router.get('/users',                    getUsers);
router.patch('/users/:id/role',         toggleUserRole);
router.delete('/users/:id',             deleteUser);

// Hairstyles
router.get('/hairstyles',               getHairstyles);
router.post('/hairstyles',              upload.single('image'), createHairstyle);
router.put('/hairstyles/:id',           upload.single('image'), updateHairstyle);
router.delete('/hairstyles/:id',        deleteHairstyle);

module.exports = router;
