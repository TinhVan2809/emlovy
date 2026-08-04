const fs = require("fs");
const path = require("path");
const multer = require("multer");

const config = require("../config/env");
const { createHttpError } = require("../utils/httpError");
const convertToWebP = require("./convertToWebP");

const uploadDirectory = path.resolve(__dirname, "..", "uploads", "posts");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/jpg",
  "image/heic",
  "video/mp4",
  "video/quicktime"
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname) || "";
    const userId = req.user?.user_id || "unknown";
    const randomPart = Math.random().toString(36).slice(2, 10);

    callback(null, `user-${userId}-${Date.now()}-${randomPart}${extension}`);
  },
});

const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(createHttpError(400, "File type not supported. Allowed: images and mp4/quicktime video."));
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.postMediaMaxFileSize,
  },
});

// Export với middleware chuyển đổi WebP
// Video sẽ được bỏ qua (skipVideos: true)
const postUpload = {
  single: (fieldName) => [
    upload.single(fieldName),
    convertToWebP({ quality: 80, deleteOriginal: true, skipVideos: true })
  ],
  
  array: (fieldName, maxCount) => [
    upload.array(fieldName, maxCount),
    convertToWebP({ quality: 80, deleteOriginal: true, skipVideos: true })
  ],
  
  fields: (fields) => [
    upload.fields(fields),
    convertToWebP({ quality: 80, deleteOriginal: true, skipVideos: true })
  ],
};

module.exports = postUpload;
