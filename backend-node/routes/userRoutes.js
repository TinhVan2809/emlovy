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
  "/verification",
  authenticate,
  authorize("admin"),
  asyncHandler(userController.updateVerification),
);

module.exports = router;
