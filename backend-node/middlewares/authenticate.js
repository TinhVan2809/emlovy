const jwt = require("jsonwebtoken");

const config = require("../config/env");
const userModel = require("../models/userModel");
const { createHttpError } = require("../utils/httpError");

const authenticate = async (req, _res, next) => {
  try {
    const authorizationHeader = req.headers.authorization || "";
    const isCookieAuth = !authorizationHeader && req.cookies?.token;

    // Chống CSRF: Nếu dùng cookie, bắt buộc phải kiểm tra Origin
    if (isCookieAuth && req.method !== "GET") {
      const origin = req.headers.origin || req.headers.referer;
      if (!origin || !origin.includes(config.app.frontendUrl || "localhost")) {
        throw createHttpError(403, "Cảnh báo bảo mật: Yêu cầu không hợp lệ (CSRF).");
      }
    }

    let token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.slice("Bearer ".length)
      : req.cookies?.token || "";

    if (!token) {
      throw createHttpError(401, "Ban chua dang nhap.");
    }

    let decoded;

    try {
      decoded = jwt.verify(token, config.auth.jwtSecret);
    } catch (_error) {
      throw createHttpError(401, "Phien dang nhap khong hop le hoac da het han.");
    }

    const user = await userModel.findById(decoded.sub);

    if (!user || Number(user.status) !== 1) {
      throw createHttpError(401, "Tai khoan khong con kha dung.");
    }

    req.user = user;
    req.auth = {
      token,
      decoded,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
