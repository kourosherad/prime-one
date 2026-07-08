/**
 * Multer-based upload middleware with type + size limits and sanitized filenames.
 */
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const allowedMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dir = path.resolve(process.cwd(), env.upload.dir);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${hash}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.has(ext) && allowedMime.has(file.mimetype)) return cb(null, true);
  cb(ApiError.unprocessable('نوع فایل مجاز نیست. فقط تصاویر قابل ارسال هستند.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxFileMb * 1024 * 1024 },
});

// Capture the multer methods BEFORE any named exports are attached, so that
// reassigning module.exports properties can never shadow them.
const multerSingle = upload.single.bind(upload);
const multerArray = upload.array.bind(upload);
const multerFields = upload.fields.bind(upload);

const single = (field) => multerSingle(field);
const array = (field, max = 8) => multerArray(field, max);

module.exports = {
  upload, // the multer instance (has .single/.array/.fields of its own)
  single,
  array,
  fields: multerFields,
  // Re-export multer itself for ad-hoc use (e.g. a new instance with limits).
  multer,
};
