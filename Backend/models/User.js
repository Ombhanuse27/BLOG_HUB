// models/User.js
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  photo: String,
  name: String,
  address: String,
  phone: String,
  socialLink: String,
  location: String,
  dob: String,
  followedTopics: [String],
  followers: [{ uid: String, name: String }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);