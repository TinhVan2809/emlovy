const fs = require("fs");
const path = require("path");
const multer = require("multer");

const config = require("../config/env");
const { createHttpError } = require("../utils/httpError");
const convertToWebP = require("./convertToWebP");

const uploadDirectory = path.resolve(__dirname, "..", "uploads", "avatars");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg", "image/heic"]);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    // Lưu tạm với extension gốc, sẽ được chuyển sang .webp sau
    const extension = path.extname(file.originalname) || ".jpg";
    const userId = req.user?.user_id || "unknown";
    const randomPart = Math.random().toString(36).slice(2, 10);

    callback(null, `user-${userId}-${Date.now()}-${randomPart}${extension}`);
  },
});

const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(createHttpError(400, "Avatar chỉ hỗ trợ JPG, PNG, WEBP hoặc HEIC."));
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.avatarMaxFileSize,
  },
});

// Export cả multer upload và middleware chuyển đổi WebP
const avatarUpload = {
  single: (fieldName) => [
    upload.single(fieldName),
    convertToWebP({ quality: 85, deleteOriginal: true })
  ],
  
  // Nếu cần upload multiple avatars
  array: (fieldName, maxCount) => [
    upload.array(fieldName, maxCount),
    convertToWebP({ quality: 85, deleteOriginal: true })
  ],
};

module.exports = avatarUpload;
