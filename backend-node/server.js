const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

const config = require("./config/env");
const {
  checkDatabaseConnection,
  closeDatabaseConnection,
} = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const followRoutes = require("./routes/followRoute");
const profileRoutes = require("./routes/profileRoutes");
const postRoutes = require("./routes/postRoutes");
const reelRoutes = require("./routes/reelRoutes");
const storyRoutes = require("./routes/storyRoutes");
const searchRoutes = require("./routes/searchRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const { Server } = require("socket.io");
const http = require("http");
const { setIo } = require("./utils/socket");
const {
  conversationRoom,
  emitChatMessage,
  userRoom,
} = require("./utils/chatRealtime");
const chatModel = require("./models/chatModel");
const storyModel = require("./models/storyModel");
const userModel = require("./models/userModel");

const STORY_CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

const createApp = () => {
  const app = express();

  // Fall back to common localhost origins for development
  const allowedOrigins = [
    (config.cors.origins.length > 0 ? config.cors.origins : []),
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:8081",
    "http://localhost",
    "http://127.0.0.1",
  ].filter(Boolean);

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  };

  app.use(cors(corsOptions));

  app.use(cookieParser());
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
  app.use("/api/chats", chatRoutes);
  app.use("/api/follows", followRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/reels", reelRoutes);
  app.use("/api/stories", storyRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/reports", reportRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const getSocketToken = (socket) => {
  const authToken = socket.handshake.auth?.token;

  if (authToken) {
    return authToken;
  }

  const authorizationHeader = socket.handshake.headers?.authorization || "";

  return authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : "";
};

const attachSocketUser = async (socket) => {
  const token = getSocketToken(socket);

  if (!token) {
    return;
  }

  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const user = await userModel.findById(decoded.sub);

    if (user && Number(user.status) === 1) {
      socket.data.user = user;
      socket.join(userRoom(user.user_id));
    }
  } catch (_error) {
    // Other realtime features can work anonymously; chat events still require socket.data.user.
  }
};

const getSocketConversationId = (payload = {}) => {
  const conversationId = Number.parseInt(
    payload.conversation_id || payload.conversationId,
    10,
  );

  return Number.isInteger(conversationId) && conversationId > 0
    ? conversationId
    : null;
};

const acknowledgeSocketError = (socket, ack, message, status = 400) => {
  const payload = { success: false, status, message };

  if (typeof ack === "function") {
    ack(payload);
  }

  socket.emit("chat:error", payload);
};

const registerChatSocketHandlers = (io, socket) => {
  socket.on("chat:join", async (payload = {}, ack) => {
    const user = socket.data.user;
    const conversationId = getSocketConversationId(payload);

    if (!user) {
      acknowledgeSocketError(socket, ack, "Ban chua dang nhap.", 401);
      return;
    }

    if (!conversationId) {
      acknowledgeSocketError(socket, ack, "Conversation id khong hop le.");
      return;
    }

    try {
      const isParticipant = await chatModel.isParticipant(
        conversationId,
        user.user_id,
      );

      if (!isParticipant) {
        acknowledgeSocketError(
          socket,
          ack,
          "Ban khong thuoc hoi thoai nay.",
          403,
        );
        return;
      }

      socket.join(conversationRoom(conversationId));

      if (typeof ack === "function") {
        ack({ success: true, data: { conversation_id: conversationId } });
      }
    } catch (error) {
      acknowledgeSocketError(
        socket,
        ack,
        error.message || "Khong the vao phong chat.",
        error.status || 500,
      );
    }
  });

  socket.on("chat:leave", (payload = {}, ack) => {
    const conversationId = getSocketConversationId(payload);

    if (conversationId) {
      socket.leave(conversationRoom(conversationId));
    }

    if (typeof ack === "function") {
      ack({ success: true });
    }
  });

  socket.on("send_message", async (payload = {}, ack) => {
    const user = socket.data.user;
    const conversationId = getSocketConversationId(payload);
    const content =
      typeof payload.content === "string" ? payload.content.trim() : "";

    if (!user) {
      acknowledgeSocketError(socket, ack, "Ban chua dang nhap.", 401);
      return;
    }

    if (!conversationId) {
      acknowledgeSocketError(socket, ack, "Conversation id khong hop le.");
      return;
    }

    if (!content) {
      acknowledgeSocketError(socket, ack, "Vui long nhap tin nhan.");
      return;
    }

    try {
      const isParticipant = await chatModel.isParticipant(
        conversationId,
        user.user_id,
      );

      if (!isParticipant) {
        acknowledgeSocketError(
          socket,
          ack,
          "Ban khong thuoc hoi thoai nay.",
          403,
        );
        return;
      }

      const message = await chatModel.createMessage({
        conversationId,
        senderId: user.user_id,
        content,
        messageType: payload.message_type || payload.messageType || "text",
      });
      const conversation = await chatModel.findConversationForUser(
        conversationId,
        user.user_id,
      );
      const participantIds =
        await chatModel.getConversationParticipantIds(conversationId);

      emitChatMessage(io, {
        conversation,
        message,
        participantIds,
      });

      if (typeof ack === "function") {
        ack({
          success: true,
          data: {
            conversation,
            message,
          },
        });
      }
    } catch (error) {
      acknowledgeSocketError(
        socket,
        ack,
        error.message || "Gui tin nhan khong thanh cong.",
        error.status || 500,
      );
    }
  });
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
        console.error(
          "Story cleanup failed:",
          cleanupError.message || cleanupError,
        );
      }
    };

    io.use(async (socket, next) => {
      await attachSocketUser(socket);
      next();
    });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);
      registerChatSocketHandlers(io, socket);
      socket.on("disconnect", () => {
        // noop
      });
    });

    const server = httpServer.listen(config.app.port, () => {
      console.log(`Server is running at ${config.app.port}`);
      console.log(`http://localhost:${config.app.port}`);
    });

    cleanupExpiredStories();
    const storyCleanupTimer = setInterval(
      cleanupExpiredStories,
      STORY_CLEANUP_INTERVAL_MS,
    );
    storyCleanupTimer.unref?.();

    registerShutdownHandlers(server, [storyCleanupTimer]);

    return server;
  } catch (error) {
    console.error(
      "Failed to start server:",
      error.code || error.message || error.name,
    );
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
