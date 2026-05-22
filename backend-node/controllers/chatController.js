const chatModel = require("../models/chatModel");
const userModel = require("../models/userModel");
const { getIo } = require("../utils/socket");
const { emitChatMessage } = require("../utils/chatRealtime");
const { createHttpError } = require("../utils/httpError");

const parsePositiveInt = (value, fieldName) => {
  const id = Number.parseInt(value, 10);

  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, `${fieldName} khong hop le.`);
  }

  return id;
};

const normalizeContent = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeParticipantIds = (body = {}) => {
  const rawParticipantIds = Array.isArray(body.participant_ids)
    ? body.participant_ids
    : Array.isArray(body.participantIds)
      ? body.participantIds
      : [];
  const directUserId = body.user_id ?? body.userId ?? body.target_user_id ?? body.targetUserId;
  const ids = directUserId ? [...rawParticipantIds, directUserId] : rawParticipantIds;

  return [...new Set(ids.map((id) => parsePositiveInt(id, "User id")))];
};

const ensureUsersExist = async (userIds) => {
  for (const userId of userIds) {
    const user = await userModel.findById(userId);

    if (!user) {
      throw createHttpError(404, "Khong tim thay nguoi dung.");
    }
  }
};

const getConversations = async (req, res) => {
  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "20", 10) || 20;
  const conversations = await chatModel.listConversationsForUser({
    userId: req.user.user_id,
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    message: "Lay danh sach hoi thoai thanh cong.",
    data: conversations,
  });
};

const createConversation = async (req, res) => {
  const participantIds = normalizeParticipantIds(req.body);
  const type = req.body?.type === "group" ? "group" : "private";
  const name = normalizeContent(req.body?.name) || null;

  if (participantIds.some((userId) => Number(userId) === Number(req.user.user_id))) {
    throw createHttpError(400, "Khong can them chinh ban vao participant_ids.");
  }

  if (type === "private" && participantIds.length !== 1) {
    throw createHttpError(400, "Hoi thoai rieng can dung 1 nguoi nhan.");
  }

  if (type === "group" && participantIds.length < 1) {
    throw createHttpError(400, "Nhom chat can it nhat 1 thanh vien khac.");
  }

  await ensureUsersExist(participantIds);

  const conversation = await chatModel.createConversation({
    creatorId: req.user.user_id,
    participantIds,
    type,
    name,
  });

  res.status(201).json({
    success: true,
    message: "Tao hoi thoai thanh cong.",
    data: {
      conversation,
    },
  });
};

const getMessages = async (req, res) => {
  const conversationId = parsePositiveInt(req.params.conversationId, "Conversation id");
  const isParticipant = await chatModel.isParticipant(conversationId, req.user.user_id);

  if (!isParticipant) {
    throw createHttpError(403, "Ban khong thuoc hoi thoai nay.");
  }

  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "30", 10) || 30;
  const messages = await chatModel.listMessagesForConversation({
    conversationId,
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    message: "Lay tin nhan thanh cong.",
    data: messages,
  });
};

const sendMessage = async (req, res) => {
  const conversationId = parsePositiveInt(req.params.conversationId, "Conversation id");
  const isParticipant = await chatModel.isParticipant(conversationId, req.user.user_id);

  if (!isParticipant) {
    throw createHttpError(403, "Ban khong thuoc hoi thoai nay.");
  }

  const content = normalizeContent(req.body?.content);
  const messageType = req.body?.message_type || req.body?.messageType || "text";
  const replyToMessageId = req.body?.reply_to_message_id
    ? parsePositiveInt(req.body.reply_to_message_id, "Reply message id")
    : null;

  if (!content) {
    throw createHttpError(400, "Vui long nhap tin nhan.");
  }

  const message = await chatModel.createMessage({
    conversationId,
    senderId: req.user.user_id,
    content,
    messageType,
    replyToMessageId,
  });
  const conversation = await chatModel.findConversationForUser(conversationId, req.user.user_id);
  const participantIds = await chatModel.getConversationParticipantIds(conversationId);

  emitChatMessage(getIo(), {
    conversation,
    message,
    participantIds,
  });

  res.status(201).json({
    success: true,
    message: "Gui tin nhan thanh cong.",
    data: {
      conversation,
      message,
    },
  });
};

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
};
