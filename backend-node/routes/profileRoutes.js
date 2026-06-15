const express = require("express");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const avatarUpload = require("../middlewares/avatarUpload");
const optionalAuthenticate = require("../middlewares/optionalAuthenticate");
const profileController = require("../controllers/profileController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/me", authenticate, asyncHandler(profileController.getMyProfile));
router.put("/me", authenticate, asyncHandler(profileController.updateMyProfile));
router.post(
  "/me/avatar",
  authenticate,
  avatarUpload.single("avatar"),
  asyncHandler(profileController.uploadAvatar),
);
router.get("/:userId", optionalAuthenticate, asyncHandler(profileController.getUserProfile));

// Admin update any user's profile
router.put(
  "/:userId",
  authenticate,
  authorize("admin"),
  asyncHandler(profileController.updateUserProfile),
);
module.exports = router;
