const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Allowed MIME types and extensions for uploads
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'application/pdf'
];
const allowedExtensions = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov', '.pdf'
];

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

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
  const isExtAllowed = allowedExtensions.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid media type (${ext}). Only images (JPG, PNG, WEBP, GIF), videos (MP4, WEBM, MOV), and PDFs are allowed.`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max for video media
  },
  fileFilter
});

module.exports = upload;
