import axios from "axios";


const BASE_URL = "http://localhost:5000/api"; // Update with your backend URL


const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
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


export const deletePostById = async (postId) => {
  const res = await axios.delete(`${BASE_URL}/posts/${postId}`,getAuthHeader());
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
