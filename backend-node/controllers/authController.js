const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config/env");
const userModel = require("../models/userModel");
const { createHttpError } = require("../utils/httpError");

const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validGenders = new Set(["0", "1", "2"]);

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";
const normalizeOptionalText = (value) => {
  const text = normalizeText(value);
  return text || null;
};

const createToken = (user) =>
  jwt.sign(
    {
      sub: user.user_id,
      username: user.username,
      role: user.role,
    },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn },
  );

const buildAuthResponse = (user) => ({
  user,
  token: createToken(user),
});

const validateRegisterPayload = (body) => {
  const name = normalizeText(body.name);
  const username = normalizeText(body.username).toLowerCase();
  const email = normalizeOptionalText(body.email)?.toLowerCase() || null;
  const password = typeof body.password === "string" ? body.password : "";
  const birthday = normalizeOptionalText(body.birthday);
  const gender = normalizeOptionalText(body.gender);
  const phone = normalizeOptionalText(body.phone);

  if (!name) {
    throw createHttpError(400, "Vui lòng nhập họ tên.");
  }

  if (!usernamePattern.test(username)) {
    throw createHttpError(
      400,
      "Username phải có 3-30 ký tự, chỉ gồm chữ, số hoặc dấu gạch dưới.",
    );
  }

  if (email && !emailPattern.test(email)) {
    throw createHttpError(400, "Email không hợp lệ.");
  }

  if (password.length < 6) {
    throw createHttpError(400, "Mật khẩu phải có ít nhất 6 ký tự.");
  }

  if (gender && !validGenders.has(gender)) {
    throw createHttpError(400, "Giới tính không hợp lệ.");
  }

  return {
    name,
    username,
    email,
    password,
    birthday,
    gender,
    phone,
  };
};

const validateLoginPayload = (body) => {
  const login = normalizeText(
    body.login || body.username || body.email,
  ).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!login || !password) {
    throw createHttpError(400, "Vui lòng nhập tài khoản và mật khẩu.");
  }

  return {
    login,
    password,
  };
};

const register = async (req, res) => {
  const payload = validateRegisterPayload(req.body);
  const existingUser = await userModel.findExistingAccount(payload);

  if (existingUser) {
    const message =
      existingUser.username === payload.username
        ? "Username đã được sử dụng."
        : "Email đã được sử dụng.";

    throw createHttpError(409, message);
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    config.auth.bcryptSaltRounds,
  );

  let user;

  try {
    user = await userModel.create({
      ...payload,
      passwordHash,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw createHttpError(409, "Username hoặc email đã được sử dụng.");
    }

    throw error;
  }

  res.status(201).json({
    success: true,
    message: "Đăng ký thành công.",
    data: buildAuthResponse(user),
  });
};

// Object option
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const login = async (req, res) => {
  const { login: loginName, password } = validateLoginPayload(req.body);
  const userWithPassword = await userModel.findByLogin(loginName);

  if (!userWithPassword) {
    throw createHttpError(401, "Tài khoản hoặc mật khẩu không đúng.");
  }

  if (Number(userWithPassword.status) !== 1) {
    throw createHttpError(403, "Tài khoản đang bị khóa.");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    userWithPassword.password,
  );

  if (!isPasswordValid) {
    throw createHttpError(401, "Tài khoản hoặc mật khẩu không đúng.");
  }

  const user = userModel.toPublicUser(userWithPassword);
  const token = createToken(user);

  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Đăng nhập thành công.",
    data: { user, token },
  });
};

const me = async (req, res) => {
  // Vì đã đi qua middleware authenticate, req.user đã tồn tại và hợp lệ
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Lấy thông tin người dùng thành công.",
    data: {
      user,
    },
  });
};

const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);

  res.status(200).json({
    success: true,
    message: "Đăng xuất thành công.",
  });
};

module.exports = {
  login,
  me,
  register,
  logout,
};
