const express = require("express");
const postSaveController = require("../controllers/postSaveController");
const authenticate = require("../middlewares/authenticate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/**
 * Lấy danh sách bài viết đã lưu của user
 * GET /post-save?page=1&limit=10
 */
router.get(
  "/",
  authenticate,
  asyncHandler(postSaveController.getSavedPosts)
);

/**
 * Lưu một bài viết
 * POST /post-save/:postId
 */
router.post(
  "/:postId",
  authenticate,
  asyncHandler(postSaveController.savePost)
);

/**
 * Xóa lưu một bài viết
 * DELETE /post-save/:postId
 */
router.delete(
  "/:postId",
  authenticate,
  asyncHandler(postSaveController.unsavePost)
);

/**
 * Kiểm tra bài viết có được lưu không
 * GET /post-save/:postId/check
 */
router.get(
  "/:postId/check",
  authenticate,
  asyncHandler(postSaveController.checkPostSaved)
);

module.exports = router;
