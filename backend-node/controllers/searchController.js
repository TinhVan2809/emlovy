const fs = require("fs/promises");
const path = require("path");

const searchModel = require("../models/searchModel");
const { createHttpError } = require("../utils/httpError");

const searchUsers = async (req, res, next) => {
  const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim() === "") {
    throw createHttpError(400, "Tham so tim kiem khong hop le.");
  }
  try {
    const users = await searchModel.searchUsers(q.trim(), req.user.user_id);
    res.status(200).json({
      success: true,
      message: "Tìm kiếm người dùng thành công.",
      data: { results: users },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchUsers
};