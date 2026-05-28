const fs = require("fs/promises");

const storyModel = require("../models/storyModel");
const { getIo } = require("../utils/socket");
const { createHttpError } = require("../utils/httpError");

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

const normalizeBackgroundColor = (value) => {
  const color = String(value || "#FFE1D6").trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw createHttpError(400, "Màu nền story không hợp lệ.");
  }

  return color;
};

const parseStoryId = (value) => {
  const storyId = Number.parseInt(value, 10);

  if (!Number.isInteger(storyId) || storyId <= 0) {
    throw createHttpError(400, "Story id không hợp lệ.");
  }

  return storyId;
};

const requireUser = (req) => {
  if (!req.user) {
    throw createHttpError(401, "Bạn chưa đăng nhập.");
  }

  return req.user;
};

const mapUploadedMedia = (files = []) =>
  (files || []).map((file) => {
    const mimetype = file.mimetype || "image/jpeg";
    const type = mimetype.startsWith("video") ? "video" : "image";

    return {
      media_url: `/uploads/stories/${file.filename}`,
      type,
      duration: null,
      position_x: null,
      position_y: null,
    };
  });

const getFollowingStories = async (req, res) => {
  const user = requireUser(req);
  const groups = await storyModel.getFollowingStories(user.user_id);

  res.status(200).json({ success: true, data: { groups } });
};

const getMyStories = async (req, res) => {
  const user = requireUser(req);
  const stories = await storyModel.getUserStories(user.user_id);

  res.status(200).json({ success: true, data: { stories } });
};

const createStory = async (req, res) => {
  const user = requireUser(req);
  const files = req.files || [];
  const content = normalizeText(req.body?.content);
  const background_color = normalizeBackgroundColor(req.body?.background_color);
  const music_url = normalizeText(req.body?.music_url);

  if (!content && files.length === 0) {
    await cleanupUploadedFiles(files);
    throw createHttpError(400, "Story cần chữ hoặc hình ảnh.");
  }

  const story = await storyModel.create({
    user_id: user.user_id,
    content,
    background_color,
    music_url,
    media: mapUploadedMedia(files),
  });

  const io = getIo();
  if (io) {
    io.emit("story:created", story);
  }

  res.status(201).json({ success: true, data: story });
};

const updateStory = async (req, res) => {
  const user = requireUser(req);
  const storyId = parseStoryId(req.params.id);
  const story = await storyModel.findOwnedById(storyId);
  const files = req.files || [];

  storyModel.assertCanManage(story, user);

  const fields = {};

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "content")) {
    fields.content = normalizeText(req.body.content);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "background_color")) {
    fields.background_color = normalizeBackgroundColor(req.body.background_color);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "music_url")) {
    fields.music_url = normalizeText(req.body.music_url);
  }

  const replaceMedia = files.length > 0 || String(req.body?.replaceMedia || "").toLowerCase() === "true";

  if (!Object.keys(fields).length && !replaceMedia) {
    throw createHttpError(400, "Không có thay đổi nào để cập nhật story.");
  }

  const nextContent = Object.prototype.hasOwnProperty.call(fields, "content") ? fields.content : story.content;
  const nextMediaLength = replaceMedia ? files.length : story.media.length;

  if (!nextContent && nextMediaLength === 0) {
    await cleanupUploadedFiles(files);
    throw createHttpError(400, "Story cần chữ hoặc hình ảnh.");
  }

  const updated = await storyModel.update(storyId, fields, mapUploadedMedia(files), replaceMedia);

  const io = getIo();
  if (io) {
    io.emit("story:updated", updated);
  }

  res.status(200).json({ success: true, data: updated });
};

const deleteStory = async (req, res) => {
  const user = requireUser(req);
  const storyId = parseStoryId(req.params.id);
  const story = await storyModel.findOwnedById(storyId);

  storyModel.assertCanManage(story, user);
  await storyModel.softDelete(storyId);

  const io = getIo();
  if (io) {
    io.emit("story:deleted", { story_id: storyId, user_id: story.user_id });
  }

  res.status(200).json({ success: true });
};

module.exports = {
  createStory,
  deleteStory,
  getFollowingStories,
  getMyStories,
  updateStory,
};
