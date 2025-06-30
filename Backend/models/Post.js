// models/Post.js
const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  bannerUrl: String,
  category: {
    categoryId: String,
    categoryTitle: String
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user: String,
  likes: [{ userId: String, userName: String }],
  comments: [{
    userId: String,
    userName: String,
    content: String,
    userIcon: String,
    timestamp: Date
  }]
}, { timestamps: true });
module.exports = mongoose.model("Post", postSchema);
