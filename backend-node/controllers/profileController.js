const fs = require("fs/promises");
const path = require("path");

const profileModel = require("../models/profileModel");
const userModel = require("../models/userModel");
const { createHttpError } = require("../utils/httpError");

const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validGenders = new Set(["0", "1", "2"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const normalizeText = (value) => (typeof value === "string" ? value.trim() : undefined);
const normalizeNullableText = (value) => {
  if (value === null) {
    return null;
  }

  const text = normalizeText(value);
  return text === undefined ? undefined : text || null;
};

const createUserPayload = (profile) => userModel.toPublicUser(profile);

const parseUserId = (value) => {
  const userId = Number.parseInt(value, 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createHttpError(400, "User id khong hop le.");
  }

  return userId;
};

const validateProfilePayload = (body) => {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    const name = normalizeText(body.name);

    if (!name) {
      throw createHttpError(400, "Vui long nhap ho ten.");
    }

    updates.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(body, "username")) {
    const username = normalizeText(body.username)?.toLowerCase();

    if (!usernamePattern.test(username || "")) {
      throw createHttpError(400, "Username phai co 3-30 ky tu, chi gom chu, so hoac dau gach duoi.");
    }

    updates.username = username;
  }

  if (Object.prototype.hasOwnProperty.call(body, "email")) {
    const email = normalizeNullableText(body.email)?.toLowerCase() || null;

    if (email && !emailPattern.test(email)) {
      throw createHttpError(400, "Email không hợp lệ.");
    }

    updates.email = email;
  }

  if (Object.prototype.hasOwnProperty.call(body, "phone")) {
    updates.phone = normalizeNullableText(body.phone);
  }

  if (Object.prototype.hasOwnProperty.call(body, "birthday")) {
    const birthday = normalizeNullableText(body.birthday);

    if (birthday && !datePattern.test(birthday)) {
      throw createHttpError(400, "Ngày sinh phải có định dạng YYYY-MM-DD.");
    }

    updates.birthday = birthday;
  }

  if (Object.prototype.hasOwnProperty.call(body, "gender")) {
    const gender = normalizeNullableText(body.gender);

    if (gender && !validGenders.has(gender)) {
      throw createHttpError(400, "Giới tính không hợp lệ.");
    }

    updates.gender = gender;
  }

  return updates;
};

const getMyProfile = async (req, res) => {
  const profile = await profileModel.findByUserId(req.user.user_id);

  if (!profile) {
    throw createHttpError(404, "Không tìm thấy profile.");
  }

  res.status(200).json({
    success: true,
    message: "Lấy profile thành công.",
    data: {
      profile,
    },
  });
};

const getUserProfile = async (req, res) => {
  const userId = parseUserId(req.params.userId);
  const viewerId = req.user?.user_id || null;
  const profile = await profileModel.findByUserId(userId, {
    publicPostsOnly: true,
    viewerId,
  });

  if (!profile) {
    throw createHttpError(404, "Không tìm thấy profile.");
  }

  res.status(200).json({
    success: true,
    message: "Lấy profile thành công.",
    data: {
      profile: {
        ...profile,
        is_self: Number(viewerId) === Number(userId),
      },
    },
  });
};

const updateMyProfile = async (req, res) => {
  const updates = validateProfilePayload(req.body);

  if (updates.username || updates.email !== undefined) {
    const duplicateUser = await profileModel.findDuplicateIdentity({
      userId: req.user.user_id,
      username: updates.username,
      email: updates.email,
    });

    if (duplicateUser) {
      const message =
        updates.username && duplicateUser.username === updates.username
          ? "Username đã được sử dụng."
          : "Email đã được sử dụng.";

      throw createHttpError(409, message);
    }
  }

  let profile;

  try {
    profile = await profileModel.updateByUserId(req.user.user_id, updates);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw createHttpError(409, "Username hoặc email đã được sử dụng.");
    }

    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Cập nhật profile thành công.",
    data: {
      profile,
      user: createUserPayload(profile),
    },
  });
};

const removeUploadedFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  await fs.unlink(filePath).catch(() => undefined);
};

const removeOldAvatar = async (avatarPath) => {
  if (!avatarPath || !avatarPath.startsWith("/uploads/avatars/")) {
    return;
  }

  const fileName = path.basename(avatarPath);
  const absolutePath = path.resolve(__dirname, "..", "uploads", "avatars", fileName);

  await fs.unlink(absolutePath).catch(() => undefined);
};

const uploadAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, "Vui lòng chọn ảnh avatar.");
  }

  const oldProfile = await profileModel.findByUserId(req.user.user_id);
  const avatarPath = `/uploads/avatars/${req.file.filename}`;

  let profile;

  try {
    profile = await profileModel.updateAvatar(req.user.user_id, avatarPath);
  } catch (error) {
    await removeUploadedFile(req.file.path);
    throw error;
  }

  await removeOldAvatar(oldProfile?.avata);

  res.status(200).json({
    success: true,
    message: "Upload avatar thanh cong.",
    data: {
      profile,
      user: createUserPayload(profile),
    },
  });
};

module.exports = {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
  uploadAvatar,
};
