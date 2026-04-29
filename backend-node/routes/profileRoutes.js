const express = require("express");

const authenticate = require("../middlewares/authenticate");
const avatarUpload = require("../middlewares/avatarUpload");
const profileController = require("../controllers/profileController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(authenticate);

router.get("/me", asyncHandler(profileController.getMyProfile));
router.put("/me", asyncHandler(profileController.updateMyProfile));
router.post("/me/avatar", avatarUpload.single("avatar"), asyncHandler(profileController.uploadAvatar));

module.exports = router;
