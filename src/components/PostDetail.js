import React, { useState, useEffect,useRef } from 'react';
import { useParams,useNavigate  } from 'react-router-dom';
import { ref, get,set, update, child, push,remove } from "firebase/database";
import { doc, updateDoc, getDoc,setDoc,deleteDoc } from "firebase/firestore";
import { rtdb, db } from './firebase';
import userIcon from '../img/user.png';
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import app from './firebase';
import EmojiPicker from 'emoji-picker-react';
import StickerPicker from './stickerPicker';
import { faEllipsisV,faHeart, faComment, faShare, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faTwitter, faFacebook, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

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
  const [reaction, setReaction] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [user, setUser] = useState(null);
  const [commentImage, setCommentImage] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const navigate = useNavigate();

  const menuRef = useRef(null); // Create a ref for the menu

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false); // Hide the menu
      }
    };

    // Add event listener when the menu is shown
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const fetchPostData = async () => {
      const snapshot = await get(ref(rtdb, `posts/${postId}`));
      if (snapshot.exists()) {
        const postData = snapshot.val();
    
        const postUserRef = doc(db, `users/${postData.userId}`);
        const postUserDoc = await getDoc(postUserRef);
    
        if (postUserDoc.exists()) {
          const postUserData = postUserDoc.data();
          postData.userIcon = postUserData.photo || userIcon;
        }
    
        const commentsWithPhotos = await Promise.all(
          Object.entries(postData.comments || {}).map(async ([commentId, comment]) => {
            const commentUserRef = doc(db, `users/${comment.userId}`);
            const commentUserDoc = await getDoc(commentUserRef);
    
            return {
              ...comment,
              id: commentId, // Add the commentId to the comment object
              userIcon: commentUserDoc.exists() ? commentUserDoc.data().photo || userIcon : userIcon,
            };
          })
        );
    
        setPost(postData);
        setComments(commentsWithPhotos);
        const currentUser = auth.currentUser;
        if (currentUser && postData.likes) {
          setIsLiked(Object.keys(postData.likes).includes(currentUser.uid));
        }
      } else {
        console.error("Post not found");
      }
    };
  
    fetchPostData();
  }, [postId]);
  
  
  const handlePostComment = async () => {
    const currentUser = auth.currentUser;
    if (currentUser && newComment.trim()) {
      const currentUserRef = doc(db, `users/${currentUser.uid}`);
      const currentUserDoc = await getDoc(currentUserRef);
      
      // Fetch user's display name and photo URL
      let userName = currentUser.displayName || "Unknown User";
      let userPhotoURL = userIcon;
      
      if (currentUserDoc.exists()) {
        const currentUserData = currentUserDoc.data();
        userName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || userName;
        userPhotoURL = currentUserData.photo || userIcon;
      }
      
      const newCommentObj = {
        userId: currentUser.uid,
        userName,
        userIcon: userPhotoURL,
        content: newComment,
        timestamp: Date.now(),
      };
  
      const commentsRef = ref(rtdb, `posts/${postId}/comments`);
      const newCommentRef = push(commentsRef);
      await update(newCommentRef, newCommentObj);
  
      // Update comments state to show the new comment
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };
  
  
  

const handleShareClick = () => {
  setShowShareOptions(!showShareOptions);
};

useEffect(() => {
  const checkIfSaved = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const savedPostRef = doc(db, `users/${currentUser.uid}/savedPosts`, postId);
      const savedDoc = await getDoc(savedPostRef);
      setIsSaved(savedDoc.exists()); // Set isSaved to true if the post is already saved
    }
  };
  if (post) {
    checkIfSaved();
  }
}, [post, postId]);


