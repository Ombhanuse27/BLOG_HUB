import React, { useEffect, useState } from "react";
import { rtdb } from './firebase'; // Import Realtime Database
import { ref as dbRef, onValue } from "firebase/database"; // Firebase Realtime Database methods
import { useParams } from "react-router-dom"; // For accessing dynamic route parameters
import userIcon from '../img/user.png'; // User icon image
import { toast } from "react-toastify"; // To show error/success notifications

const PostPage = () => {
  const { postId } = useParams();  // Fetch postId from the URL params
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) {
      toast.error("Invalid Post ID!");
      setLoading(false);
      return;
    }

    // Fetch post data from Firebase Realtime Database
    const postRef = dbRef(rtdb, `posts/${postId}`);

    onValue(postRef, (snapshot) => {
      if (snapshot.exists()) {
        setPost(snapshot.val()); // Set the post data
        setLoading(false);  // Stop loading
      } else {
        toast.error("Post not found.");
        setPost(null);  // Clear post data
        setLoading(false);  // Stop loading even if there's no data
      }
    }, (error) => {
      console.error("Error fetching post data:", error);
      toast.error("Error fetching post data.");
      setLoading(false);
    });
  }, [postId]);  // Dependency on postId to fetch the correct post

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (!post) {
    return <p>Post not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white shadow-md rounded-lg">
      {/* Post Title */}
      <h1 className="text-4xl font-bold mb-4 text-center">{post.title}</h1>

      {/* User Information */}
      <div className="flex items-center mb-6">
        <img
          src={userIcon} // Replace this with the user’s profile picture URL
          alt="User Icon"
          className="rounded-full mr-4"
        />
        <span className="text-xl font-semibold">{post.user || "Unknown User"}</span> {/* Username */}
      </div>

      {/* Post Banner */}
      {post.bannerUrl ? (
        <div className="mb-6">
          <img
            src={post.bannerUrl}
            alt="Post Banner"
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      ) : (
        <p>No banner available</p>
      )}

      {/* Post Content */}
      <div className="text-lg leading-7 mt-4">
        <p>{post.content}</p>
      </div>

      {/* Post Category */}
      <div className="mt-4 text-sm text-gray-600">
        <span>Category: {post.category?.categoryTitle || "Uncategorized"}</span>
      </div>
    </div>
  );
};

export default PostPage;
