const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true, trim: true, maxlength: 500 },
  rating:  { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

const hairstyleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['men', 'women'],
      required: true,
    },
    suitableFor: {
      type: [String],
      enum: ['oval', 'round', 'square', 'heart', 'oblong', 'diamond'],
      required: true,
    },
    tags: [String],
    imageUrl: {
      type: String,
      default: null,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    // Admin-set base rating
    rating: {
      type: Number,
      default: 4.0,
      min: 1,
      max: 5,
    },
    // User ratings & feedback
    userRatings: [feedbackSchema],
    // Computed average (updated on each new rating)
    avgRating: {
      type: Number,
      default: null,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

hairstyleSchema.index({ suitableFor: 1, gender: 1 });

module.exports = mongoose.model('Hairstyle', hairstyleSchema);
