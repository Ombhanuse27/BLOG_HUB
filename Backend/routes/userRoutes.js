import express from 'express';
const router = express.Router();

import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Post from '../models/Post.js';



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


// Get user by ID (public)
router.get("/getuser/:id", async (req, res) => {
  try {
    // exclude password
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
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

router.get('/:userId/posts', authMiddleware, async (req, res) => {
  try {
    // Find all posts where the 'userId' field matches the ID from the URL parameters
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    if (!posts) {
      return res.status(404).json({ msg: 'No posts found for this user' });
    }

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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


export default router; 
