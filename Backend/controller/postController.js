import Post from "../models/Post.js";

export const updatePostById = async (req, res) => {
  try {
    const { title, content, category, bannerUrl } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Update fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.bannerUrl = bannerUrl || post.bannerUrl; // ✅ Preserve old banner if not changed

    await post.save();
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
};