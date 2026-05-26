const express = require("express");
const authenticate = require("../middlewares/authenticate");
const searchController = require("../controllers/searchController");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router.get("/users", authenticate, asyncHandler(searchController.searchUsers));
// router.get("/posts", authenticate, asyncHandler(searchController.searchPosts));

module.exports = router;