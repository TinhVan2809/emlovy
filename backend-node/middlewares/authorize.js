const { createHttpError } = require("../utils/httpError");

// Usage: authorize('admin') or authorize('admin', 'moderator')
module.exports = function authorize(...allowedRoles) {
  return (req, _res, next) => {
    try {
      if (!req.user) {
        throw createHttpError(401, "Bạn chưa đăng nhập.");
      }

      const role = String(req.user.role || "");

      if (!allowedRoles.includes(role)) {
        // throw createHttpError(403, "Bạn không có quyền truy cập admin.");
        if (role === "customer") {
          console.log(`${req.user.name} đã đăng nhập.`);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
