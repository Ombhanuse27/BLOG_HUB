import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, get } from "firebase/database";
import { rtdb } from './firebase';
import userIcon from '../img/user.png'; // Default user icon

function PostDetail() {
  const { postId } = useParams(); // Get postId from URL
  const [post, setPost] = useState(null);

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
    <div className="p-6 bg-gray-100">
      <div className="bg-white p-4 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <img src={post.userIcon || userIcon} alt="User" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <p className="font-bold">{post.user || "Unknown User"}</p>
              <p className="text-sm text-gray-500">Category: {post.category?.categoryTitle || "Uncategorized"}</p> {/* Display category */}
            </div>
          </div>
          <p className="text-gray-500">{formatDate(post.timestamp)}</p> {/* Display formatted timestamp */}
        </div>
        
        {/* Adjusted banner image for proper sizing and responsiveness */}
        <img 
          src={post.bannerUrl} 
          alt={post.title} 
          className="w-full h-auto max-h-96 object-cover mb-4 rounded" 
        /> {/* Banner image */}
        
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
