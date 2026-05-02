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

// Create post (authenticated)
router.post(
  "/",
  authenticate,
  rateLimitForCreatePost(),
  postUpload.array("media", config.upload.postMediaMaxFiles),
  asyncHandler(postController.createPost),
);

// Delete post
router.delete("/:id", authenticate, asyncHandler(postController.deletePost));

module.exports = router;
