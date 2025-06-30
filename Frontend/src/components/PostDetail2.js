import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import app from './firebase';
import EmojiPicker from 'emoji-picker-react';
import StickerPicker from './stickerPicker';

  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [reaction, setReaction] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [user, setUser] = useState(null);
  const [commentImage, setCommentImage] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});

  const db = getDatabase(app);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = ref(db, `posts/${postId}`);
      const postSnapshot = await get(postRef);
      if (postSnapshot.exists()) {
        setPost(postSnapshot.val());
      } else {
        console.log('Post not found');
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      const commentsRef = doc(firestore, 'posts', postId);
      const commentsDoc = await getDoc(commentsRef);
      if (commentsDoc.exists()) {
        setComments(commentsDoc.data().comments || []);
      }
    };

    fetchComments();
  }, [postId]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, [auth]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setCommentImage(reader.result); // base64
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !commentImage) return;

    const commentData = {
      text: newComment,
      userId: user.uid,
      username: user.displayName,
      userIcon: user.photoURL || '',
      timestamp: new Date().toISOString(),
      image: commentImage || null,
      reactions: [],
      replies: [],
    };

    const commentsRef = doc(firestore, 'posts', postId);
    await updateDoc(commentsRef, {
      comments: [...comments, commentData],
    });

    setComments((prev) => [...prev, commentData]);
    setNewComment('');
    setCommentImage(null);
  };

  const handleReactionToComment = async (index, emoji) => {
    const updatedComments = [...comments];
    const comment = updatedComments[index];

    if (!comment.reactions.includes(emoji)) {
      comment.reactions.push(emoji);
    }

    const commentsRef = doc(firestore, 'posts', postId);
    await updateDoc(commentsRef, {
      comments: updatedComments,
    });

    setComments(updatedComments);
  };

  const handleReplyChange = (index, value) => {
    setReplyInputs((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmitReply = async (index) => {
    const replyText = replyInputs[index];
    if (!replyText?.trim()) return;

    const reply = {
      text: replyText,
      username: user.displayName,
      userIcon: user.photoURL || '',
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...comments];
    updatedComments[index].replies = [...(updatedComments[index].replies || []), reply];

    const commentsRef = doc(firestore, 'posts', postId);
    await updateDoc(commentsRef, {
      comments: updatedComments,
    });

    setComments(updatedComments);
    setReplyInputs((prev) => ({ ...prev, [index]: '' }));
  };

  const handleStickerSelection = (sticker) => {
    setCommentImage(sticker);
    setShowStickerPicker(false);
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <p className="mb-4">{post.content}</p>
      {post.bannerUrl && (
        <img src={post.bannerUrl} alt="Post Banner" className="rounded-lg mb-4" />
      )}

      {/* Reaction Buttons */}
      <div className="mb-6 space-x-4">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="px-4 py-2 bg-yellow-100 rounded hover:bg-yellow-200"
        >
          {reaction || 'React with Emoji'}
        </button>
        <button
          onClick={() => setShowStickerPicker(!showStickerPicker)}
          className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200"
        >
          Add Sticker
        </button>
      </div>

      {showEmojiPicker && (
        <div className="mb-4">
          <EmojiPicker
            onEmojiClick={(e, emojiObject) => setReaction(emojiObject.emoji)}
          />
        </div>
      )}

      {showStickerPicker && <StickerPicker onStickerSelect={handleStickerSelection} />}

      {/* Comment Input */}
      <form onSubmit={handleSubmitComment} className="mb-8 space-y-2">
        <textarea
          value={newComment}
          onChange={handleCommentChange}
          placeholder="Write a comment..."
          className="w-full p-2 border rounded resize-none"
        />
        {commentImage && (
          <img src={commentImage} alt="Uploaded" className="h-32 object-contain rounded" />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Post Comment
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="border p-3 rounded-md bg-white shadow">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={comment.userIcon || '/default-avatar.png'}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{comment.username}</span>
              </div>
              <p className="mb-1">{comment.text}</p>
              {comment.image && (
                <img src={comment.image} alt="comment" className="max-h-40 rounded" />
              )}
              <div className="flex gap-2 mt-2 items-center">
                {comment.reactions?.map((emoji, i) => (
                  <span key={i}>{emoji}</span>
                ))}
                <EmojiPicker
                  onEmojiClick={(e, emojiObject) =>
                    handleReactionToComment(index, emojiObject.emoji)
                  }
                  lazyLoadEmojis
                />
              </div>

              {/* Reply Section */}
              <div className="mt-3">
                <textarea
                  placeholder="Reply..."
                  value={replyInputs[index] || ''}
                  onChange={(e) => handleReplyChange(index, e.target.value)}
                  className="w-full border rounded p-1 mb-1"
                />
                <button
                  onClick={() => handleSubmitReply(index)}
                  className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Reply
                </button>
              </div>

              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="mt-3 ml-4 border-l pl-3 space-y-2">
                  {comment.replies.map((reply, ridx) => (
                    <div key={ridx} className="text-sm">
                      <div className="flex items-center gap-2">
                        <img
                          src={reply.userIcon || '/default-avatar.png'}
                          alt={reply.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="font-medium">{reply.username}</span>
                      </div>
                      <p className="ml-8">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
