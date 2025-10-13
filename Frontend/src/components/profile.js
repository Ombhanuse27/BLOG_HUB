import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getUserById,
  uploadImageToCloudinary,
  getSavedPosts,
  updateUserById,
  getUserPosts,
} from "../api/api";

// Assuming you have a default user icon
import userIcon from "../img/user.png";

// Consistent and modern icons from Tabler
import { 
    IconUser, IconMapPin, IconPhone, IconLink, IconCalendar, 
    IconHome, IconBookmarkOff, IconFeather, IconHeart, IconMessageCircle 
} from "@tabler/icons-react";

// --- Skeleton Loader (No changes needed, already looks good) ---

const ProfileSkeleton = () => (
  <div className="animate-pulse">
    {/* Header Skeleton */}
    <div className="flex flex-col items-center p-8 bg-gray-50 border-b">
      <div className="w-36 h-36 rounded-full bg-gray-300"></div>
      <div className="h-8 w-56 bg-gray-300 rounded mt-4"></div>
      <div className="h-4 w-64 bg-gray-300 rounded mt-2"></div>
      <div className="flex gap-4 mt-6">
        <div className="h-10 w-32 bg-gray-300 rounded-full"></div>
        <div className="h-10 w-28 bg-gray-300 rounded-full"></div>
      </div>
    </div>
    {/* Tabs Skeleton */}
     <div className="flex justify-center gap-8 p-4 border-b">
        <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
        <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
        <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
     </div>
    {/* Content Skeleton */}
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md p-4 space-y-3">
          <div className="h-40 bg-gray-300 rounded-lg"></div>
          <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
           <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);


// --- Reusable UI Components ---

const ErrorDisplay = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-500 p-10 bg-red-50 rounded-lg">
      <p className="text-xl font-semibold">Oops! Something Went Wrong</p>
      <p className="mt-2">{message || "Could not load data. Please try refreshing the page."}</p>
    </div>
);

// --- Sub-components for Profile Page ---

