const userModel = require("../models/userModel");

const getUserList = async (req, res) => {
  try {
    // Lấy page và limit từ query params, mặc định là 1 và 10
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const role = req.query.role || null;

    // Chạy song song việc lấy danh sách và đếm tổng số để tối ưu hiệu năng
    const [users, total] = await Promise.all([
      userModel.getUserList(page, limit, role),
      userModel.countUsers({ role }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      items: users,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching user list:", error);
    res.status(500).json({ error: "Failed to fetch user list" });
  }
};

const getVerifiedUserCount = async (req, res) => {
  try {
    const count = await userModel.countUsers({ isVerified: 1 });
    res.status(200).json({ verifiedUserCount: count });
  } catch (error) {
    console.error("Error fetching verified user count:", error);
    res.status(500).json({ error: "Failed to fetch verified user count" });
  }
};


module.exports = {
  getUserList,
  getVerifiedUserCount,
};
