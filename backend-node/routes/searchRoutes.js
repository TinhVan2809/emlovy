const express = require("express");
const authenticate = require("../middlewares/authenticate");
const searchController = require("../controllers/searchController");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

// [GET] Tìm kiếm users
router.get("/users", authenticate, asyncHandler(searchController.searchUsers));

// [GET] Tìm kiếm posts
router.get("/posts", authenticate, asyncHandler(searchController.searchPosts));

// [GET] Tìm kiếm người đang theo dõi/theo dõi
router.get("/follows", authenticate, asyncHandler(searchController.searchFollows));

module.exports = router;