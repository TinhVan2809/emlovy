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
      verifiedUsers: data.verifiedUsers,
      activeUsers: data.activeUsers,
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

// Factory function để tạo các controller thống kê
const createStatsController = (statType) => async (req, res) => {
  const range = (req.query.range || "7days").toString();
  if (!["7days", "30days", "12months"].includes(range)) {
    throw createHttpError(400, "Tham số range không hợp lệ. Sử dụng 7days, 30days hoặc 12months.");
  }

  const result = await adminService.getStats(statType, range);
  res.status(200).json({ success: true, data: result });
};

// Sử dụng factory để tạo các controller
const usersStats = createStatsController("users");
const postsStats = createStatsController("posts");
const commentsStats = createStatsController("comments");
const likesStats = createStatsController("likes");
const reelsStats = createStatsController("reels");
const verifiedStats = createStatsController("verified-users");

// GET /api/admin/stats/top-posts
const topInteractedPosts = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 7;
  const range = (req.query.range || "7days").toString();

  if (!["7days", "30days", "12months"].includes(range)) {
    throw createHttpError(400, "Tham số range không hợp lệ. Sử dụng 7days, 30days hoặc 12months.");
  }

  const result = await adminService.getTopInteractedPosts(limit, range);
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
  verifiedStats,
  topInteractedPosts,
};
