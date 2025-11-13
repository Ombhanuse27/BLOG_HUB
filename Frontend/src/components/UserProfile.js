import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getUserById2,
  getUserPosts,
  toggleFollowUser,
  checkIfFollowingUser,
  getChatStatus,
} from "../api/api";
import userIcon from "../img/user.png";
import PostCard from "./PostCardSmall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEdit, faShareAlt, faCopy } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import ChatRequestButton from './ChatRequestButton';

const UserProfile = ({ user: currentUser }) => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [copied, setCopied] = useState(false);

  const [chatInfo, setChatInfo] = useState({ status: "loading", conversationId: null });
  const isMe = localStorage.getItem("userId") === id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      
      // Reset chat status to loading ONLY if it's not our profile
      if (!isMe) {
        setChatInfo({ status: "loading", conversationId: null });
      }

      try {
        const res = await getUserById2(id, token);
        const userData = res.data ?? res;
        setProfileUser(userData);

        const userPosts = await getUserPosts(id, token);
        setPosts(userPosts || []);

        // Only check follow/chat status if it's NOT your own profile
        if (token && !isMe) { 
          const following = await checkIfFollowingUser(id);
          setIsFollowing(!!following);

          const statusRes = await getChatStatus(id);
          setChatInfo(statusRes);
        } else if (isMe) {
          // If it is me, set page loading to false
          setLoading(false);
        }

      } catch (err) {
        console.error("Error fetching profile:", err);
        // 💡 LOGIC FIX: If any API fails, stop the chat button loading
        if (!isMe) {
          setChatInfo({ status: "none", conversationId: null });
        }
      } finally {
        // Only set page loading false here if it's not our profile
        if (!isMe) {
            setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [id, token, isMe]);

  // ... (rest of the functions: handleFollowToggle, handleCopyLink) ...
  const handleFollowToggle = async () => {
    try {
      await toggleFollowUser(id);
      setIsFollowing((s) => !s);
    } catch (err) {
      console.error("Follow toggle failed:", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return <div className="p-8 text-center text-gray-600">Loading...</div>;
  if (!profileUser)
    return <div className="p-8 text-center text-gray-600">User not found.</div>;


  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-6 items-center">
        <img
          src={profileUser.photo || userIcon}
          alt={profileUser.name || profileUser.firstName}
          className="w-28 h-28 rounded-full object-cover border-4 border-sky-500 shadow"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profileUser.name ||
                  `${profileUser.firstName || ""} ${profileUser.lastName || ""}`}
              </h2>
              {profileUser.location && (
                <p className="text-sm text-gray-500 mt-1">
                  📍 {profileUser.location}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-2">
              {isMe ? (
                <Link
                  to="/profile/edit"
                  className="px-4 py-2 bg-sky-500 text-white rounded-full flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit Profile
                </Link>
              ) : (
                <>
                {/* DYNAMIC CHAT BUTTON LOGIC */}
                {chatInfo.status === 'loading' && (
                  <button className="px-4 py-2 rounded-full border bg-gray-100" disabled>...</button>
                )}

                {chatInfo.status === 'accepted' && (
                  <Link
                    to={`/chat/${chatInfo.conversationId}`}
                    className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                  >
                    Message
                  </Link>
                )}
                
                {chatInfo.status === 'pending' && (
                  <button className="px-4 py-2 rounded-full border bg-gray-100" disabled>
                    Request Sent
                  </button>
                )}

                {chatInfo.status === 'none' && (
                  <ChatRequestButton 
                    targetUserId={profileUser._id} 
                    onSent={() => setChatInfo({ status: 'pending', conversationId: null })}
                  />
                )}
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-2 rounded-full border transition ${
                    isFollowing
                      ? "bg-white text-gray-700 hover:bg-gray-100"
                      : "bg-sky-500 text-white hover:bg-sky-600"
                  }`}
                >

                  {isFollowing ? "Following" : "Follow"}
                </button>

                </>
              )}

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 flex items-center gap-2 hover:bg-gray-300"
              >
                <FontAwesomeIcon icon={faShareAlt} />
                {copied ? "Copied!" : "Share"}
              </button>
            </div>
          </div>

          <p className="mt-3 text-gray-600 text-sm">
            {profileUser.bio || profileUser.address || ""}
          </p>
        </div>
      </div>

      {/* ... (Rest of the component: Tabs, Posts, Followers, About) ... */}
      {/* Tabs */}
      <div className="mt-6 flex justify-center gap-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("posts")}
          className={`text-sm font-semibold ${
            activeTab === "posts"
              ? "text-sky-600 border-b-2 border-sky-500 pb-1"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab("followers")}
          className={`text-sm font-semibold ${
            activeTab === "followers"
              ? "text-sky-600 border-b-2 border-sky-500 pb-1"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Followers ({profileUser.followers?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`text-sm font-semibold ${
            activeTab === "about"
              ? "text-sky-600 border-b-2 border-sky-500 pb-1"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          About
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "posts" && (
          <motion.div
            className="grid gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded shadow">
                <p className="text-gray-600">No posts yet from this user.</p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p._id || p.id} post={p} />)
            )}
          </motion.div>
        )}

        {activeTab === "followers" && (
          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {profileUser.followers?.length > 0 ? (
              <ul className="divide-y">
                {profileUser.followers.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-sky-500 w-4"
                      />
                      <span>{f.name || "Unnamed"}</span>
                    </div>
                    <Link
                      to={`/user/${f.uid}`}
                      className="text-sm text-sky-600 hover:underline"
                    >
                      View Profile
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-center">
                No followers yet. Be the first to follow!
              </p>
            )}
          </motion.div>
        )}

        {activeTab === "about" && (
          <motion.div
            className="bg-white rounded-lg shadow p-6 space-y-3 text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>
              <strong>Email:</strong> {profileUser.email}
            </p>
            {profileUser.phone && (
              <p>
                <strong>Phone:</strong> {profileUser.phone}
              </p>
            )}
            {profileUser.dob && (
              <p>
                <strong>Date of Birth:</strong> {profileUser.dob}
              </p>
            )}
            {profileUser.socialLink && (
              <p>
                <strong>Social:</strong>{" "}
                <a
                  href={profileUser.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline"
                >
                  {profileUser.socialLink}
                </a>
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UserProfile;