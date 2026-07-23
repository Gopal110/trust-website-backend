const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Single file upload
router.post('/', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct the file URL dynamically from the current request host
    const host = req.get('host');
    let protocol = req.headers['x-forwarded-proto'] || req.protocol;
    if (protocol && protocol.includes(',')) {
      protocol = protocol.split(',')[0].trim();
    }
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
    // } catch (err) {
    //   res.status(500).json({ message: err.message });
    // }
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      message: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
