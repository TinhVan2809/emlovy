const express = require("express");

const followController = require("../controllers/followsController");
const authenticate = require("../middlewares/authenticate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/:userId", authenticate, asyncHandler(followController.followUser));
router.delete("/:userId", authenticate, asyncHandler(followController.unfollowUser));

module.exports = router;
