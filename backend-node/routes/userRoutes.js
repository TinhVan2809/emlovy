const express = require("express");

const userController = require("../controllers/userController");

const router = express.Router();

// Get user list with pagination
router.get("/list", userController.getUserList);

module.exports = router;
