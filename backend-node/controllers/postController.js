const path = require("path");
const postModel = require("../models/postModel");
const { getIo } = require("../utils/socket");
const { createHttpError } = require("../utils/httpError");
const createPost = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

  const { content, visibility = "public", location = null, latitude = null, longitude = null } = req.body || {};

  const files = req.files || [];

  const media = (files || []).map((f, idx) => {
    const ext = path.extname(f.filename).toLowerCase();
    const mimetype = f.mimetype || "image/jpeg";
    const type = mimetype.startsWith("video") ? "video" : "image";

    return {
      media_url: `/uploads/posts/${f.filename}`,
      type,
      sort_order: idx,
      width: null,
      height: null,
      duration: null,
    };
  });

  const created = await postModel.createWithMedia({
    user_id: user.user_id,
    content,
    visibility,
    location,
    latitude: latitude || null,
    longitude: longitude || null,
    media,
  });

  // Emit realtime event if socket io is available
  const io = getIo();
  if (io) {
    io.emit("post:created", created);
  }

  res.status(201).json({ success: true, data: created });
};

const getFeed = async (req, res) => {
  const page = parseInt(req.query.page || "1", 10) || 1;
  const limit = parseInt(req.query.limit || "10", 10) || 10;

  const posts = await postModel.getFeed({ page, limit });

  res.status(200).json({ success: true, data: posts });
};

const deletePost = async (req, res) => {
  const user = req.user;
  const postId = parseInt(req.params.id, 10);

  if (!user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

  const post = await postModel.findById(postId);

  if (!post) {
    throw createHttpError(404, "Không tìm thấy bài viết.");
  }

  // Allow owner or admin
  if (Number(post.user_id) !== Number(user.user_id) && user.role !== "admin") {
    throw createHttpError(403, "Bạn không có quyền xóa bài viết này.");
  }

  await postModel.softDelete(postId);

  const io = getIo();
  if (io) {
    io.emit("post:deleted", { post_id: postId });
  }

  res.status(200).json({ success: true });
};

module.exports = {
  createPost,
  getFeed,
  deletePost,
};
