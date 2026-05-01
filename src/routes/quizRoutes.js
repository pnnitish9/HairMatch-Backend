const express = require('express');
const { protect } = require('../middleware/auth');
const { getQuizRecommendations } = require('../controllers/quizController');

const router = express.Router();

router.post('/recommend', protect, getQuizRecommendations);

module.exports = router;
