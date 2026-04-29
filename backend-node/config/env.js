const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "..", ".env"),
  quiet: true,
});

const readRequiredString = (key) => {
  const value = process.env[key];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
};

const readOptionalString = (key, defaultValue = "") => {
  const value = process.env[key];

  return value === undefined ? defaultValue : value;
};

const readInteger = (key, defaultValue, { min, max } = {}) => {
  const rawValue = process.env[key];

  if (rawValue === undefined || rawValue === "") {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value)) {
    throw new Error(`Environment variable ${key} must be an integer`);
  }

  if (min !== undefined && value < min) {
    throw new Error(`Environment variable ${key} must be greater than or equal to ${min}`);
  }

  if (max !== undefined && value > max) {
    throw new Error(`Environment variable ${key} must be less than or equal to ${max}`);
  }

  return value;
};

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  app: Object.freeze({
    port: readInteger("PORT", 8080, { min: 1, max: 65535 }),
  }),
  auth: Object.freeze({
    jwtSecret: readRequiredString("JWT_SECRET"),
    jwtExpiresIn: readOptionalString("JWT_EXPIRES_IN", "7d"),
    bcryptSaltRounds: readInteger("BCRYPT_SALT_ROUNDS", 12, { min: 8, max: 15 }),
  }),
  cors: Object.freeze({
    origins: readOptionalString("CORS_ORIGIN")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  }),
  upload: Object.freeze({
    avatarMaxFileSize: readInteger("AVATAR_MAX_FILE_SIZE", 2 * 1024 * 1024, {
      min: 100 * 1024,
    }),
  }),
  database: Object.freeze({
    host: readRequiredString("DB_HOST"),
    port: readInteger("DB_PORT", 3306, { min: 1, max: 65535 }),
    user: readRequiredString("DB_USER"),
    password: readOptionalString("DB_PASS"),
    name: readRequiredString("DB_NAME"),
    connectionLimit: readInteger("DB_CONNECTION_LIMIT", 10, { min: 1 }),
    queueLimit: readInteger("DB_QUEUE_LIMIT", 0, { min: 0 }),
    connectTimeout: readInteger("DB_CONNECT_TIMEOUT", 10000, { min: 1000 }),
  }),
});

module.exports = config;
