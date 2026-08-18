const postSaveModel = require("../models/postSaveModel");
const { createHttpError } = require("../utils/httpError");

/**
 * Lấy danh sách bài viết đã lưu của user
 * GET /post-save?page=1&limit=10
 */
const getSavedPosts = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "10", 10) || 10;

  // Lấy danh sách bài viết đã lưu
  const posts = await postSaveModel.getSavedPosts({
    userId: user.user_id,
    page,
    limit,
    viewerId: user.user_id, // Để kiểm tra liked_by_me
  });

  // Lấy tổng số bài viết đã lưu
  const totalCount = await postSaveModel.countSavedPosts(user.user_id);

  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total: totalCount,
      total_pages: Math.ceil(totalCount / limit),
    },
  });
};

/**
 * Lưu một bài viết
 * POST /post-save/:postId
 */
const savePost = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

  const postId = Number.parseInt(req.params.postId, 10);

  if (!Number.isInteger(postId) || postId <= 0) {
    throw createHttpError(400, "Post ID không hợp lệ.");
  }

  const result = await postSaveModel.savePost(user.user_id, postId);

  if (result.already_saved) {
    return res.status(200).json({
      success: true,
      message: "Bài viết đã được lưu trước đó.",
      data: result,
    });
  }

  res.status(201).json({
    success: true,
    message: "Lưu bài viết thành công.",
    data: result,
  });
};

/**
 * Xóa lưu một bài viết
 * DELETE /post-save/:postId
 */
const unsavePost = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

  const postId = Number.parseInt(req.params.postId, 10);

  if (!Number.isInteger(postId) || postId <= 0) {
    throw createHttpError(400, "Post ID không hợp lệ.");
  }

  const deleted = await postSaveModel.unsavePost(user.user_id, postId);

  if (!deleted) {
    throw createHttpError(404, "Bài viết này chưa được lưu.");
  }

  res.status(200).json({
    success: true,
    message: "Xóa lưu bài viết thành công.",
  });
};

/**
 * Kiểm tra bài viết có được lưu không
 * GET /post-save/:postId/check
 */
const checkPostSaved = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

  const postId = Number.parseInt(req.params.postId, 10);

  if (!Number.isInteger(postId) || postId <= 0) {
    throw createHttpError(400, "Post ID không hợp lệ.");
  }

  const saved = await postSaveModel.isPostSaved(user.user_id, postId);

  res.status(200).json({
    success: true,
    data: {
      post_id: postId,
      is_saved: saved,
    },
  });
};

module.exports = {
  getSavedPosts,
  savePost,
  unsavePost,
  checkPostSaved,
};
