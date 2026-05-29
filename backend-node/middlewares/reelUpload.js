const fs = require("fs");
const path = require("path");
const multer = require("multer");

const config = require("../config/env");
const { createHttpError } = require("../utils/httpError");

const uploadDirectory = path.resolve(__dirname, "..", "uploads", "reels");
fs.mkdirSync(uploadDirectory, { recursive: true });

const videoExtensions = new Set([
  ".3g2",
  ".3gp",
  ".avi",
  ".m4v",
  ".mkv",
  ".mov",
  ".mp4",
  ".mpeg",
  ".mpg",
  ".ogv",
  ".webm",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = videoExtensions.has(extension) ? extension : ".mp4";
    const userId = req.user?.user_id || "unknown";
    const randomPart = Math.random().toString(36).slice(2, 10);

    callback(null, `user-${userId}-${Date.now()}-${randomPart}${safeExtension}`);
  },
});

const fileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const isVideoMime = String(file.mimetype || "").toLowerCase().startsWith("video/");
  const isKnownVideoExtension = videoExtensions.has(extension);

  if (!isVideoMime && !isKnownVideoExtension) {
    callback(createHttpError(400, "Only video files can be uploaded as reels."));
    return;
  }

  callback(null, true);
};

const reelUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.reelVideoMaxFileSize,
    files: 1,
  },
});

module.exports = reelUpload;
