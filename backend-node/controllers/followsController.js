const followModel = require("../models/followModel");
const profileModel = require("../models/profileModel");
const userModel = require("../models/userModel");
const { createHttpError } = require("../utils/httpError");

const parseUserId = (value) => {
  const userId = Number.parseInt(value, 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createHttpError(400, "User id khong hop le.");
  }

  return userId;
};

const ensureTargetUser = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    throw createHttpError(404, "Khong tim thay nguoi dung.");
  }

  return user;
};

const getProfilePayload = async (targetUserId, viewerId) => {
  const profile = await profileModel.findByUserId(targetUserId, {
    publicPostsOnly: true,
    viewerId,
  });

  return {
    ...profile,
    is_self: Number(viewerId) === Number(targetUserId),
  };
};

const followUser = async (req, res) => {
  const followerId = req.user.user_id;
  const followingId = parseUserId(req.params.userId);

  if (Number(followerId) === Number(followingId)) {
    throw createHttpError(400, "Ban khong the follow chinh minh.");
  }

  await ensureTargetUser(followingId);
  await followModel.follow({ followerId, followingId });

  res.status(200).json({
    success: true,
    message: "Follow thanh cong.",
    data: {
      profile: await getProfilePayload(followingId, followerId),
    },
  });
};

const unfollowUser = async (req, res) => {
  const followerId = req.user.user_id;
  const followingId = parseUserId(req.params.userId);

  if (Number(followerId) === Number(followingId)) {
    throw createHttpError(400, "Ban khong the unfollow chinh minh.");
  }

  await ensureTargetUser(followingId);
  await followModel.unfollow({ followerId, followingId });

  res.status(200).json({
    success: true,
    message: "Unfollow thanh cong.",
    data: {
      profile: await getProfilePayload(followingId, followerId),
    },
  });
};

// TODO: getFollowing
const getFollowing = async (req, res) => {
  const userId = parseUserId(req.params.userId);
  const following = await followModel.getFollowing(userId, req.user.user_id);
  res.status(200).json({
    success: true,
    data: {
      results: following,
    },
  });
};

// TODO: getFollowers
const getFollowers = async (req, res) => {
  const userId = parseUserId(req.params.userId);
  const followers = await followModel.getFollowers(userId, req.user.user_id);
  res.status(200).json({
    success: true,
    data: {
      results: followers,
    },
  });
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
};
