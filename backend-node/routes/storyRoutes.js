const express = require("express");

const storyController = require("../controllers/storyController");
const authenticate = require("../middlewares/authenticate");
const storyUpload = require("../middlewares/storyUpload");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(storyController.getFollowingStories));
router.get("/me", authenticate, asyncHandler(storyController.getMyStories));

router.post(
  "/",
  authenticate,
  storyUpload.array("media", 1),
  asyncHandler(storyController.createStory),
);

router.patch(
  "/:id",
  authenticate,
  storyUpload.array("media", 1),
  asyncHandler(storyController.updateStory),
);

router.delete("/:id", authenticate, asyncHandler(storyController.deleteStory));

module.exports = router;
