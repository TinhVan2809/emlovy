const jwt = require("jsonwebtoken");

const config = require("../config/env");
const userModel = require("../models/userModel");

const optionalAuthenticate = async (req, _res, next) => {
  try {
    const authorizationHeader = req.headers.authorization || "";
    const token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.slice("Bearer ".length)
      : "";

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const user = await userModel.findById(decoded.sub);

    if (user && Number(user.status) === 1) {
      req.user = user;
      req.auth = {
        token,
        decoded,
      };
    }

    next();
  } catch (_error) {
    next();
  }
};

module.exports = optionalAuthenticate;
