// ✅ PostDetail.js (MERN Version using api.js)
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import userIcon from "../img/user.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faHeart,
  faComment,
  faShare,
  faBookmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import EmojiPicker from "emoji-picker-react";
import StickerPicker from "./stickerPicker";
// Assuming you have firebase auth set up

import {
  fetchPostById,
  postComment,
  deletePostById,
  deleteCommentById,
  toggleLikePost,
  toggleSavePost,
  toggleFollowUser,
  checkIfFollowingUser,
  checkIfPostSaved,
  getUserById,
} from "../api/api";

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
  const [reaction, setReaction] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [user, setUser] = useState({}); // Full user object
  const [commentImage, setCommentImage] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const id = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (id && token) {
        const res = await getUserById(id, token);
        console.log("Current User:", res);
        setUser({
          name: res.data.name || "Unknown",
          photo: res.data.photo || "",
        });
        // this sets full user object including name, photo
        setCurrentUser(id);
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
    const uid = localStorage.getItem("userId");
    setCurrentUser(uid || null);
  }, []);

  useEffect(() => {
    const fetchPostData = async () => {
      const res = await fetchPostById(postId);
      let userIconUrl = userIcon;
      const token = localStorage.getItem("token");

      try {
        const userRes = await getUserById(res.userId, token);
        userIconUrl = userRes?.data?.photo || userIcon;
      } catch (err) {
        console.warn(`Failed to get user icon for userId ${res.userId}`);
      }
      if (res) {
        setPost({...res, 
          userIcon: userIconUrl,});
        setComments(res.comments || []);
      }
    };
    fetchPostData();
  }, [postId]);

  const handlePostComment = async () => {
    console.log("🔼 Sending Comment:", {
      content: newComment,
      userId: currentUser,
      userName: user?.name,
      userIcon: user?.photo,
    });

    if (currentUser && newComment.trim() && user) {
      const res = await postComment(postId, {
        userId: currentUser,
        content: newComment,
        userName: user.name, // ✅ from fetched user
        userIcon: user.photo || "", // ✅ from fetched user
      });
      if (res?.comment) {
        setComments((prev) => [...prev, res.comment]);
      }
    }
  };

  const handleDelete = async (commentId) => {
    const res = await deleteCommentById(postId, commentId);
    if (res.success) {
      setComments(comments.filter((c) => c._id !== commentId));
    }
  };

  const handleLike = async () => {
    const res = await toggleLikePost(postId);
    if (res.success) setIsLiked(!isLiked);
  };

  useEffect(() => {
    const checkSaved = async () => {
      const saved = await checkIfPostSaved(postId);
      setIsSaved(saved);
    };
    if (post) checkSaved();
  }, [post]);

  const handleSavePost = async () => {
    const res = await toggleSavePost(postId);
    if (res.success) {
      setIsSaved(!isSaved);
      alert(res.message);
    }
  };

  useEffect(() => {
    const checkFollowing = async () => {
      if (post && currentUser) {
        const following = await checkIfFollowingUser(post.userId);
        setIsFollowing(following);
      }
    };
    checkFollowing();
  }, [post]);

  const handleFollow = async () => {
    const res = await toggleFollowUser(post.userId);
    if (res.success) setIsFollowing(true);
  };

  const handleDeletePost = async () => {
    if (window.confirm("Do you want to delete the post?")) {
      const res = await deletePostById(postId);
      if (res.success) {
        alert("Post deleted successfully.");
        navigate("/homepage");
      }
    }
  };

  const handleShareClick = () => {
    setShowShareOptions(!showShareOptions);
  };

  if (!post) return <div>Loading...</div>;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ Render UI (unchanged)
  return (
    <div className="flex flex-col lg:flex-row">
      <div className="p-4 bg-gray-100 mx-auto w-full lg:w-2/3 relative">
        <div className="bg-white p-4 shadow-md rounded">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">{post.title}</h1>

          {/* Three Dots Icon */}
          <div className="flex justify-end mb-2">
            {currentUser === post.userId && (
              <>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-500"
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                {showMenu && (
                  <div
                    ref={menuRef}
                    className="absolute right-4 mt-2 w-28 bg-white border border-gray-300 rounded shadow-lg z-10"
                  >
                    <button
                      onClick={handleDeletePost}
                      className="block px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* User Info & Timestamp */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="flex items-start">
              <img
                src={post.userIcon || userIcon}
                alt="User"
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <p className="font-bold">
                  {post.user || "Unknown User"}
                  {post.userId !== currentUser?.uid && (
                    <button
                      onClick={handleFollow}
                      className={`ml-2 mt-1 sm:mt-0 p-1 text-sm ${
                        isFollowing ? "bg-gray-300" : "bg-blue-500"
                      } text-white rounded`}
                      disabled={isFollowing}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  Category: {post.category?.categoryTitle || "Uncategorized"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 sm:mt-0">
              {formatDate(post.createdAt)}
            </p>
          </div>

          {/* Banner Image */}
          <img
            src={post.bannerUrl}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover mb-4 rounded"
          />

          {/* Post Content */}
          <div
            className="text-base sm:text-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Interaction Buttons */}
          <div className="flex flex-wrap justify-between items-center mt-4 px-2 py-2 border-t gap-2">
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500"
              onClick={handleLike}
              style={{ color: isLiked ? "red" : "black" }}
            >
              <FontAwesomeIcon icon={faHeart} />
              <span>{isLiked ? "Liked" : "Like"}</span>
              <span className="ml-1 text-sm text-gray-700">
                ({post.likes?.length || 0})
              </span>
            </button>

            <button
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500"
            >
              <FontAwesomeIcon icon={faComment} />
              <span>Comment</span>
            </button>

            <button
              onClick={handleShareClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500"
            >
              <FontAwesomeIcon icon={faShare} />
              <span>Share</span>
            </button>

            <button
              onClick={handleSavePost}
              className="flex items-center space-x-2 text-gray-600 hover:text-yellow-500"
              style={{ color: isSaved ? "green" : "black" }}
            >
              <FontAwesomeIcon icon={faBookmark} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Sidebar (Responsive: takes full width on mobile) */}
      {showComments && (
        <div className="fixed inset-x-0 bottom-0 lg:static lg:inset-auto lg:w-1/3 h-72 lg:h-auto bg-white shadow-md p-4 overflow-y-auto z-40">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold">Comments</h2>
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {comments.map(
              (comment, index) =>
                comment && (
                  <div
                    key={comment._id || index}
                    className="bg-gray-100 p-3 rounded-lg shadow hover:bg-gray-200"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (currentUser === comment.userId) {
                        if (
                          window.confirm("Do you want to delete this comment?")
                        ) {
                          handleDelete(comment._id);
                        }
                      } else {
                        alert("You are not authorized to delete this comment.");
                      }
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <img
                        src={comment.userIcon || userIcon}
                        alt="User"
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-semibold text-sm">
                          {comment.userName}
                        </p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>

          {/* Add Comment Input */}
          <div className="flex items-center mt-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2 border rounded-l-md text-sm"
            />
            <button
              onClick={handlePostComment}
              className="p-2 bg-blue-500 text-white rounded-r-md text-sm"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Share Options Modal (Responsive Centered) */}
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
      )}
    </div>
  );
}

export default PostDetail;
