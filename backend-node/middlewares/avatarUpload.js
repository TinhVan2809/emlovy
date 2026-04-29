const fs = require("fs");
const path = require("path");
const multer = require("multer");

const config = require("../config/env");
const { createHttpError } = require("../utils/httpError");

const uploadDirectory = path.resolve(__dirname, "..", "uploads", "avatars");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    const extensionByMime = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    const extension = extensionByMime[file.mimetype] || path.extname(file.originalname);
    const userId = req.user?.user_id || "unknown";
    const randomPart = Math.random().toString(36).slice(2, 10);

    callback(null, `user-${userId}-${Date.now()}-${randomPart}${extension}`);
  },
});

const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(createHttpError(400, "Avatar chi ho tro JPG, PNG hoac WEBP."));
    return;
  }

  callback(null, true);
};

const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.avatarMaxFileSize,
  },
});

module.exports = avatarUpload;
