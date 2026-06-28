const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userModel = require("../models/userModel");
const config = require("../config/env");
const { createHttpError } = require("../utils/httpError");

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

const updateVerification = async (req, res) => {
  const { userId } = req.params;
  const { isVerified } = req.body;

  if (isVerified === undefined) {
    throw createHttpError(400, "isVerified field is required.");
  }

  const updatedUser = await userModel.update(userId, { is_verified: isVerified ? 1 : 0 });

  if (!updatedUser) {
    throw createHttpError(404, "User not found.");
  }

  res.status(200).json({
    success: true,
    message: "User verification status updated successfully.",
    data: updatedUser,
  });
};

const updateStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (status === undefined) {
    throw createHttpError(400, "status field is required.");
  }

  const updatedUser = await userModel.update(userId, { status: Number(status) });

  if (!updatedUser) {
    throw createHttpError(404, "User not found.");
  }

  res.status(200).json({
    success: true,
    message: "User status updated successfully.",
    data: updatedUser,
  });
};

const resetPassword = async (req, res) => {
  const { userId } = req.params;

  // Generate a new random password (e.g., a 16-char hex string)
  const newPassword = crypto.randomBytes(8).toString("hex");

  // Hash the new password
  const passwordHash = await bcrypt.hash(
    newPassword,
    config.auth.bcryptSaltRounds,
  );

  // Update in the database
  const wasUpdated = await userModel.updatePassword(userId, passwordHash);

  if (!wasUpdated) {
    throw createHttpError(404, "User not found or password could not be updated.");
  }

  // Return the new (unhashed) password to the admin
  res.status(200).json({
    success: true,
    message: "Mật khẩu đã được đặt lại thành công. Vui lòng cung cấp mật khẩu mới cho người dùng.",
    data: { newPassword },
  });
};

module.exports = {
  getUserList,
  getVerifiedUserCount,
  updateVerification,
  updateStatus,
  resetPassword,
};
