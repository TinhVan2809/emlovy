const fs = require("fs");
const path = require("path");
const multer = require("multer");

const config = require("../config/env");
const { createHttpError } = require("../utils/httpError");

const uploadDirectory = path.resolve(__dirname, "..", "uploads", "stories");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "video/mp4", "video/quicktime"]);

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
    callback(createHttpError(400, "File story khong duoc ho tro. Hay chon anh hoac video mp4/quicktime."));
    return;
  }

  callback(null, true);
};

const storyUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.postMediaMaxFileSize,
  },
});

module.exports = storyUpload;
