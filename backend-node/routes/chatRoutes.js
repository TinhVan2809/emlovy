const express = require("express");

const chatController = require("../controllers/chatController");
const authenticate = require("../middlewares/authenticate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(authenticate);

router.get("/conversations", asyncHandler(chatController.getConversations));
router.post("/conversations", asyncHandler(chatController.createConversation));
router.get("/conversations/:conversationId/messages", asyncHandler(chatController.getMessages));
router.post("/conversations/:conversationId/messages", asyncHandler(chatController.sendMessage));

module.exports = router;
