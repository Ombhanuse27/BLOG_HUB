// ✅ PostDetail.js (Fixed Invalid Time Value Error)
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import userIcon from "../img/user.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./PostDetail.css";
import {
  faEllipsisV,
  faHeart,
  faComment,
  faShare,
  faBookmark,
  faPaperPlane,
  faTimes,
  faTrash,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { formatDistanceToNow } from "date-fns";
import {
  fetchPostById,
  postComment,
  deletePostById,
  deleteCommentById,
  updateCommentById,
  toggleLikePost,
  toggleSavePost,
  toggleFollowUser,
  checkIfFollowingUser,
  checkIfPostSaved,
  getUserById,
} from "../api/api";

// Helper function to safely format dates
const getRelativeTime = (timestamp) => {
  if (!timestamp) {
    return "just now";
  }
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "a moment ago";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "a moment ago";
  }
};


const Comment = memo(({ comment, isReply = false, currentUser, handlers }) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  const { startEditing, startReplying, handleDeleteComment, handleUpdateComment, handlePostComment, editingComment, replyingTo, setReplyingTo, setEditingComment } = handlers;

  useEffect(() => {
      const handleClickOutside = (event) => {
          if (optionsRef.current && !optionsRef.current.contains(event.target)) {
              setShowOptions(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isEditing = editingComment.id === comment._id;
  const isReplying = replyingTo.id === comment._id;
  const nestedReplies = comment.replies || [];

  return (
    <div className={`flex items-start space-x-3 ${isReply ? "ml-4" : ""}`}>
      <img
        src={comment.userIcon || userIcon}
        alt="User"
        className="w-9 h-9 rounded-full mt-1"
      />
      <div className="flex-1">
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm">{comment.userName}</p>
            {currentUser === comment.userId && !isEditing && (
              <div className="relative" ref={optionsRef}>
                <button onClick={() => setShowOptions(!showOptions)} className="text-gray-500 hover:text-gray-800">
                  <FontAwesomeIcon icon={faEllipsisV} size="sm" />
                </button>
                {showOptions && (
                  <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-lg z-20">
                    <button
                      onClick={() => {
                         startEditing(comment);
                         setShowOptions(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <FontAwesomeIcon icon={faPen} /> <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 w-full"
                    >
                      <FontAwesomeIcon icon={faTrash} /> <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editingComment.text}
                onChange={(e) => setEditingComment({ ...editingComment, text: e.target.value })}
                className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <div className="flex justify-end space-x-2 mt-1">
                <button onClick={() => setEditingComment({ id: null, text: "" })} className="text-xs text-gray-600 hover:underline">Cancel</button>
                <button onClick={handleUpdateComment} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
          {/* 🐛 FIX: Using the safe helper function to prevent crashes */}
          <span>{getRelativeTime(comment.createdAt)}</span>
          {!isEditing && (
            <button
              onClick={() => startReplying(comment)}
              className="font-semibold hover:underline"
            >
              Reply
            </button>
          )}
        </div>

        {isReplying && (
          <div className="flex items-center mt-3">
            <input
              type="text"
              value={replyingTo.text}
              onChange={(e) => setReplyingTo({ ...replyingTo, text: e.target.value })}
              placeholder={`Replying to ${comment.userName}...`}
              className="flex-1 p-2 border rounded-l-md text-sm focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handlePostComment(comment._id)}
            />
            <button
              onClick={() => handlePostComment(comment._id)}
              className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        )}

        {nestedReplies.length > 0 && (
          <div className="mt-4 space-y-4">
            {nestedReplies.map((reply) => (
              <Comment key={reply._id} comment={reply} isReply={true} currentUser={currentUser} handlers={handlers}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});


function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [editingComment, setEditingComment] = useState({ id: null, text: "" });
  const [replyingTo, setReplyingTo] = useState({ id: null, text: "" });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const id = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (id && token) {
        try {
            const res = await getUserById(id, token);
            setUser({ name: res.data.name || "Unknown", photo: res.data.photo || "" });
            setCurrentUser(id);
        } catch (error) {
            console.error("Failed to fetch current user", error);
        }
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postData = await fetchPostById(postId);
        if (!postData) return;

        const token = localStorage.getItem("token");
        const userRes = await getUserById(postData.userId, token).catch(() => null);
        const userIconUrl = userRes?.data?.photo || userIcon;

        setPost({ ...postData, userIcon: userIconUrl });
        setComments(postData.comments || []);

        const currentUserId = localStorage.getItem("userId");
        if (currentUserId && postData.likes) {
          setIsLiked(postData.likes.some((like) => like.userId === currentUserId));
        }
      } catch (error) {
        console.error("Failed to fetch post details:", error);
      }
    };

    fetchPostData();
  }, [postId]);

  const handlePostComment = useCallback(async (parentId = null) => {
    const content = parentId ? replyingTo.text : newComment;
    if (!currentUser || !content.trim() || !user) return;
    const commentData = { userId: currentUser, content, userName: user.name, userIcon: user.photo || "", parentId };
    const res = await postComment(postId, commentData);
    if (res?.comment) {
      setComments((prev) => [...prev, res.comment]);
      if (parentId) {
        setReplyingTo({ id: null, text: "" });
      } else {
        setNewComment("");
      }
    }
  }, [postId, currentUser, user, newComment, replyingTo]);

  const handleUpdateComment = useCallback(async () => {
    if (!editingComment.id || !editingComment.text.trim()) return;
    const res = await updateCommentById(postId, editingComment.id, editingComment.text);
    if (res.success && res.comment) {
      setComments((prev) => prev.map((c) => (c._id === editingComment.id ? res.comment : c)));
      setEditingComment({ id: null, text: "" });
    }
  }, [postId, editingComment]);
  
  const handleDeleteComment = useCallback(async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      const res = await deleteCommentById(postId, commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    }
  }, [postId]);
  
  const startEditing = useCallback((comment) => {
    setReplyingTo({ id: null, text: "" });
    setEditingComment({ id: comment._id, text: comment.content });
  }, []);
  
  const startReplying = useCallback((comment) => {
    setEditingComment({ id: null, text: "" });
    setReplyingTo({ id: comment._id, text: "" });
  }, []);

  const handleLike = useCallback(async () => {
    if (!currentUser) return;
    const originalIsLiked = isLiked;
    
    setPost(prevPost => {
      const currentLikes = prevPost.likes || [];
      const newLikes = originalIsLiked
        ? currentLikes.filter(like => like.userId !== currentUser)
        : [...currentLikes, { userId: currentUser }];
      return { ...prevPost, likes: newLikes };
    });
    setIsLiked(!originalIsLiked);

    try {
      await toggleLikePost(postId);
    } catch (err) {
      console.error("Failed to like the post. Reverting changes.", err);
      setPost(prevPost => {
         const currentLikes = prevPost.likes || [];
         const revertedLikes = originalIsLiked
            ? [...currentLikes, { userId: currentUser }]
            : currentLikes.filter(like => like.userId !== currentUser);
         return { ...prevPost, likes: revertedLikes };
      });
      setIsLiked(originalIsLiked);
      alert("Couldn't update like. Please try again.");
    }
  }, [isLiked, currentUser, postId]);

  const handleSavePost = useCallback(async () => {
    const originalIsSaved = isSaved;
    setIsSaved(!originalIsSaved);
    try {
      await toggleSavePost(postId);
    } catch (err) {
      console.error("Failed to save the post. Reverting changes.", err);
      setIsSaved(originalIsSaved);
      alert("Couldn't save post. Please try again.");
    }
  }, [isSaved, postId]);

  const handleFollow = useCallback(async () => {
    if (!post?.userId) return;
    const res = await toggleFollowUser(post.userId);
    if (res.success) setIsFollowing(true);
  }, [post?.userId]);
  
  const handleDeletePost = useCallback(async () => {
    if (window.confirm("Do you want to delete the post?")) {
      const res = await deletePostById(postId);
      if (res.success) {
        alert("Post deleted successfully.");
        navigate("/homepage");
      }
    }
  }, [postId, navigate]);

  useEffect(() => {
    if (post) {
      checkIfPostSaved(postId).then(setIsSaved);
    }
  }, [post, postId]);

  useEffect(() => {
    if (post && currentUser) {
      checkIfFollowingUser(post.userId).then(setIsFollowing);
    }
  }, [post, currentUser]);

  if (!post) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const buildCommentTree = (commentsList) => {
      const commentMap = {};
      const tree = [];
      commentsList.forEach(comment => {
          commentMap[comment._id] = { ...comment, replies: [] };
      });
      commentsList.forEach(comment => {
          if (comment.parentId && commentMap[comment.parentId]) {
              commentMap[comment.parentId].replies.push(commentMap[comment._id]);
          } else {
              tree.push(commentMap[comment._id]);
          }
      });
      const sortByDate = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
      tree.sort(sortByDate);
      Object.values(commentMap).forEach(comment => comment.replies.sort(sortByDate));
      return tree;
  };

  const commentTree = buildCommentTree(comments);
  const commentHandlers = { startEditing, startReplying, handleDeleteComment, handleUpdateComment, handlePostComment, editingComment, replyingTo, setReplyingTo, setEditingComment };

  return (
    <div className="flex w-full lg:h-screen bg-gray-100">
      <div className={`w-full lg:overflow-y-auto p-4 lg:p-8 post-scrollbar transition-all duration-500 ease-in-out ${showComments ? 'lg:w-3/5' : 'lg:w-full'}`}>
        <div className="bg-white p-6 shadow-md rounded-lg max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold">{post.title}</h1>
          </div>
          <div className="flex items-center mb-4">
            <img src={post.userIcon || userIcon} alt="User" className="w-12 h-12 rounded-full mr-4"/>
            <div>
              <p className="font-bold">{post.user || "Unknown User"}</p>
              {/* 🐛 FIX: Added a check for post.createdAt before formatting */}
              <p className="text-sm text-gray-500">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "..."}</p>
            </div>
          </div>
          <img src={post.bannerUrl} alt={post.title} className="w-full h-auto max-h-[500px] object-cover mb-6 rounded-md"/>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }}/>
          <div className="flex flex-wrap justify-around items-center mt-6 py-2 border-t border-b gap-2">
              <button onClick={handleLike} className="flex items-center space-x-2 text-gray-600" style={{ color: isLiked ? "red" : "inherit" }}>
                <FontAwesomeIcon icon={faHeart} /> <span>{post.likes?.length || 0} {isLiked ? "Liked" : "Like"}</span>
              </button>
              <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                <FontAwesomeIcon icon={faComment} /> <span>{comments.length} Comments</span>
              </button>
              <button onClick={() => setShowShareOptions(true)} className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
                <FontAwesomeIcon icon={faShare} /> <span>Share</span>
              </button>
              <button onClick={handleSavePost} className="flex items-center space-x-2 text-gray-600" style={{ color: isSaved ? "#16a34a" : "inherit" }}>
                <FontAwesomeIcon icon={faBookmark} /> <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
          </div>
        </div>
      </div>

      {showComments && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-2/5 h-full bg-white border-l border-gray-200">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
                <button onClick={() => setShowComments(false)} className="text-gray-500 hover:text-gray-800">
                    <FontAwesomeIcon icon={faTimes} size="lg"/>
                </button>
              </div>
              <div className="flex-1 p-4 space-y-6 overflow-y-auto comment-scrollbar">
                {commentTree.length > 0 ? (
                  commentTree.map((comment) => (
                    <Comment key={comment._id} comment={comment} currentUser={currentUser} handlers={commentHandlers} />
                  ))
                ) : (
                  <div className="text-center text-gray-500 mt-12"><p className="text-lg">No comments yet.</p><p>Be the first to share your thoughts! ✍️</p></div>
                )}
              </div>
              <div className="flex items-center p-4 border-t bg-gray-50">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 p-2 border rounded-l-md text-sm focus:ring-2 focus:ring-blue-500" onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}/>
                <button onClick={() => handlePostComment()} className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"><FontAwesomeIcon icon={faPaperPlane} /></button>
              </div>
            </div>
          </div>

          {/* Mobile Modal */}
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowComments(false)}>
            <div className="fixed bottom-0 left-0 right-0 h-4/5 bg-white rounded-t-2xl shadow-xl z-50 flex flex-col" onClick={(e) => e.stopPropagation()}>
               <div className="p-4 text-right border-b">
                  <button onClick={() => setShowComments(false)} className="text-gray-600 text-2xl hover:text-black">
                     <FontAwesomeIcon icon={faTimes} />
                  </button>
               </div>
               <div className="flex-1 p-4 space-y-6 overflow-y-auto comment-scrollbar">
                  {commentTree.length > 0 ? (
                    commentTree.map((comment) => (
                      <Comment key={comment._id} comment={comment} currentUser={currentUser} handlers={commentHandlers} />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 mt-12"><p className="text-lg">No comments yet.</p><p>Be the first to share your thoughts! ✍️</p></div>
                  )}
                </div>
                <div className="flex items-center p-4 border-t bg-gray-50">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 p-2 border rounded-l-md text-sm focus:ring-2 focus:ring-blue-500" onKeyPress={(e) => e.key === 'Enter' && handlePostComment()} />
                    <button onClick={() => handlePostComment()} className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"><FontAwesomeIcon icon={faPaperPlane} /></button>
                </div>
            </div>
          </div>
        </>
      )}
      
      {showShareOptions && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50 px-2">
            <div className="bg-white p-4 rounded shadow-lg space-y-4 w-full max-w-sm relative">
                <h3 className="text-lg font-bold">Share on:</h3>
                <button
                    onClick={() => setShowShareOptions(false)}
                    className="absolute top-2 right-2 text-gray-600 text-xl"
                >
                    ✕
                </button>
                <div className="flex flex-col space-y-2">
                     <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50 px-2">
            <div className="bg-white p-4 rounded shadow-lg space-y-4 w-full max-w-sm relative">
              <h3 className="text-lg font-bold">Share on:</h3>
              <button
                onClick={() => setShowShareOptions(false)}
                className="absolute top-2 right-2 text-gray-600 text-xl"
              >
                ✕
              </button>
              <div className="flex flex-col space-y-2">
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                    window.location.href
                  )}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faLinkedin} />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    window.location.href
                  )}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faTwitter} />
                  <span>Twitter</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                  <span>Facebook</span>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    post.title + " " + window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
        </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default PostDetail;