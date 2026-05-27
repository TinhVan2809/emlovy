const fs = require("fs/promises");
const path = require("path");

const searchModel = require("../models/searchModel");
const { createHttpError } = require("../utils/httpError");

// Tim kiem nguoi dung
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

// Tim kiem bai viet
const searchPosts = async (req, res, next) => {
  const { q } = req.query;
  if (!q || typeof q !== "string" || q.trim() === "") {
    throw createHttpError(400, "Tham so tim kiem khong hop le.");
  }
  try {
    const posts = await searchModel.searchPosts(q.trim(), req.user.user_id);
    res.status(200).json({
      success: true,
      message: "Tìm kiếm bài viết thành công.",
      data: { results: posts },
    });
  } catch (error) {
    next(error);
  }
}

// Tim kiem nguoi dang theo doi/theo doi
const searchFollows = async (req, res, next) => {
  const { q } = req.query;
  if (!q || typeof q !== "string" || q.trim() === "") {
    throw createHttpError(400, "Tham so tim kiem khong hop le.");
  }
  try {
    const following = await searchModel.searchFollowing(req.user.user_id, q.trim(), req.user.user_id);
    res.status(200).json({
      success: true,
      message: "Tìm kiếm người đang theo dõi thành công.",
      data: { results: following },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchUsers,
  searchFollows,
  searchPosts
};