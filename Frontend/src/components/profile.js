// Updated Profile.js using clean API abstraction
import React, { useEffect, useState } from "react";
import {
  getUserById,
  uploadImageToCloudinary,
  getSavedPosts,
  updateUserById
} from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import userIcon from "../img/user.png";
import like from "../img/like.png";
import comment from "../img/comment.png";


function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Saved Posts");
  const [savedPosts, setSavedPosts] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editData, setEditData] = useState({
    photo: "",
    name: "",
    address: "",
    phone: "",
    socialLink: "",
    location: "",
    dob: "",
  });
  const navigate = useNavigate();

 const fetchUserData = async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    console.error("No token or user ID found");
    return;
  }

  try {
    const res = await getUserById(userId, token);
    setUserDetails(res.data);
    setEditData(res.data);
  } catch (error) {
    console.error("Failed to fetch user data", error);
  }
};


const fetchSavedPosts = async () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) return;

  try {
    const res = await getSavedPosts(userId, token);
    const enrichedPosts = await Promise.all(
      res.map(async (post) => {
        let userIconUrl = userIcon;
        let likesCount = post.likes ? post.likes.length : 0;
        let commentsCount = post.comments ? post.comments.length : 0;

        try {
          const userRes = await getUserById(post.userId, token);
          userIconUrl = userRes.data.photo || userIcon;
        } catch (err) {
          console.warn(`Could not fetch user for post: ${post._id}`);
        }

        return {
          ...post,
          userIcon: userIconUrl,
          likesCount,
          commentsCount,
        };
      })
    );

    setSavedPosts(enrichedPosts);
  } catch (err) {
    console.error("Failed to fetch saved posts", err);
  }
};



  useEffect(() => {
    fetchUserData();
    fetchSavedPosts();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/SignIn");

    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        
        return;
      }
      

      let photoUrl = userDetails.photo;
      if (editData.photo && editData.photo instanceof File) {
        photoUrl = await uploadImageToCloudinary(editData.photo);
      }

      const updated = await updateUserById(userId, { ...editData, photo: photoUrl }, token);
      setUserDetails(updated);
      setEditData(updated);
      setShowEditProfile(false);
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No Date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-y-auto flex-grow h-[calc(100vh-16rem)]">
        {userDetails ? (
          <>
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <img
                src={userDetails.photo || userIcon}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow"
                alt="Profile"
              />
              <h3 className="mt-4 text-lg sm:text-xl font-semibold">
                Welcome {userDetails.firstName || userDetails.name} 🙏
              </h3>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Email: {userDetails.email}
              </p>
              <button
                className="mt-3 text-blue-600 hover:underline text-sm"
                onClick={() => setShowEditProfile(true)}
              >
                Edit Profile
              </button>
            </div>

            {/* Tabs */}
            <div className="flex justify-center flex-wrap gap-2 sm:space-x-4 mt-6 border-b pb-2">
              {["Saved Posts", "About"].map((section) => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`px-4 py-2 font-medium text-sm sm:text-base ${
                    selectedSection === section
                      ? "border-b-4 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>

            {/* Edit Modal */}
            {showEditProfile && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
                <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-md">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">
                    Edit Profile
                  </h2>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, photo: e.target.files[0] }))
                    }
                    className="mb-2"
                  />
                  {["name", "address", "phone", "socialLink", "location", "dob"].map((field) => (
                    <input
                      key={field}
                      name={field}
                      placeholder={field[0].toUpperCase() + field.slice(1)}
                      value={editData[field]}
                      onChange={handleEditInputChange}
                      className="w-full mb-2 p-2 border rounded text-sm"
                    />
                  ))}
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setShowEditProfile(false)}
                      className="px-4 py-2 bg-gray-300 rounded text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="mt-6">
              {selectedSection === "Saved Posts" ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">Your Saved Posts</h2>
                  {savedPosts.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      {savedPosts.map((post) => (
                        <Link to={`/post/${post._id}`} key={post._id}>
                          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition flex flex-col sm:flex-row">
                            <div className="flex-1 sm:pr-4">
                              <div className="flex items-start gap-4">
                                <img
                                  src={post.userIcon || userIcon}
                                  alt="User"
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {post.user || "Unknown"}
                                  </p>
                                  <h3 className="text-base sm:text-lg font-bold mt-1">
                                    {post.title || "No Title"}
                                  </h3>
                                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-2 flex-wrap gap-2">
                                    <span>{formatDate(post.createdAt)}</span>
                                    <div className="flex items-center gap-2 ml-0 sm:ml-4">
                                      <img src={like} alt="Likes" className="w-4 h-4 sm:w-5 sm:h-5" />
                                      <span>{post.likesCount || 0}</span>
                                      <img src={comment} alt="Comments" className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                                      <span>{post.commentsCount || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 sm:mt-0 sm:ml-2">
                              <img
                                src={post.bannerUrl || "https://via.placeholder.com/150"}
                                alt={post.title || "Post"}
                                className="w-full sm:w-32 h-24 object-cover rounded"
                              />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">You haven’t saved any posts yet.</p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">About</h2>
                  <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                    <p><span className="font-medium">Name:</span> {userDetails.name || "N/A"}</p>
                    <p><span className="font-medium">Address:</span> {userDetails.address || "N/A"}</p>
                    <p><span className="font-medium">Phone:</span> {userDetails.phone || "N/A"}</p>
                    <p><span className="font-medium">Social Link:</span> <a href={userDetails.socialLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{userDetails.socialLink || "N/A"}</a></p>
                    <p><span className="font-medium">Location:</span> {userDetails.location || "N/A"}</p>
                    <p><span className="font-medium">Date of Birth:</span> {userDetails.dob || "N/A"}</p>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <p className="text-center">Loading profile...</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
