const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

/**
 * Middleware để chuyển đổi ảnh sang định dạng WebP
 * Hoạt động sau khi multer đã lưu file
 * 
 * @param {Object} options - Cấu hình cho việc chuyển đổi
 * @param {number} options.quality - Chất lượng ảnh WebP (1-100, mặc định 80)
 * @param {boolean} options.deleteOriginal - Xóa file gốc sau khi chuyển đổi (mặc định true)
 * @param {boolean} options.skipVideos - Bỏ qua video files (mặc định true)
 */
const convertToWebP = (options = {}) => {
  const {
    quality = 80,
    deleteOriginal = true,
    skipVideos = true,
  } = options;

  return async (req, res, next) => {
    try {
      // Nếu không có file nào được upload, tiếp tục
      if (!req.file && !req.files) {
        return next();
      }

      // Xử lý single file upload (req.file)
      if (req.file) {
        req.file = await processFile(req.file, { quality, deleteOriginal, skipVideos });
      }

      // Xử lý multiple files upload (req.files)
      if (req.files) {
        // req.files có thể là array hoặc object
        if (Array.isArray(req.files)) {
          req.files = await Promise.all(
            req.files.map(file => processFile(file, { quality, deleteOriginal, skipVideos }))
          );
        } else {
          // req.files là object với field names
          const processedFiles = {};
          for (const [fieldName, filesArray] of Object.entries(req.files)) {
            processedFiles[fieldName] = await Promise.all(
              filesArray.map(file => processFile(file, { quality, deleteOriginal, skipVideos }))
            );
          }
          req.files = processedFiles;
        }
      }

      next();
    } catch (error) {
      console.error("Error converting to WebP:", error);
      next(error);
    }
  };
};

/**
 * Xử lý chuyển đổi một file sang WebP
 */
async function processFile(file, options) {
  const { quality, deleteOriginal, skipVideos } = options;

  // Bỏ qua nếu không phải file ảnh
  if (!file.mimetype.startsWith("image/")) {
    if (skipVideos) {
      return file; // Giữ nguyên video hoặc file khác
    }
  }

  // Nếu file đã là WebP, không cần chuyển đổi
  if (file.mimetype === "image/webp") {
    return file;
  }

  const originalPath = file.path;
  const parsedPath = path.parse(originalPath);
  const webpPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);

  try {
    // Chuyển đổi ảnh sang WebP
    const info = await sharp(originalPath)
      .webp({ quality })
      .toFile(webpPath);

    // Xóa file gốc nếu được yêu cầu
    if (deleteOriginal) {
      try {
        await fs.unlink(originalPath);
      } catch (unlinkError) {
        console.error("Error deleting original file:", unlinkError);
      }
    }

    // Cập nhật thông tin file trong req
    return {
      ...file,
      filename: `${parsedPath.name}.webp`,
      path: webpPath,
      mimetype: "image/webp",
      size: info.size,
      originalMimetype: file.mimetype,
      originalFilename: file.filename,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    // Nếu có lỗi, trả về file gốc
    return file;
  }
}

module.exports = convertToWebP;
