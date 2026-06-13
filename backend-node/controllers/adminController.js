const { createHttpError } = require("../utils/httpError");
const adminService = require("../services/adminService");

// Check admin access
const check = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

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

// GET /api/admin/dashboard
const dashboard = async (req, res) => {
  const data = await adminService.getOverview();

  res.status(200).json({
    success: true,
    data: {
      totalUsers: data.totalUsers,
      newUsersToday: data.newUsersToday,
      totalPosts: data.totalPosts,
      totalReels: data.totalReels,
      totalComments: data.totalComments,
      totalLikes: data.totalLikes,
      totalReports: data.totalReports,
    },
  });
};

// GET /api/admin/dashboard/user-growth?range=7days|30days|12months
const userGrowth = async (req, res) => {
  const range = (req.query.range || "7days").toString();

  if (!["7days", "30days", "12months"].includes(range)) {
    throw createHttpError(400, "Invalid range parameter. Use 7days, 30days or 12months.");
  }

  const result = await adminService.getUserGrowth(range);

  res.status(200).json({
    success: true,
    data: {
      range: result.range,
      data: result.data,
      previous_total: result.previous_total,
    },
  });
};

// GET /api/admin/stats/users?range=7days|30days|12months
const usersStats = async (req, res) => {
  const range = (req.query.range || "7days").toString();
  if (!["7days", "30days", "12months"].includes(range)) {
    throw createHttpError(400, "Tham số range không hợp lệ. Sử dụng 7days, 30days hoặc 12months.");
  }

  const result = await adminService.getStats("users", range);
  res.status(200).json({ success: true, data: result });
};

// GET /api/admin/stats/posts?range=7days|30days|12months
const postsStats = async (req, res) => {
  const range = (req.query.range || "7days").toString();
  if (!["7days", "30days", "12months"].includes(range)) {
    throw createHttpError(400, "Tham số range không hợp lệ.");
  }

  const result = await adminService.getStats("posts", range);
  res.status(200).json({ success: true, data: result });
};

// GET /api/admin/stats/comments?range=7days|30days|12months
const commentsStats = async (req, res) => {
  const range = (req.query.range || "7days").toString();
  if (!["7days", "30days", "12months"].includes(range)) {
    throw createHttpError(400, "Tham số range không hợp lệ.");
  }

  const result = await adminService.getStats("comments", range);
  res.status(200).json({ success: true, data: result });
};

// GET /api/admin/stats/likes?range=7days|30days|12months
const likesStats = async (req, res) => {
  const range = (req.query.range || "7days").toString();
  if (!["7days", "30days", "12months"].includes(range)) {
    throw createHttpError(400, "Tham số range không hợp lệ.");
  }

  const result = await adminService.getStats("likes", range);
  res.status(200).json({ success: true, data: result });
};

// GET /api/admin/stats/reels?range=7days|30days|12months
const reelsStats = async (req, res) => {
  const range = (req.query.range || "7days").toString();
  if (!["7days", "30days", "12months"].includes(range)) {
    throw createHttpError(400, "Tham số range không hợp lệ.");
  }

  const result = await adminService.getStats("reels", range);
  res.status(200).json({ success: true, data: result });
};

// GET /api/admin/stats/top-posts
const topInteractedPosts = async (req, res) => {
  const result = await adminService.getTopInteractedPosts();
  res.status(200).json({ success: true, data: result });
};

module.exports = {
  check,
  dashboard,
  userGrowth,
  usersStats,
  postsStats,
  commentsStats,
  likesStats,
  reelsStats,
  topInteractedPosts,
};
