import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

import http from "http";
import { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Conversation from "./models/Conversation.js";
import chatRoutes from "./routes/chat.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/", userRoutes);
app.use("/api/", postRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);


const PORT = process.env.PORT || 5000;

// ✅ Create HTTP + Socket.io server
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: "*", // allow frontend
    methods: ["GET", "POST"],
  },
});

// ✅ Socket.io authentication (no change here)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id);
    if (!socket.user) return next(new Error("User not found"));
    next();
  } catch (err) {
    console.error("Socket Auth Error:", err);
    next(new Error("Authentication failed"));
  }
});

// ✅ Socket.io connection logic (CORRECTED)
io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.user?.name || socket.user?._id}`);

  // Join a room based on conversation ID
  socket.on("joinConversation", ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`User ${socket.user?._id} joined room ${conversationId}`);
  });

  // Listen for a message sent to a specific conversation
  socket.on("sendMessage", async ({ conversationId, text }) => {
    if (!text || !conversationId) return;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return; // Handle error: Conversation not found

      // Ensure sender is part of the conversation
      if (!conversation.participants.includes(socket.user._id)) {
        console.error("User not part of conversation");
        return;
      }

      const newMessage = {
        sender: socket.user._id,
        text: text,
        // 'createdAt' is handled by default in the schema
      };

      conversation.messages.push(newMessage);
      await conversation.save();
      
      // We need to populate the sender info for the client
      const populatedMessage = {
        ...newMessage,
        _id: conversation.messages[conversation.messages.length - 1]._id,
        createdAt: conversation.messages[conversation.messages.length - 1].createdAt,
        sender: {
          _id: socket.user._id,
          name: socket.user.name,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      };

      
      // Emit the message to everyone ELSE in the room (not the sender)
      socket.broadcast.to(conversationId).emit("newMessage", {
        conversationId: conversationId,
        message: populatedMessage, // Send the newly created message object
      });

    } catch (err) {
      console.error("SendMessage error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.user?.name || socket.user?._id}`);
  });
});

// ✅ Start the same server instance
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
