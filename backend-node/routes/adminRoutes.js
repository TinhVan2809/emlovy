const express = require("express");

const adminController = require("../controllers/adminController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Check admin access
router.get("/check", authenticate, authorize("admin"), asyncHandler(adminController.check));
// Dashboard overview
router.get("/dashboard", authenticate, authorize("admin"), asyncHandler(adminController.dashboard));
// User growth chart
router.get("/dashboard/user-growth", authenticate, authorize("admin"), asyncHandler(adminController.userGrowth));

// Stats by range
router.get("/stats/users", authenticate, authorize("admin"), asyncHandler(adminController.usersStats));
router.get("/stats/posts", authenticate, authorize("admin"), asyncHandler(adminController.postsStats));
router.get("/stats/comments", authenticate, authorize("admin"), asyncHandler(adminController.commentsStats));
router.get("/stats/likes", authenticate, authorize("admin"), asyncHandler(adminController.likesStats));
router.get("/stats/reels", authenticate, authorize("admin"), asyncHandler(adminController.reelsStats));
router.get("/stats/verified-users", authenticate, authorize("admin"), asyncHandler(adminController.verifiedStats));

// Top interacted posts
router.get("/stats/top-posts", authenticate, authorize("admin"), asyncHandler(adminController.topInteractedPosts));

module.exports = router;
