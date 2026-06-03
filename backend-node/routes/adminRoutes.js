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


module.exports = router;
