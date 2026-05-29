const config = require("../config/env");

const getErrorDetail = (error) => {
  if (!error) {
    return "Unknown error";
  }

  if (error.details) {
    return error.details;
  }

  if (error.message && error.message.trim()) {
    return error.message;
  }

  if (error.code) {
    return error.code;
  }

  return error.name || "Unknown error";
};

const errorHandler = (error, req, res, _next) => {
  const statusCode = error.status || (error.name === "MulterError" ? 400 : 500);
  const isServerError = statusCode >= 500;

  const response = {
    success: false,
    message:
      error.code === "LIMIT_FILE_SIZE"
        ? "File vuot qua dung luong cho phep."
        : isServerError
          ? "Service unavailable"
          : error.message,
  };

  if (!config.isProduction) {
    response.detail = getErrorDetail(error.cause || error);
  }

  if (isServerError) {
    console.error(`[${new Date().toISOString()}]`, error);
  } else {
    console.warn(`[${new Date().toISOString()}] ${statusCode} ${error.message}`);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
