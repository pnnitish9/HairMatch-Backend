const mongoose = require('mongoose');

const hairstyleSchema = new mongoose.Schema({
  name: String,
  description: String,
  tags: [String],
  imageUrl: String,
  gender: { type: String, enum: ['men', 'women'] },
  suitableFor: [String], // face shapes
});

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String, // Cloudinary public_id for deletion
    },
    faceShape: {
      type: String,
      enum: ['oval', 'round', 'square', 'heart', 'oblong', 'diamond'],
      required: true,
    },
    selectedGender: {
      type: String,
      enum: ['men', 'women'],
      default: 'men',
    },
    confidence: {
      type: Number, // 0-100
      default: null,
    },
    measurements: {
      faceWidth: Number,
      faceHeight: Number,
      jawWidth: Number,
      foreheadWidth: Number,
      ratio: Number,
    },
    recommendations: {
      men: [hairstyleSchema],
      women: [hairstyleSchema],
    },
    stylestoAvoid: [String],
    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast user queries
analysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
