import express from "express";
import ChatRequest from "../models/ChatRequest.js";
import Conversation from "../models/Conversation.js";
import authMiddleware from '../middleware/authMiddleware.js';
 // middleware to decode JWT & set req.user.id

const router = express.Router();

// ✅ Send chat request
router.post("/request/:toUserId", authMiddleware, async (req, res) => {
  try {
    const { toUserId } = req.params;
    const fromUserId = req.userId;

    if (fromUserId === toUserId)
      return res.status(400).json({ message: "You cannot send a request to yourself" });

    const existingRequest = await ChatRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: "pending",
    });

    if (existingRequest)
      return res.status(400).json({ message: "Request already sent" });

    const request = await ChatRequest.create({
      from: fromUserId,
      to: toUserId,
    });

    res.status(201).json({ message: "Chat request sent", request });
  } catch (err) {
    console.error("Send request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all incoming chat requests
router.get("/requests/incoming", authMiddleware, async (req, res) => {
  try {
    const requests = await ChatRequest.find({
      to: req.userId,
      status: "pending",
    }).populate("from", "name firstName lastName email photo");

    res.json(requests);
  } catch (err) {
    console.error("Incoming requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Accept chat request
router.put("/request/:requestId/accept", authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ChatRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "accepted";
    await request.save();

    // Create a conversation when accepted
    let conversation = await Conversation.findOne({
      participants: { $all: [request.from, request.to] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [request.from, request.to],
      });
    }

    res.json({
      message: "Chat request accepted",
      conversationId: conversation._id,
    });
  } catch (err) {
    console.error("Accept error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Reject chat request
router.put("/request/:requestId/reject", authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ChatRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    res.json({ message: "Chat request rejected" });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get conversation (once chat is accepted)
router.get("/conversation/:conversationId", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate("participants", "name email photo")
      .populate("messages.sender", "name");

    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    res.json(conversation);
  } catch (err) {
    console.error("Get conversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ... (keep all your existing routes: /request, /requests/incoming, /accept, /reject, /conversation/:id)

// ✅ Get all of current user's conversations (for the chat list)
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate({
        path: "participants",
        select: "name firstName lastName email photo", // Fields to show for participants
      })
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 }, // Get just the last message
        populate: { path: "sender", select: "name firstName" }
      })
      .sort({ updatedAt: -1 }); // Show most recent conversations first

    // Filter out the current user from the participant list for easy display
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== req.userId
      );
      return {
        _id: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.messages.length > 0 ? conv.messages[0] : null,
        updatedAt: conv.updatedAt
      };
    });

    res.json(formattedConversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get chat status with a specific user (for UserProfile page)
router.get("/status/:otherUserId", authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.userId;

    // 1. Check if an accepted conversation exists
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (conversation) {
      return res.json({ status: "accepted", conversationId: conversation._id });
    }

    // 2. Check if a pending request exists
    const pendingRequest = await ChatRequest.findOne({
      $or: [
        { from: currentUserId, to: otherUserId, status: "pending" },
        { from: otherUserId, to: currentUserId, status: "pending" },
      ],
    });

    if (pendingRequest) {
      return res.json({ status: "pending", conversationId: null });
    }

    // 3. No relationship
    res.json({ status: "none", conversationId: null });
  } catch (err) {
    console.error("Get chat status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