const ProfileHeader = ({ user, onEdit, onLogout }) => (
  // ✨ Refined Header with a subtle gradient and larger photo
  <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
    <img
      src={user.photo || userIcon}
      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl mb-4"
      alt="Profile"
    />
    <h3 className="text-4xl font-bold text-gray-800">{user.name || "Anonymous User"}</h3>
    <p className="text-gray-500 mt-1">{user.email}</p>
    <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
        <IconCalendar size={16} />
        <span>Joined on {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
    </div>
    <div className="flex gap-4 mt-6">
      <button
        className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        onClick={onEdit}
      >
        Edit Profile
      </button>
      <button
        onClick={onLogout}
        className="px-6 py-2 text-sm font-semibold bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
      >
        Logout
      </button>
    </div>
  </div>
);

const ProfileTabs = ({ selected, onSelect }) => (
  // ✨ More interactive tab design
  <div className="flex justify-center border-b bg-white shadow-sm sticky top-0 z-10">
      <div className="flex gap-8">
        {["My Posts", "Saved Posts", "About"].map((section) => (
          <button
            key={section}
            onClick={() => onSelect(section)}
            className={`py-4 px-3 text-sm font-semibold transition-colors duration-300 ease-in-out relative ${
              selected === section
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {section}
            {selected === section && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full animate-fadeIn"></span>
            )}
          </button>
        ))}
    </div>
  </div>
);

// Reusable component for displaying posts
const PostGrid = ({ posts, emptyState }) => {
    const formatDate = (timestamp) => {
        if (!timestamp) return "No Date";
        return new Date(timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    if (!posts || posts.length === 0) {
        return emptyState;
    }

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 md:p-6">
            {posts.map((post) => (
                <Link to={`/post/${post._id}`} key={post._id} className="block group">
                    {/* ✨ Enhanced hover effects on post cards */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full transform transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:-translate-y-2">
                        <div className="overflow-hidden">
                           <img
                                src={post.bannerUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                                alt={post.title}
                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate transition-colors duration-300 group-hover:text-blue-600">
                                {post.title || "No Title"}
                            </h3>
                            <div className="flex items-center mb-4">
                                <img
                                    src={post.userIcon || userIcon}
                                    alt="User"
                                    className="w-8 h-8 rounded-full object-cover mr-3"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{post.user || "Unknown"}</p>
                                    <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex-grow"></div>
                            <div className="flex items-center text-sm text-gray-600 mt-4 gap-5 border-t pt-3">
                                <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-red-500">
                                    <IconHeart size={18} />
                                    <span>{post.likesCount || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-blue-500">
                                    <IconMessageCircle size={18} />
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

const MyPostsSection = ({ posts }) => (
    <PostGrid
        posts={posts}
        emptyState={
            <div className="flex flex-col items-center justify-center text-center p-12 text-gray-500 min-h-[40vh]">
                <IconFeather size={48} className="mb-4 text-gray-400" />
                <p className="text-lg font-semibold">You haven't written any posts yet.</p>
                <p className="text-gray-400 mt-2">Why not share your thoughts with the world?</p>
                <Link to="/AddPost" className="mt-6 px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all transform hover:scale-105">
                    Create New Post
                </Link>
            </div>
        }
    />
);

const SavedPostsSection = ({ posts }) => (
     <PostGrid
        posts={posts}
        emptyState={
            <div className="flex flex-col items-center justify-center text-center p-12 text-gray-500 min-h-[40vh]">
                <IconBookmarkOff size={48} className="mb-4 text-gray-400" />
                <p className="text-lg font-semibold">You haven’t saved any posts yet.</p>
                <p className="text-gray-400 mt-2">Start exploring and save posts you find interesting!</p>
            </div>
        }
    />
);

const AboutSection = ({ user }) => {
    // ✨ Polished "About Me" section with better spacing and icons
    const details = [
        { label: "Name", value: user.name, icon: <IconUser size={20} /> },
        { label: "Address", value: user.address, icon: <IconHome size={20} /> },
        { label: "Phone", value: user.phone, icon: <IconPhone size={20} /> },
        { label: "Social Link", value: user.socialLink, icon: <IconLink size={20} /> },
        { label: "Location", value: user.location, icon: <IconMapPin size={20} /> },
        { label: "Date of Birth", value: user.dob, icon: <IconCalendar size={20} /> },
    ];

    return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-5 text-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-5">About Me</h3>
            {details.map(({label, value, icon}) => (
                <div key={label} className="flex items-start border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="text-blue-500 mr-5 mt-1">{icon}</div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                        {label === "Social Link" && value ? (
                             <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all font-semibold">
                                {value}
                            </a>
                        ) : (
                            <p className="text-gray-900 font-semibold text-base">{value || <span className="text-gray-400 italic font-normal">Not provided</span>}</p>
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
    // ✨ Modern modal with backdrop blur
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-scaleUp">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Edit Your Profile
        </h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
            </div>
          {["name", "address", "phone", "socialLink", "location", "dob"].map((field) => (
            <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{field.replace('Link', ' Link')}</label>
                <input
                    name={field}
                    type={field === 'dob' ? 'date' : 'text'}
                    placeholder={`Your ${field}`}
                    value={data[field] || ""}
                    onChange={onChange}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center w-36 disabled:bg-blue-400 transition-colors"
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
  const [selectedSection, setSelectedSection] = useState("My Posts");
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  const enrichPostData = useCallback(async (posts, token) => {
    if (!posts) return [];
    return Promise.all(
        posts.map(async (post) => {
            let userIconUrl = userIcon;
            let userName = "Unknown";
            try {
                const postUserRes = await getUserById(post.userId, token);
                userIconUrl = postUserRes.data.photo || userIcon;
                userName = postUserRes.data.name || "Unknown";
            } catch (err) {
                console.warn(`Could not fetch user for post: ${post._id}`);
            }
            return {
                ...post,
                user: userName,
                userIcon: userIconUrl,
                likesCount: post.likes?.length || 0,
                commentsCount: post.comments?.length || 0,
            };
        })
    );
  }, []);


  const fetchInitialData = useCallback(async (userId, token) => {
    try {
        setError(null);
        const [userRes, savedPostsRes, myPostsRes] = await Promise.all([
            getUserById(userId, token),
            getSavedPosts(userId, token),
            getUserPosts(userId, token)
        ]);

        setUserDetails(userRes.data);
        setEditData(userRes.data);

        const enrichedSavedPosts = await enrichPostData(savedPostsRes, token);
        const enrichedMyPosts = await enrichPostData(myPostsRes, token);
        
        setSavedPosts(enrichedSavedPosts);
        setMyPosts(enrichedMyPosts);

    } catch (err) {
      console.error("Failed to fetch profile data", err);
      setError("We couldn't load your profile. Please check your connection and try again.");
    }
  }, [enrichPostData]);

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
    localStorage.clear();
    navigate("/SignIn");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditData((prev) => ({ ...prev, photo: e.target.files[0] }));
    }
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

      // ✅ FIX: The API response IS the user object. No need for .data here.
      setUserDetails(updatedUser); 
      
      // ✨ IMPROVEMENT: Also update the edit form's data to prevent stale info.
      setEditData(updatedUser);

      setShowEditProfile(false);
    } catch (err) {
      console.error("Profile update failed", err);
      // You could add a toast notification here for the error
    } finally {
      setIsSaving(false);
    }
  };

  if (error) return <ErrorDisplay message={error} />;
  if (!userDetails) return <ProfileSkeleton />;

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
          <ProfileHeader 
              user={userDetails} 
              onEdit={() => setShowEditProfile(true)}
              onLogout={handleLogout}
          />
          <ProfileTabs 
              selected={selectedSection} 
              onSelect={setSelectedSection}
          />
          
          <div className="overflow-y-auto flex-1">
            {selectedSection === "My Posts" && <MyPostsSection posts={myPosts} />}
            {selectedSection === "Saved Posts" && <SavedPostsSection posts={savedPosts} />}
            {selectedSection === "About" && <AboutSection user={userDetails} />}
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