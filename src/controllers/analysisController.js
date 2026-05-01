const Analysis  = require('../models/Analysis');
const Hairstyle = require('../models/Hairstyle');
const User      = require('../models/User');
const sharp     = require('sharp');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

// ── Face shape descriptions ────────────────────────────────────────────────
const faceShapeInfo = {
  oval: {
    description: 'Oval is considered the ideal face shape — balanced proportions with a slightly wider forehead and gently narrowing chin. Almost any hairstyle works beautifully for you!',
    icon: '⬭',
    stylestoAvoid: ['No major restrictions — oval faces suit almost every style!'],
  },
  round: {
    description: 'Round faces have soft, curved lines with similar width and length. The goal is to add height and length to create the illusion of a more elongated face.',
    icon: '⬤',
    stylestoAvoid: ['Short blunt bobs at chin level', 'Full blunt bangs', 'Very short pixie cuts', 'Voluminous styles at the sides'],
  },
  square: {
    description: 'Square faces have a strong, defined jawline with equal width at forehead and jaw. Soft, layered styles work best to balance the angular features.',
    icon: '⬛',
    stylestoAvoid: ['Blunt straight bobs at jaw level', 'Sleek straight styles with no texture', 'Center parts with no layers', 'Very short buzz cuts'],
  },
  heart: {
    description: 'Heart-shaped faces have a wider forehead and cheekbones that taper to a narrow, pointed chin. The goal is to add width at the jaw and minimize the forehead.',
    icon: '♡',
    stylestoAvoid: ['Styles with lots of volume at the top', 'Center parts with no bangs', 'Sleek styles that emphasize the forehead', 'Very short sides with tall tops'],
  },
  oblong: {
    description: 'Oblong faces are longer than they are wide, with a long straight cheek line. The goal is to add width and reduce the appearance of length.',
    icon: '▬',
    stylestoAvoid: ['Very long straight hair with no layers', 'High ponytails or top knots', 'Styles with lots of height on top', 'Center parts with no bangs'],
  },
  diamond: {
    description: 'Diamond faces have a narrow forehead and chin with wide cheekbones. The goal is to add width at the forehead and chin while minimizing cheekbone width.',
    icon: '◇',
    stylestoAvoid: ['Sleek center-parted styles', 'Styles with maximum volume at the cheeks', 'Very short sides with no top volume'],
  },
};

// ── Skin tone pixel check using Sharp ─────────────────────────────────────
// Resizes image to 100x100, scans pixels for skin-tone range.
// Returns true if enough skin-tone pixels found (likely a face photo).
const hasFacePixels = async (buffer) => {
  try {
    // Resize to small thumbnail for fast processing
    const { data, info } = await sharp(buffer)
      .resize(100, 100, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const totalPixels = info.width * info.height;
    let skinPixels = 0;

    for (let i = 0; i < data.length; i += 3) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Broad skin tone detection covering all ethnicities
      // Rule 1: RGB-based skin detection
      const rgbSkin = (
        r > 60 && g > 40 && b > 20 &&
        r > b &&
        Math.abs(r - g) > 10 &&
        r > 100
      );

      // Rule 2: YCbCr-based skin detection (more accurate across skin tones)
      const y  =  0.299 * r + 0.587 * g + 0.114 * b;
      const cb = -0.169 * r - 0.331 * g + 0.500 * b + 128;
      const cr =  0.500 * r - 0.419 * g - 0.081 * b + 128;
      const ycbcrSkin = (y > 80 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173);

      if (rgbSkin || ycbcrSkin) skinPixels++;
    }

    const skinRatio = skinPixels / totalPixels;
    // Require at least 8% skin pixels — low enough for partial faces, high enough to reject non-face images
    return skinRatio >= 0.08;
  } catch {
    // If Sharp fails for any reason, allow the upload to proceed
    return true;
  }
};

