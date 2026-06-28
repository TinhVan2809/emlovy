const express = require("express");

const userController = require("../controllers/userController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Get user list with pagination
router.get("/list", userController.getUserList);

// update verified
router.put(
  "/:user_id/verification",
  authenticate,
  authorize("admin"),
  asyncHandler(userController.updateVerification),
);

// Update user status
router.put(
  "/:user_id/status",
  authenticate,
  authorize("admin"),
  asyncHandler(userController.updateStatus),
);

// Reset password
router.put(
  "/:user_id/reset-password",
  authenticate,
  authorize("admin"),
  asyncHandler(userController.resetPassword)
)

module.exports = router;
