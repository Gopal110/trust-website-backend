const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Upload single file directly to Cloudinary (No local file storage)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload memory buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'trust_website');

    res.json({
      message: 'File uploaded to Cloudinary successfully',
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error("CLOUDINARY UPLOAD ERROR:", err);
    res.status(500).json({
      message: err.message || 'Cloudinary upload failed'
    });
  }
});

module.exports = router;
