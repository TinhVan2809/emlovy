const postInteractionModel = require("../models/postInteractionModel");
const { createHttpError } = require("../utils/httpError");

const parsePositiveInteger = (value, fieldName) => {
  const number = Number.parseInt(value, 10);

  if (!Number.isInteger(number) || number <= 0) {
    throw createHttpError(400, `${fieldName} khong hop le.`);
  }

  return number;
};

const normalizeContent = (value) => {
  const content = String(value || "").trim();

  if (!content) {
    throw createHttpError(400, "Noi dung binh luan khong duoc de trong.");
  }

  if (content.length > 1000) {
    throw createHttpError(400, "Noi dung binh luan toi da 1000 ky tu.");
  }

  return content;
};

const requireUser = (req) => {
  if (!req.user) {
    throw createHttpError(401, "Ban chua dang nhap.");
  }

  return req.user;
};

const likePost = async (req, res) => {
  const user = requireUser(req);
  const postId = parsePositiveInteger(req.params.id, "Post id");
  const data = await postInteractionModel.likePost({
    postId,
    userId: user.user_id,
  });

  res.status(200).json({ success: true, data });
};

const unlikePost = async (req, res) => {
  const user = requireUser(req);
  const postId = parsePositiveInteger(req.params.id, "Post id");
  const data = await postInteractionModel.unlikePost({
    postId,
    userId: user.user_id,
  });

  res.status(200).json({ success: true, data });
};

const getComments = async (req, res) => {
  const postId = parsePositiveInteger(req.params.id, "Post id");
  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "20", 10) || 20;
  const sort = String(req.query.sort || "top") === "new" ? "new" : "top";
  const data = await postInteractionModel.getComments({
    postId,
    page,
    limit,
    sort,
    viewerId: req.user?.user_id || null,
  });

  res.status(200).json({ success: true, data });
};

const createComment = async (req, res) => {
  const user = requireUser(req);
  const postId = parsePositiveInteger(req.params.id, "Post id");
  const content = normalizeContent(req.body?.content);
  const data = await postInteractionModel.createComment({
    postId,
    userId: user.user_id,
    content,
  });

  res.status(201).json({ success: true, data });
};

const createReply = async (req, res) => {
  const user = requireUser(req);
  const postId = parsePositiveInteger(req.params.id, "Post id");
  const parentCommentId = parsePositiveInteger(req.params.commentId, "Comment id");
  const content = normalizeContent(req.body?.content);
  const data = await postInteractionModel.createReply({
    postId,
    parentCommentId,
    userId: user.user_id,
    content,
  });

  res.status(201).json({ success: true, data });
};

const likeComment = async (req, res) => {
  const user = requireUser(req);
  const commentId = parsePositiveInteger(req.params.commentId, "Comment id");
  const data = await postInteractionModel.likeComment({
    commentId,
    userId: user.user_id,
  });

  res.status(200).json({ success: true, data });
};

const unlikeComment = async (req, res) => {
  const user = requireUser(req);
  const commentId = parsePositiveInteger(req.params.commentId, "Comment id");
  const data = await postInteractionModel.unlikeComment({
    commentId,
    userId: user.user_id,
  });

  res.status(200).json({ success: true, data });
};

module.exports = {
  createComment,
  createReply,
  getComments,
  likeComment,
  likePost,
  unlikeComment,
  unlikePost,
};
