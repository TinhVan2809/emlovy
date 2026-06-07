const express = require("express");

const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authenticate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));

// Logout cho web app, xóa cookie token
router.post("/logout", asyncHandler(authController.logout));

module.exports = router;
