const express = require("express");

const reelController = require("../controllers/reelController");
const authenticate = require("../middlewares/authenticate");
const optionalAuthenticate = require("../middlewares/optionalAuthenticate");
const reelUpload = require("../middlewares/reelUpload");
const { rateLimitForCreatePost } = require("../middlewares/rateLimit");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", optionalAuthenticate, asyncHandler(reelController.getReelsFeed));
router.get("/random", optionalAuthenticate, asyncHandler(reelController.getRandomReels));
router.get("/:id/comments", optionalAuthenticate, asyncHandler(reelController.getComments));

router.post(
  "/",
  authenticate,
  rateLimitForCreatePost(),
  reelUpload.single("video"),
  asyncHandler(reelController.createReel),
);

router.post("/:id/like", authenticate, asyncHandler(reelController.toggleLike));
router.post("/:id/comment", authenticate, asyncHandler(reelController.commentReel));
router.delete("/:id", authenticate, asyncHandler(reelController.deleteReel));

module.exports = router;
