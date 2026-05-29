const fs = require("fs/promises");
const path = require("path");

const postInteractionModel = require("../models/postInteractionModel");
const reelModel = require("../models/reelModel");
const { createHttpError } = require("../utils/httpError");
const { getIo } = require("../utils/socket");

const uploadsRoot = path.resolve(__dirname, "..", "uploads");

const parseReelId = (value) => {
  const reelId = Number.parseInt(value, 10);

  if (!Number.isInteger(reelId) || reelId <= 0) {
    throw createHttpError(400, "Reel id is invalid.");
  }

  return reelId;
};

const normalizeCaption = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const caption = String(value).trim();

  if (caption.length > 2200) {
    throw createHttpError(400, "Caption must be 2200 characters or fewer.");
  }

  return caption.length > 0 ? caption : null;
};

const normalizeComment = (value) => {
  const content = String(value || "").trim();

  if (!content) {
    throw createHttpError(400, "Comment cannot be empty.");
  }

  if (content.length > 1000) {
    throw createHttpError(400, "Comment must be 1000 characters or fewer.");
  }

  return content;
};

const requireUser = (req) => {
  if (!req.user) {
    throw createHttpError(401, "Ban chua dang nhap.");
  }

  return req.user;
};

const cleanupUploadedFile = async (file) => {
  if (!file?.path) {
    return;
  }

  await fs.unlink(file.path).catch(() => {
    // Best-effort cleanup only.
  });
};

const resolveUploadPath = (mediaUrl) => {
  if (!mediaUrl) {
    return null;
  }

  const relativePath = String(mediaUrl).replace(/^\/?uploads[\\/]/, "");
  const targetPath = path.resolve(uploadsRoot, relativePath);
  const safeRoot = `${uploadsRoot}${path.sep}`;

  if (targetPath !== uploadsRoot && targetPath.startsWith(safeRoot)) {
    return targetPath;
  }

  return null;
};

const cleanupReelFiles = async (mediaRows = []) => {
  await Promise.all(
    mediaRows
      .map((item) => resolveUploadPath(item.media_url))
      .filter(Boolean)
      .map((filePath) =>
        fs.unlink(filePath).catch(() => {
          // Database delete already succeeded; missing files should not fail the request.
        }),
      ),
  );
};

const mapUploadedVideo = (file) => [
  {
    media_url: `/uploads/reels/${file.filename}`,
    type: "video",
    sort_order: 0,
    width: null,
    height: null,
    duration: null,
  },
];

const createReel = async (req, res) => {
  const user = requireUser(req);
  const file = req.file;

  if (!file) {
    throw createHttpError(400, "Please choose a video to upload.");
  }

  const caption = normalizeCaption(req.body?.caption ?? req.body?.content);

  try {
    const reel = await reelModel.create({
      user_id: user.user_id,
      caption,
      media: mapUploadedVideo(file),
    });

    const io = getIo();
    if (io) {
      io.emit("reel:created", reel);
    }

    res.status(201).json({ success: true, data: reel });
  } catch (error) {
    await cleanupUploadedFile(file);
    throw error;
  }
};

const getReelsFeed = async (req, res) => {
  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "6", 10) || 6;
  const data = await reelModel.getFeed({
    page,
    limit,
    viewerId: req.user?.user_id || null,
  });

  res.status(200).json({ success: true, data });
};

const toggleLike = async (req, res) => {
  const user = requireUser(req);
  const reelId = parseReelId(req.params.id);
  const reel = await reelModel.findById(reelId, user.user_id);

  if (!reel) {
    throw createHttpError(404, "Reel not found.");
  }

  const data = reel.liked_by_me
    ? await postInteractionModel.unlikePost({ postId: reelId, userId: user.user_id })
    : await postInteractionModel.likePost({ postId: reelId, userId: user.user_id });

  const io = getIo();
  if (io) {
    io.emit("reel:liked", data);
  }

  res.status(200).json({ success: true, data });
};

const getComments = async (req, res) => {
  const reelId = parseReelId(req.params.id);
  const page = Number.parseInt(req.query.page || "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit || "20", 10) || 20;
  const reel = await reelModel.findById(reelId, req.user?.user_id || null);

  if (!reel) {
    throw createHttpError(404, "Reel not found.");
  }

  const data = await postInteractionModel.getComments({
    postId: reelId,
    page,
    limit,
    sort: "new",
    viewerId: req.user?.user_id || null,
  });

  res.status(200).json({ success: true, data });
};

const commentReel = async (req, res) => {
  const user = requireUser(req);
  const reelId = parseReelId(req.params.id);
  const reel = await reelModel.findById(reelId, user.user_id);

  if (!reel) {
    throw createHttpError(404, "Reel not found.");
  }

  const content = normalizeComment(req.body?.content);
  const mutation = await postInteractionModel.createComment({
    postId: reelId,
    userId: user.user_id,
    content,
  });
  const comments = await reelModel.getLatestComments(reelId, {
    viewerId: user.user_id,
    limit: 20,
  });

  const data = {
    ...mutation,
    comments,
  };

  const io = getIo();
  if (io) {
    io.emit("reel:commented", {
      post_id: reelId,
      comment_count: mutation.post.comment_count,
      comment: mutation.comment,
    });
  }

  res.status(201).json({ success: true, data });
};

const deleteReel = async (req, res) => {
  const user = requireUser(req);
  const reelId = parseReelId(req.params.id);
  const reel = await reelModel.findById(reelId);

  if (!reel) {
    throw createHttpError(404, "Reel not found.");
  }

  if (Number(reel.user_id) !== Number(user.user_id) && user.role !== "admin") {
    throw createHttpError(403, "You can only delete your own reels.");
  }

  const mediaRows = await reelModel.hardDelete(reelId);
  await cleanupReelFiles(mediaRows);

  const io = getIo();
  if (io) {
    io.emit("reel:deleted", { post_id: reelId });
  }

  res.status(200).json({ success: true });
};

module.exports = {
  commentReel,
  createReel,
  deleteReel,
  getComments,
  getReelsFeed,
  toggleLike,
};
