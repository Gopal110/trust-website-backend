const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Determine safe upload directory (local uploads folder or os.tmpdir() in serverless)
function getUploadDirectory() {
  const localUploadDir = path.join(__dirname, '..', 'uploads');
  try {
    if (!fs.existsSync(localUploadDir)) {
      fs.mkdirSync(localUploadDir, { recursive: true });
    }
    fs.accessSync(localUploadDir, fs.constants.W_OK);
    return localUploadDir;
  } catch (e) {
    // In serverless environments (e.g. Vercel), /tmp is the only writable directory
    return os.tmpdir();
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDirectory());
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos and PDFs are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  },
  fileFilter
});

module.exports = upload;
