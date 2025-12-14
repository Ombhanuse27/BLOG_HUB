import axios from "axios";


const BASE_URL = "https://blog-hub-ud2n.onrender.com/api"; // Update with your backend URL
//const BASE_URL = "http://localhost:5000/api"; // Local backend URL for development


const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};


export const getUserById2 = async (userId, token) => {
  const res = await axios.get(`${BASE_URL}/getuser/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res; // or `return res.data;` if you want data only — adjust callers accordingly
};


export const registerUser = async (userData) => {
  return await axios.post(`${BASE_URL}/auth/register`, userData);
};

export const loginUser = async (credentials) => {
  return await axios.post(`${BASE_URL}/auth/login`, credentials);
};

export const getUserById = async (userId, token) => {
  return await axios.get(`${BASE_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAllPosts = async (token) => {
  return await axios.get(`${BASE_URL}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};



export const createPost = async (postData, token) => {
  return await axios.post(`${BASE_URL}/posts`, postData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const uploadImageToCloudinary = async (imageFile) => {
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/da9xvfoye/upload";
  const CLOUDINARY_PRESET = "ml_default";

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", CLOUDINARY_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error("Image upload failed");
  }
};


export const updateFollowedTopics = async (userId, followedTopics, token) => {
  return await axios.put(
    `${BASE_URL}/users/${userId}/followed-topics`,
    { followedTopics },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

// ✅ NEW FUNCTION TO GET A USER'S OWN POSTS
export const getUserPosts = async (userId, token) => {
  const res = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// ... existing imports and functions ...

// ✅ NEW: Get All Users (for the "Who to Follow" section)
export const getAllUsers = async (token) => {
  return await axios.get(`${BASE_URL}/users/getAll`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};


export const fetchPostById = async (postId) => {
  const res = await axios.get(`${BASE_URL}/posts/${postId}`);
  return res.data;
};

export const postComment = async (postId, commentData) => {
  const res = await axios.post(`${BASE_URL}/posts/${postId}/comments`, commentData, getAuthHeader());
  return res.data;
};


export const deleteCommentById = async (postId, commentId) => {
  const res = await axios.delete(`${BASE_URL}/posts/${postId}/comments/${commentId}`, getAuthHeader());
  return res.data;
};

export const updateCommentById = async (postId, commentId, content) => {
    const res = await axios.put(
        `${BASE_URL}/posts/${postId}/comments/${commentId}`,
        { content }, // Request body
        getAuthHeader()
    );
    return res.data;
};


export const deletePostById = async (postId) => {
  const res = await axios.delete(`${BASE_URL}/posts/${postId}`,getAuthHeader());
  return res.data;
};

// ✅ Add this function to your api.js file

export const updatePostById = async (postId, postData, token) => {
  const res = await axios.put(`${BASE_URL}/posts/${postId}`, postData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const toggleLikePost = async (postId) => {
  const res = await axios.put(`${BASE_URL}/posts/${postId}/like`, {}, getAuthHeader());
  return res.data;
};


export const toggleSavePost = async (postId) => {
  const res = await axios.put(`${BASE_URL}/posts/${postId}/save`, {}, getAuthHeader());
  return res.data;
};
export const toggleFollowUser = async (userId) => {
  const res = await axios.put(`${BASE_URL}/users/${userId}/follow`, {}, getAuthHeader());
  return res.data;
};

export const checkIfFollowingUser = async (userId) => {
  const res = await axios.get(`${BASE_URL}/users/${userId}/isFollowing`, getAuthHeader());
  return res.data.following;
};


export const checkIfPostSaved = async (postId) => {
  const res = await axios.get(`${BASE_URL}/posts/${postId}/isSaved`, getAuthHeader());
  return res.data.saved;
};


// Get saved posts for a user
export const getSavedPosts = async (userId, token) => {
  const res = await axios.get(`${BASE_URL}/users/${userId}/saved-posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Update user profile by ID
export const updateUserById = async (userId, updatedData, token) => {
  const res = await axios.put(`${BASE_URL}/users/${userId}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

// api.js (frontend)
export const sendChatRequest = async (toUserId) => {
  const res = await axios.post(`${BASE_URL}/chat/request/${toUserId}`, {}, getAuthHeader());
  return res.data;
};

export const getIncomingChatRequests = async () => {
  const res = await axios.get(`${BASE_URL}/chat/requests/incoming`, getAuthHeader());
  return res.data;
};

export const acceptChatRequest = async (requestId) => {
  const res = await axios.put(`${BASE_URL}/chat/request/${requestId}/accept`, {}, getAuthHeader());
  return res.data;
};

export const rejectChatRequest = async (requestId) => {
  const res = await axios.put(`${BASE_URL}/chat/request/${requestId}/reject`, {}, getAuthHeader());
  return res.data;
};

export const getConversation = async (conversationId) => {
  const res = await axios.get(`${BASE_URL}/chat/conversation/${conversationId}`, getAuthHeader());
  return res.data;
};

// 💡 FIX: Make sure these functions send the auth header
export const getConversations = async () => {
  const { data } = await axios.get(`${BASE_URL}/chat/conversations`, getAuthHeader());
  return data;
};

export const getChatStatus = async (otherUserId) => {
  const { data } = await axios.get(`${BASE_URL}/chat/status/${otherUserId}`, getAuthHeader());
  return data;
};