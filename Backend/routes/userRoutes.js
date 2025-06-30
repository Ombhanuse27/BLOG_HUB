const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user); // ✅ Return full user JSON
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update followed topics
router.put('/:id/followed-topics', authMiddleware, async (req, res) => {
  const { followedTopics } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, { followedTopics });
    res.json({ message: 'Topics updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Follow/unfollow user
router.put('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const alreadyFollowing = targetUser.followers.find(f => f.uid === req.user.id);
    if (alreadyFollowing) {
      targetUser.followers = targetUser.followers.filter(f => f.uid !== req.user.id);
    } else {
      const me = await User.findById(req.user.id);
      targetUser.followers.push({ uid: me._id, name: me.name });
    }

    await targetUser.save();
    res.json({ message: 'Follow toggled' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Check if following
router.get('/:id/isFollowing', authMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id);
  const isFollowing = user.followers.some(f => f.uid === req.user.id);
  res.json({ following: isFollowing });
});

// Get saved posts
router.get('/:id/saved-posts', authMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id).populate('savedPosts');
  res.json(user.savedPosts);
});

module.exports = router;
