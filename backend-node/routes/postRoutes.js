const express = require("express");
const postController = require("../controllers/postController");
const postInteractionController = require("../controllers/postInteractionController");
const authenticate = require("../middlewares/authenticate");
const optionalAuthenticate = require("../middlewares/optionalAuthenticate");
const postUpload = require("../middlewares/postUpload");
const { rateLimitForCreatePost } = require("../middlewares/rateLimit");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/env");

const router = express.Router();

// Public feed
router.get("/", optionalAuthenticate, asyncHandler(postController.getFeed));

// Current user's posts
router.get("/me", authenticate, asyncHandler(postController.getMyPosts));

// Public posts by user
router.get(
  "/user/:userId",
  optionalAuthenticate,
  asyncHandler(postController.getUserPosts),
);

// Post reactions and comments
router.post(
  "/:id/like",
  authenticate,
  asyncHandler(postInteractionController.likePost),
);

// unlike post
router.delete(
  "/:id/like",
  authenticate,
  asyncHandler(postInteractionController.unlikePost),
);

// Get comments
router.get(
  "/:id/comments",
  optionalAuthenticate,
  asyncHandler(postInteractionController.getComments),
);

// Upload comments
router.post(
  "/:id/comments",
  authenticate,
  asyncHandler(postInteractionController.createComment),
);

// Replise comments
router.post(
  "/:id/comments/:commentId/replies",
  authenticate,
  asyncHandler(postInteractionController.createReply),
);

// like comment
router.post(
  "/comments/:commentId/like",
  authenticate,
  asyncHandler(postInteractionController.likeComment),
);

// Unlike comment
router.delete(
  "/comments/:commentId/like",
  authenticate,
  asyncHandler(postInteractionController.unlikeComment),
);

// Edit comment
router.patch(
  "/comments/:commentId",
  authenticate,
  asyncHandler(postInteractionController.editComment),
);

// Delete comment
router.delete(
  "/comments/:commentId",
  authenticate,
  asyncHandler(postInteractionController.deleteCommentByUser),
)

// Following feed
router.get(
  "/following",
  authenticate,
  asyncHandler(postController.getFollowingFeed),
);

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