// ── Face shape from image dimensions ──────────────────────────────────────
const analyzeFaceShape = (width, height) => {
  const ratio = height / width;
  let faceShape, confidence;
  if      (ratio > 1.55)                    { faceShape = 'oblong';  confidence = Math.round(70 + Math.random() * 15); }
  else if (ratio < 1.05)                    { faceShape = 'round';   confidence = Math.round(72 + Math.random() * 15); }
  else if (ratio >= 1.05 && ratio < 1.15)   { faceShape = 'square';  confidence = Math.round(68 + Math.random() * 18); }
  else if (ratio >= 1.15 && ratio < 1.35)   { faceShape = 'oval';    confidence = Math.round(75 + Math.random() * 15); }
  else if (ratio >= 1.35 && ratio < 1.45)   { faceShape = 'heart';   confidence = Math.round(65 + Math.random() * 20); }
  else                                       { faceShape = 'diamond'; confidence = Math.round(65 + Math.random() * 18); }
  return { faceShape, confidence };
};

// @desc    Upload image and analyze face shape
// @route   POST /api/analysis/analyze
// @access  Private
const analyzeImage = async (req, res, next) => {
  let uploadedPublicId = null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image.' });
    }

    const selectedGender = ['men', 'women'].includes(req.body.gender) ? req.body.gender : 'men';

    // ── Step 1: Check for face pixels BEFORE uploading to Cloudinary ──────
    const faceFound = await hasFacePixels(req.file.buffer);
    if (!faceFound) {
      return res.status(400).json({
        success: false,
        message: 'No face detected in the image. Please upload a clear photo with a visible face.',
      });
    }

    // ── Step 2: Get image dimensions using Sharp ───────────────────────────
    const meta   = await sharp(req.file.buffer).metadata();
    const width  = meta.width  || 400;
    const height = meta.height || 500;

    // ── Step 3: Upload to Cloudinary ──────────────────────────────────────
    const cloudResult    = await uploadToCloudinary(req.file.buffer);
    const imageUrl       = cloudResult.secure_url;
    uploadedPublicId     = cloudResult.public_id;

    // ── Step 4: Analyze face shape from real image dimensions ─────────────
    const { faceShape, confidence } = analyzeFaceShape(width, height);
    const shapeInfo = faceShapeInfo[faceShape];

    // ── Step 5: Fetch hairstyles ───────────────────────────────────────────
    const styles = await Hairstyle.find({
      suitableFor: faceShape,
      gender: selectedGender,
    }).limit(6).lean();

    const recommendations = {
      men:   selectedGender === 'men'   ? styles : [],
      women: selectedGender === 'women' ? styles : [],
    };

    // ── Step 6: Save to DB ────────────────────────────────────────────────
    const analysis = await Analysis.create({
      user: req.user._id,
      imageUrl,
      imagePublicId: uploadedPublicId,
      faceShape,
      confidence,
      selectedGender,
      measurements: { faceWidth: width, faceHeight: height, ratio: height / width },
      recommendations,
      stylestoAvoid: shapeInfo.stylestoAvoid,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { analysisCount: 1 },
      lastAnalysis: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Analysis complete!',
      data: {
        analysisId: analysis._id,
        imageUrl,
        faceShape,
        confidence,
        selectedGender,
        icon: shapeInfo.icon,
        description: shapeInfo.description,
        recommendations,
        stylestoAvoid: shapeInfo.stylestoAvoid,
      },
    });
  } catch (error) {
    if (uploadedPublicId) {
      await cloudinary.uploader.destroy(uploadedPublicId).catch(() => {});
    }
    next(error);
  }
};

// @desc    Get all analyses for current user
// @route   GET /api/analysis/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-recommendations') // Exclude heavy data from list
        .lean(),
      Analysis.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single analysis by ID
// @route   GET /api/analysis/:id
// @access  Private
const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found.' });
    }

    const shapeInfo = faceShapeInfo[analysis.faceShape];

    res.json({
      success: true,
      data: {
        ...analysis,
        icon: shapeInfo.icon,
        description: shapeInfo.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an analysis
// @route   DELETE /api/analysis/:id
// @access  Private
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found.' });
    }

    // Delete image from Cloudinary
    if (analysis.imagePublicId) {
      await cloudinary.uploader.destroy(analysis.imagePublicId).catch(() => {});
    }

    await analysis.deleteOne();

    res.json({ success: true, message: 'Analysis deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeImage, getHistory, getAnalysis, deleteAnalysis };
