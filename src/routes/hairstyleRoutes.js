const express = require('express');
const { protect } = require('../middleware/auth');
const { getHairstyles, getHairstyle, rateHairstyle, getFeedback, getTrending } = require('../controllers/hairstyleController');

const router = express.Router();

// ── Public routes (no auth required) ──────────────────────────────────────
router.get('/trending', getTrending);

// ── Protected routes ───────────────────────────────────────────────────────
router.use(protect);

router.get('/',              getHairstyles);
router.get('/:id',           getHairstyle);
router.post('/:id/rate',     rateHairstyle);
router.get('/:id/feedback',  getFeedback);

module.exports = router;
