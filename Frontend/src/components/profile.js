import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getUserById,
  uploadImageToCloudinary,
  getSavedPosts,
  updateUserById,
} from "../api/api";

// Assuming you have these icons or similar ones
import userIcon from "../img/user.png";
import likeIcon from "../img/like.png";
import commentIcon from "../img/comment.png";

// You'll need to install a library like @tabler/icons-react
// npm install @tabler/icons-react
import { IconUser, IconMapPin, IconPhone, IconLink, IconCalendar, IconHome, IconBookmarkOff } from "@tabler/icons-react";

// --- Skeleton Loaders for a Better Loading Experience ---

const ProfileSkeleton = () => (
  <div className="animate-pulse">
    {/* Header Skeleton */}
    <div className="flex flex-col items-center p-6 bg-gray-50 border-b">
      <div className="w-32 h-32 rounded-full bg-gray-300"></div>
      <div className="h-8 w-48 bg-gray-300 rounded mt-4"></div>
      <div className="h-4 w-64 bg-gray-300 rounded mt-2"></div>
      <div className="flex gap-4 mt-4">
        <div className="h-10 w-28 bg-gray-300 rounded-full"></div>
        <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
      </div>
    </div>
    {/* Tabs Skeleton */}
     <div className="flex justify-center gap-4 p-4 bg-gray-50">
        <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
     </div>
    {/* Content Skeleton */}
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 md:p-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md p-4">
          <div className="h-24 bg-gray-300 rounded-lg"></div>
          <div className="flex items-center mt-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);


// --- Reusable UI Components ---

const ErrorDisplay = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-500 p-10">
      <p className="text-xl font-semibold">Oops! Something went wrong.</p>
      <p className="mt-2">{message || "Could not load data. Please try refreshing the page."}</p>
    </div>
);

// --- Sub-components for Profile Page ---

const ProfileHeader = ({ user, onEdit, onLogout }) => (
  <div className="flex flex-col items-center text-center p-6 bg-gray-50 border-b border-gray-200">
    <img
      src={user.photo || userIcon}
      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
      alt="Profile"
    />
    <h3 className="mt-4 text-3xl font-bold text-gray-800">
      {user.name ? `Welcome, ${user.name}` : "Welcome 👋"}
    </h3>
    <p className="text-gray-500 mt-1">{user.email}</p>
    <div className="flex gap-4 mt-4">
      <button
        className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
        onClick={onEdit}
      >
        Edit Profile
      </button>
      <button
        onClick={onLogout}
        className="px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-transform transform hover:scale-105"
      >
        Logout
      </button>
    </div>
  </div>
);

const ProfileTabs = ({ selected, onSelect }) => (
  <div className="flex justify-center gap-4 p-4 bg-gray-50">
    {["Saved Posts", "About"].map((section) => (
      <button
        key={section}
        onClick={() => onSelect(section)}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === section
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        {section}
      </button>
    ))}
  </div>
);

