const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Get all posts
router.get('/', authMiddleware, async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Get post by ID
router.get('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  post ? res.json(post) : res.status(404).json({ error: 'Post not found' });
}); 

// Create a post
router.post('/', authMiddleware, async (req, res) => {
  const newPost = new Post({ ...req.body, userId: req.user.id });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Like/unlike a post
router.put('/:id/like', authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const liked = post.likes.find(l => l.userId === req.user.id);

  if (liked) {
    post.likes = post.likes.filter(l => l.userId !== req.user.id);
  } else {
    const user = await User.findById(req.user.id);
    post.likes.push({ userId: user._id, userName: user.name });
  }

  await post.save();
  res.json(post.likes);
});

// Save/unsave post
router.put('/:id/save', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const postId = req.params.id;
  const alreadySaved = user.savedPosts.includes(postId);

  if (alreadySaved) {
    user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
  } else {
    user.savedPosts.push(postId);
  }

  await user.save();
  res.json(user.savedPosts);
});

// Check if post is saved
router.get('/:id/isSaved', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const isSaved = user.savedPosts.includes(req.params.id);
  res.json({ saved: isSaved });
});

// Post a comment
router.post('/:id/comments', authMiddleware, async (req, res) => {
  const { content, userName, userIcon } = req.body;
  const post = await Post.findById(req.params.id);

  const newComment = {
    userId: req.user.id,
    userName,
    userIcon,
    content,
    timestamp: new Date()
  };

  post.comments.push(newComment);
  await post.save();

  res.json({ success: true, comment: newComment });
});


// Delete a comment
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
  await post.save();
  res.json({ success: true, message: 'Comment deleted' });

});

module.exports = router;
