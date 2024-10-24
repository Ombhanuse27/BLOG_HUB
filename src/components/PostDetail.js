import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, get } from "firebase/database";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { rtdb, db } from './firebase'; // Ensure db is imported from your firebase configuration
import userIcon from '../img/user.png'; // Default user icon
import { auth } from './firebase'; // Ensure auth is imported for current user

function PostDetail() {
  const { postId } = useParams(); // Get postId from URL
  const [post, setPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false); // State to manage following status

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
          // Check if current user is already in followers
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

        // Get the current user's details to form the full name
        const currentUserRef = doc(db, `users/${currentUser.uid}`);
        const currentUserDoc = await getDoc(currentUserRef);
        let fullName = "Unknown User"; // Default value

        if (currentUserDoc.exists()) {
          const currentUserData = currentUserDoc.data();
          fullName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim(); // Combine first and last name
        }

        // Check if the current user is not already following
        if (!followers.some(follower => follower.uid === currentUser.uid)) {
          // Add the current user's full name to the poster's followers list
          followers.push({ uid: currentUser.uid, name: fullName });
          await updateDoc(postUserRef, { followers });
          setIsFollowing(true); // Update local state to reflect the following status
        }
      }
    } else {
      console.log("User not logged in.");
    }
  };

  if (!post) {
    return <div>Loading...</div>; // Show loading message while fetching
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
    <div className="p-4 bg-gray-100 mr-60 ml-60">
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
                    disabled={isFollowing} // Disable button if already following
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
        
        {/* Adjusted banner image for proper sizing and responsiveness */}
        <img 
          src={post.bannerUrl} 
          alt={post.title} 
          className="w-full h-auto max-h-96 object-cover mb-4 rounded" 
        />
        
        {/* Use dangerouslySetInnerHTML to render HTML content */}
        <div
          className="text-lg"
          dangerouslySetInnerHTML={{ __html: post.content }} // This will render HTML directly
        />
      </div>
    </div>
  );
}

export default PostDetail;