const SavedPostsSection = ({ posts }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "No Date";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 text-gray-500">
        <IconBookmarkOff size={48} className="mb-4" />
        <p className="text-lg font-semibold">You haven’t saved any posts yet.</p>
        <p className="text-gray-400 mt-2">Start exploring and save posts you find interesting!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 md:p-6">
      {posts.map((post) => (
        <Link to={`/post/${post._id}`} key={post._id} className="block group">
          <div className="bg-white rounded-xl shadow-md overflow-hidden h-full transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
            {post.bannerUrl && (
              <img
                src={post.bannerUrl}
                alt={post.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4 flex flex-col">
              <div className="flex items-center mb-3">
                <img
                  src={post.userIcon || userIcon}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{post.user || "Unknown"}</p>
                  <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 flex-grow">
                {post.title || "No Title"}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mt-4 gap-4 border-t pt-3">
                <div className="flex items-center gap-1.5">
                  <img src={likeIcon} alt="Likes" className="w-5 h-5" />
                  <span>{post.likesCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <img src={commentIcon} alt="Comments" className="w-5 h-5" />
                  <span>{post.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const AboutSection = ({ user }) => {
    const details = [
        { label: "Name", value: user.name, icon: <IconUser size={20} /> },
        { label: "Address", value: user.address, icon: <IconHome size={20} /> },
        { label: "Phone", value: user.phone, icon: <IconPhone size={20} /> },
        { label: "Social Link", value: user.socialLink, icon: <IconLink size={20} /> },
        { label: "Location", value: user.location, icon: <IconMapPin size={20} /> },
        { label: "Date of Birth", value: user.dob, icon: <IconCalendar size={20} /> },
    ];

    return (
    <div className="p-4 md:p-6">
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4 text-gray-700">
            {details.map(({label, value, icon}) => (
                <div key={label} className="flex items-center border-b pb-3 last:border-b-0">
                    <div className="text-gray-500 mr-4">{icon}</div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500">{label}</p>
                        {label === "Social Link" && value ? (
                             <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all font-medium">
                                {value}
                            </a>
                        ) : (
                            <p className="text-gray-900 font-medium">{value || "Not provided"}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
    );
};


const EditProfileModal = ({ show, onClose, data, onChange, onFileChange, onSave, isSaving }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Edit Your Profile
        </h2>
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
             <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          {["name", "address", "phone", "socialLink", "location", "dob"].map((field) => (
            <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize">{field.replace('Link', ' Link')}</label>
                <input
                    name={field}
                    type={field === 'dob' ? 'date' : 'text'}
                    placeholder={`Your ${field}`}
                    value={data[field] || ""}
                    onChange={onChange}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center w-32 disabled:bg-blue-400"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PROFILE COMPONENT ---

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Saved Posts");
  const [savedPosts, setSavedPosts] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  const fetchInitialData = useCallback(async (userId, token) => {
    try {
        setError(null);
        // Promise.all to fetch user data and posts concurrently
        const [userRes, postsRes] = await Promise.all([
            getUserById(userId, token),
            getSavedPosts(userId, token)
        ]);

        setUserDetails(userRes.data);
        setEditData(userRes.data);

        // Enrich post data after fetching
        const enrichedPosts = await Promise.all(
            postsRes.map(async (post) => {
                let userIconUrl = userIcon;
                try {
                    const postUserRes = await getUserById(post.userId, token);
                    userIconUrl = postUserRes.data.photo || userIcon;
                } catch (err) {
                    console.warn(`Could not fetch user for post: ${post._id}`);
                }
                return {
                    ...post,
                    userIcon: userIconUrl,
                    likesCount: post.likes?.length || 0,
                    commentsCount: post.comments?.length || 0,
                };
            })
        );
        setSavedPosts(enrichedPosts);

    } catch (err) {
      console.error("Failed to fetch initial profile data", err);
      setError("We couldn't load your profile. Please check your connection and try again.");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      navigate("/SignIn");
      return;
    }
    fetchInitialData(userId, token);
  }, [fetchInitialData, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/SignIn");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setEditData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSaveProfile = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;

    setIsSaving(true);
    try {
      let dataToUpdate = { ...editData };
      if (editData.photo && editData.photo instanceof File) {
        const photoUrl = await uploadImageToCloudinary(editData.photo);
        dataToUpdate.photo = photoUrl;
      }
      
      const updatedUser = await updateUserById(userId, dataToUpdate, token);
      setUserDetails(updatedUser.data);
      setShowEditProfile(false);
    } catch (err) {
      console.error("Profile update failed", err);
      // You could add a toast notification here for the error
    } finally {
      setIsSaving(false);
    }
  };

  // Conditional Rendering Logic
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!userDetails) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <ProfileHeader 
              user={userDetails} 
              onEdit={() => setShowEditProfile(true)}
              onLogout={handleLogout}
          />
          <ProfileTabs 
              selected={selectedSection} 
              onSelect={setSelectedSection}
          />
          
          <div className="overflow-y-auto flex-1 bg-gray-50">
            {selectedSection === "Saved Posts" ? (
              <SavedPostsSection posts={savedPosts} />
            ) : (
              <AboutSection user={userDetails} />
            )}
          </div>
      </div>

      <EditProfileModal
        show={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        data={editData}
        onChange={handleEditInputChange}
        onFileChange={handleFileChange}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </>
  );
}

export default Profile;