const express = require('express');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  analyzeImage,
  getHistory,
  getAnalysis,
  deleteAnalysis,
} = require('../controllers/analysisController');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/analyze', upload.single('image'), analyzeImage);
router.get('/history', getHistory);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;
