const express = require("express");
const cors = require("cors");
const path = require("path");

const config = require("./config/env");
const {
  checkDatabaseConnection,
  closeDatabaseConnection,
} = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const followRoutes = require("./routes/followRoute");
const profileRoutes = require("./routes/profileRoutes");
const postRoutes = require("./routes/postRoutes");
const storyRoutes = require("./routes/storyRoutes");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const { Server } = require("socket.io");
const http = require("http");
const { setIo } = require("./utils/socket");
const storyModel = require("./models/storyModel");

const STORY_CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

const createApp = () => {
  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: config.cors.origins.length > 0 ? config.cors.origins : true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Emlovy API is running",
    });
  });

  app.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      status: "ok",
    });
  });

  app.get("/health/db", async (req, res, next) => {
    try {
      await checkDatabaseConnection();

      res.status(200).json({
        success: true,
        status: "ok",
        database: "connected",
      });
    } catch (error) {
      const databaseError = new Error("Database unavailable");
      databaseError.status = 503;
      databaseError.cause = error;
      next(databaseError);
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/follows", followRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/stories", storyRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const registerShutdownHandlers = (server, timers = []) => {
  let isShuttingDown = false;

  const shutdown = (signal) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`${signal} received. Closing server...`);
    timers.forEach((timer) => clearInterval(timer));

    server.close(async (serverError) => {
      if (serverError) {
        console.error("Error while closing HTTP server:", serverError);
        process.exit(1);
      }

      try {
        await closeDatabaseConnection();
        console.log("Server closed successfully.");
        process.exit(0);
      } catch (databaseError) {
        console.error("Error while closing database pool:", databaseError);
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

const startServer = async () => {
  try {
    await checkDatabaseConnection();

    const app = createApp();

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: config.cors.origins.length > 0 ? config.cors.origins : true,
        methods: ["GET", "POST", "PATCH", "DELETE"],
      },
    });

    setIo(io);

    const cleanupExpiredStories = async () => {
      try {
        const expiredCount = await storyModel.cleanupExpiredStories();

        if (expiredCount > 0) {
          io.emit("story:expired", { count: expiredCount });
        }
      } catch (cleanupError) {
        console.error("Story cleanup failed:", cleanupError.message || cleanupError);
      }
    };

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);
      socket.on("disconnect", () => {
        // noop
      });
    });

    const server = httpServer.listen(config.app.port, () => {
      console.log(`Server is running at ${config.app.port}`);
      console.log(`http://localhost:${config.app.port}`);
    });

    cleanupExpiredStories();
    const storyCleanupTimer = setInterval(cleanupExpiredStories, STORY_CLEANUP_INTERVAL_MS);
    storyCleanupTimer.unref?.();

    registerShutdownHandlers(server, [storyCleanupTimer]);

    return server;
  } catch (error) {
    console.error("Failed to start server:", error.code || error.message || error.name);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  startServer,
};
