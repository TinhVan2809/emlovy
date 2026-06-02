const { createHttpError } = require("../utils/httpError");

// A minimal admin controller. Expand with real admin actions as needed.
const check = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

  // Return basic info to confirm admin access
  res.status(200).json({
    success: true,
    data: {
      message: "Admin access granted",
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      },
    },
  });
};

module.exports = {
  check,
};