const handleSavePost = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const savedPostRef = doc(db, `users/${currentUser.uid}/savedPosts`, postId);

    if (isSaved) {
      // If the post is already saved, remove it
      console.log("Removing post from saved posts...");
      await deleteDoc(savedPostRef);
      setIsSaved(false);
      console.log("Post removed from saved posts.");
      alert("Post removed from your saved posts.");
    } else {
      // If the post is not saved, save it
      console.log("Saving post to saved posts...");
      await setDoc(savedPostRef, {
        title: post.title,
        content: post.content,
        timestamp: post.timestamp,
        bannerUrl: post.bannerUrl,
        category: post.category,
        user: post.user,
        userId: post.userId,
      });
      setIsSaved(true);
      console.log("Post saved to saved posts.");
      alert("Post saved to your profile!");
    }
  } else {
    console.log("User not logged in.");
  }
};

  
  useEffect(() => {
    const checkIfFollowing = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, `users/${post.userId}`);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const followers = userDoc.data().followers || [];
          setIsFollowing(followers.some(follower => follower.uid === currentUser.uid));
        }
      }
    };
    if (post) {
      checkIfFollowing();
    }
  }, [post]);

  const handleFollow = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const postUserRef = doc(db, `users/${post.userId}`);
      const postUserDoc = await getDoc(postUserRef);
      if (postUserDoc.exists()) {
        const postUserData = postUserDoc.data();
        const followers = postUserData.followers || [];
        const currentUserRef = doc(db, `users/${currentUser.uid}`);
        const currentUserDoc = await getDoc(currentUserRef);
        let fullName = "Unknown User";
        if (currentUserDoc.exists()) {
          const currentUserData = currentUserDoc.data();
          fullName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim();
        }
        if (!followers.some(follower => follower.uid === currentUser.uid)) {
          followers.push({ uid: currentUser.uid, name: fullName });
          await updateDoc(postUserRef, { followers });
          setIsFollowing(true);
        }
      }
    } else {
      console.log("User not logged in.");
    }
  };

  const handleLike = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const likesRef = ref(rtdb, `posts/${postId}/likes/${currentUser.uid}`);
  
      if (isLiked) {
        // Unlike the post: Remove the user from likes
        await remove(likesRef);  // Remove the user's like entry
        setIsLiked(false);
      } else {
        // Like the post: Add the user's data to likes
        const userName = currentUser.displayName || "Unknown User";
        await set(likesRef, { userId: currentUser.uid, userName });
        setIsLiked(true);
      }
    } else {
      console.log("User not logged in.");
    }
  };
  if (!post) {
    return <div>Loading...</div>;
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm("Do you want to delete the post?");
    if (confirmDelete) {
      try {
        // Delete from Realtime Database
        await remove(ref(rtdb, `posts/${postId}`));
  
        // Delete from Firestore if necessary
        await deleteDoc(doc(db, 'posts', postId));
  
        alert("Post deleted successfully.");
        navigate('/homepage');  // Redirect to homepage or another page
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post.");
      }
    }
  };

  const handleDelete = (commentId) => {
    const commentRef = ref(rtdb, `posts/${postId}/comments/${commentId}`);
    remove(commentRef)
      .then(() => {
        console.log("Comment deleted successfully");
        // Update the UI by removing the deleted comment
        setComments(comments.filter(comment => comment.id !== commentId));
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
      });
  };


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
            <img src={post.userIcon || userIcon} alt="User" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <p className="font-bold">
                {post.user || "Unknown User"}
                {post.userId !== auth.currentUser?.uid && (
                  <button
                    onClick={handleFollow}
                    className={`ml-2 mt-1 sm:mt-0 p-1 text-sm ${isFollowing ? 'bg-gray-300' : 'bg-blue-500'} text-white rounded`}
                    disabled={isFollowing}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </p>
              <p className="text-sm text-gray-500">Category: {post.category?.categoryTitle || "Uncategorized"}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 sm:mt-0">{formatDate(post.timestamp)}</p>
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
            style={{ color: isLiked ? 'red' : 'black' }}
          >
            <FontAwesomeIcon icon={faHeart} />
            <span>{isLiked ? "Liked" : "Like"}</span>
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
            style={{ color: isSaved ? 'green' : 'black' }}
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
          <button onClick={() => setShowComments(false)} className="text-gray-600 text-xl">✕</button>
        </div>
        <div className="mt-4 space-y-4">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className="bg-gray-100 p-3 rounded-lg shadow hover:bg-gray-200"
              onContextMenu={(e) => {
                e.preventDefault();
                if (currentUser === comment.userId) {
                  if (window.confirm("Do you want to delete this comment?")) {
                    handleDelete(comment.id);
                  }
                } else {
                  alert("You are not authorized to delete this comment.");
                }
              }}
            >
              <div className="flex items-center mb-2">
                <img src={comment.userIcon || userIcon} alt="User" className="w-8 h-8 rounded-full mr-3" />
                <div>
                  <p className="font-semibold text-sm">{comment.userName}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
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
          <button onClick={handlePostComment} className="p-2 bg-blue-500 text-white rounded-r-md text-sm">Post</button>
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
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faLinkedin} />
              <span>LinkedIn</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faTwitter} />
              <span>Twitter</span>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faFacebook} />
              <span>Facebook</span>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`}
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
