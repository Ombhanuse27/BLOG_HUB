import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, get } from "firebase/database";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { rtdb, db } from './firebase'; // Ensure db is imported from your firebase configuration
import userIcon from '../img/user.png'; // Default user icon
import { auth } from './firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare, faBookmark } from '@fortawesome/free-solid-svg-icons';

function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false); // State to control comment section visibility

  useEffect(() => {
    const fetchPostData = async () => {
      const postRef = ref(rtdb, `posts/${postId}`);
      const snapshot = await get(postRef);
      if (snapshot.exists()) {
        setPost(snapshot.val());
      } else {
        console.error("Post not found");
      }
    };
    fetchPostData();
  }, [postId]);

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

  return (
    <div className="flex">
    <div className="p-4 bg-gray-100 mr-60 ml-40 relative">
      <div className="bg-white p-4 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <img src={post.userIcon || userIcon} alt="User" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <p className="font-bold">
                {post.user || "Unknown User"}
                {post.userId !== auth.currentUser?.uid && (
                  <button
                    onClick={handleFollow}
                    className={`ml-2 p-1 ${isFollowing ? 'bg-gray-300' : 'bg-blue-500'} text-white rounded`}
                    disabled={isFollowing}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </p>
              <p className="text-sm text-gray-500">Category: {post.category?.categoryTitle || "Uncategorized"}</p>
            </div>
          </div>
          <p className="text-gray-500">{formatDate(post.timestamp)}</p>
        </div>
        
        <img 
          src={post.bannerUrl} 
          alt={post.title} 
          className="w-full h-auto max-h-96 object-cover mb-4 rounded" 
        />
        
        <div
          className="text-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <div className="flex justify-between items-center mt-4 px-4 py-2 border-t">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500">
            <FontAwesomeIcon icon={faHeart} />
            <span>Like</span>
          </button>
          <button 
            onClick={() => setShowComments(true)} // Show comments on click
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500"
          >
            <FontAwesomeIcon icon={faComment} />
            <span>Comment</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
            <FontAwesomeIcon icon={faShare} />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-yellow-500">
            <FontAwesomeIcon icon={faBookmark} />
            <span>Save</span>
          </button>
        </div>
      </div>
     
      
    </div>
    {/* Sidebar for comments */}
    {showComments && (
        <div className="fixed bottom-0 right-0 h-70 w-1/5 bg-white shadow-md p-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Comments</h2>
            <button onClick={() => setShowComments(false)} className="text-gray-600 text-xl">✕</button>
          </div>
          <div className="mt-4">
            {/* Example comment layout */}
            <div className="flex items-center mb-4">
              <img src={userIcon} alt="User" className="w-8 h-8 rounded-full mr-3" />
              <div className="bg-gray-100 p-2 rounded-md">
                <p><strong>Narendra Modi</strong></p>
                <p>Jay Shree Ram</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <img src={userIcon} alt="User" className="w-8 h-8 rounded-full mr-3" />
              <div className="bg-gray-100 p-2 rounded-md">
                <p><strong>Bill Gates</strong></p>
                <p>Great post!</p>
              </div>
            </div>
            {/* Add more comments here */}
          </div>
          <div className="flex items-center mt-4">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 p-2 border rounded-l-md"
            />
            <button className="p-2 bg-blue-500 text-white rounded-r-md">Post</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetail;
