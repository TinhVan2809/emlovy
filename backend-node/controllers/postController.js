const fs = require("fs/promises");

const postModel = require("../models/postModel");
const { getIo } = require("../utils/socket");
const { createHttpError } = require("../utils/httpError");

const allowedVisibility = new Set(["public", "private", "friends", "followers"]);

const cleanupUploadedFiles = async (files = []) => {
  await Promise.all(
    files.map((file) =>
      fs.unlink(file.path).catch(() => {
        // Best-effort cleanup only.
      }),
    ),
  );
};

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

const normalizeVisibility = (visibility = "public") => {
  const value = String(visibility || "public").trim();

  if (!allowedVisibility.has(value)) {
    throw createHttpError(400, "Che do hien thi khong hop le.");
  }

  return value;
};

const normalizeCoordinate = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const coordinate = Number(value);

  if (!Number.isFinite(coordinate)) {
    throw createHttpError(400, `${fieldName} khong hop le.`);
  }

  return coordinate;
};

const parsePostId = (value) => {
  const postId = Number.parseInt(value, 10);

  if (!Number.isInteger(postId) || postId <= 0) {
    throw createHttpError(400, "Post id khong hop le.");
  }

  return postId;
};

const mapUploadedMedia = (files = []) =>
  (files || []).map((file, index) => {
    const mimetype = file.mimetype || "image/jpeg";
    const type = mimetype.startsWith("video") ? "video" : "image";

    return {
      media_url: `/uploads/posts/${file.filename}`,
      type,
      sort_order: index,
      width: null,
      height: null,
      duration: null,
    };
  });

const createPost = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Ban chua dang nhap.");
  }

  const files = req.files || [];
  const content = normalizeText(req.body?.content);
  const visibility = normalizeVisibility(req.body?.visibility);
  const location = normalizeText(req.body?.location);
  const latitude = normalizeCoordinate(req.body?.latitude, "Latitude");
  const longitude = normalizeCoordinate(req.body?.longitude, "Longitude");

  if (!content && files.length === 0) {
    await cleanupUploadedFiles(files);
    throw createHttpError(400, "Bai viet can noi dung hoac hinh anh.");
  }

  const created = await postModel.createWithMedia({
    user_id: user.user_id,
    content,
    visibility,
    location,
    latitude,
    longitude,
    media: mapUploadedMedia(files),
  });

  const io = getIo();
  if (io && created.visibility === "public") {
    io.emit("post:created", created);
  }

  res.status(201).json({ success: true, data: created });
};

const getFeed = async (req, res) => {
  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "10", 10) || 10;
  const posts = await postModel.getFeed({ page, limit, viewerId: req.user?.user_id || null });

  res.status(200).json({ success: true, data: posts });
};

const getMyPosts = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw createHttpError(401, "Ban chua dang nhap.");
  }

  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "12", 10) || 12;
  const posts = await postModel.getFeed({
    page,
    limit,
    userId: user.user_id,
    includePrivate: true,
    viewerId: user.user_id,
  });

  res.status(200).json({ success: true, data: posts });
};

const getUserPosts = async (req, res) => {
  const userId = Number.parseInt(req.params.userId, 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createHttpError(400, "User id khong hop le.");
  }

  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "12", 10) || 12;
  const posts = await postModel.getFeed({ page, limit, userId, viewerId: req.user?.user_id || null });

  res.status(200).json({ success: true, data: posts });
};

const updatePost = async (req, res) => {
  const user = req.user;
  const postId = parsePostId(req.params.id);

  if (!user) {
    throw createHttpError(401, "Ban chua dang nhap.");
  }

  const post = await postModel.findById(postId);

  if (!post) {
    await cleanupUploadedFiles(req.files || []);
    throw createHttpError(404, "Khong tim thay bai viet.");
  }

  if (Number(post.user_id) !== Number(user.user_id) && user.role !== "admin") {
    await cleanupUploadedFiles(req.files || []);
    throw createHttpError(403, "Ban khong co quyen sua bai viet nay.");
  }

  const files = req.files || [];
  const fields = {};

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "content")) {
    fields.content = normalizeText(req.body.content);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "visibility")) {
    fields.visibility = normalizeVisibility(req.body.visibility);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "location")) {
    fields.location = normalizeText(req.body.location);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "latitude")) {
    fields.latitude = normalizeCoordinate(req.body.latitude, "Latitude");
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "longitude")) {
    fields.longitude = normalizeCoordinate(req.body.longitude, "Longitude");
  }

  const replaceMedia = files.length > 0 || String(req.body?.replaceMedia || "").toLowerCase() === "true";

  if (!Object.keys(fields).length && !replaceMedia) {
    throw createHttpError(400, "Khong co thay doi nao de cap nhat.");
  }

  const nextContent = Object.prototype.hasOwnProperty.call(fields, "content") ? fields.content : post.content;
  const nextMedia = replaceMedia ? files : post.media;

  if (!nextContent && nextMedia.length === 0) {
    await cleanupUploadedFiles(files);
    throw createHttpError(400, "Bai viet can noi dung hoac hinh anh.");
  }

  const updated = await postModel.updateWithMedia(postId, fields, mapUploadedMedia(files), replaceMedia);

  const io = getIo();
  if (io) {
    if (updated.visibility === "public") {
      io.emit("post:updated", updated);
    } else {
      io.emit("post:hidden", { post_id: postId });
    }
  }

  res.status(200).json({ success: true, data: updated });
};

const deletePost = async (req, res) => {
  const user = req.user;
  const postId = parsePostId(req.params.id);

  if (!user) {
    throw createHttpError(401, "Ban chua dang nhap.");
  }

  const post = await postModel.findById(postId);

  if (!post) {
    throw createHttpError(404, "Khong tim thay bai viet.");
  }

  if (Number(post.user_id) !== Number(user.user_id) && user.role !== "admin") {
    throw createHttpError(403, "Ban khong co quyen xoa bai viet nay.");
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
  getMyPosts,
  getUserPosts,
  updatePost,
  deletePost,
};
