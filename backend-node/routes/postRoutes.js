const express = require("express");
const postController = require("../controllers/postController");
const authenticate = require("../middlewares/authenticate");
const postUpload = require("../middlewares/postUpload");
const { rateLimitForCreatePost } = require("../middlewares/rateLimit");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/env");

const router = express.Router();

// Public feed
router.get("/", asyncHandler(postController.getFeed));

// Current user's posts
router.get("/me", authenticate, asyncHandler(postController.getMyPosts));

// Public posts by user
router.get("/user/:userId", asyncHandler(postController.getUserPosts));

// Create post (authenticated)
router.post(
  "/",
  authenticate,
  rateLimitForCreatePost(),
  postUpload.array("media", config.upload.postMediaMaxFiles),
  asyncHandler(postController.createPost),
);

// Update post
router.patch(
  "/:id",
  authenticate,
  postUpload.array("media", config.upload.postMediaMaxFiles),
  asyncHandler(postController.updatePost),
);

// Delete post
router.delete("/:id", authenticate, asyncHandler(postController.deletePost));

module.exports = router;
