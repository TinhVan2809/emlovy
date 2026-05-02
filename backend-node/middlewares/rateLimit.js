const { createHttpError } = require("../utils/httpError");

// Simple in-memory rate limiter per user for create-post action.
// Not suitable for multi-instance deployments but fine for demo/dev.

const windows = new Map();

const defaultOpts = {
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max actions per window
};

const rateLimitForCreatePost = (opts = {}) => {
  const { windowMs, max } = { ...defaultOpts, ...opts };

  return (req, _res, next) => {
    try {
      const userId = req.user && req.user.user_id ? String(req.user.user_id) : "anon";
      const now = Date.now();
      const entry = windows.get(userId) || { timestamps: [] };

      // drop expired timestamps
      entry.timestamps = entry.timestamps.filter((ts) => ts > now - windowMs);

      if (entry.timestamps.length >= max) {
        throw createHttpError(429, "Bạn đăng quá nhanh, vui lòng thử lại sau vài giây.");
      }

      entry.timestamps.push(now);
      windows.set(userId, entry);

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  rateLimitForCreatePost,
};
