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
import {
  faUser,
  faEdit,
  faShareAlt,
  faCopy,
  faMapMarkerAlt, // Added for location
} from "@fortawesome/free-solid-svg-icons";
// Import AnimatePresence for tab transitions
import { motion, AnimatePresence } from "framer-motion";
import ChatRequestButton from "./ChatRequestButton";

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

  const [chatInfo, setChatInfo] = useState({
    status: "loading",
    conversationId: null,
  });
  const isMe = localStorage.getItem("userId") === id;

  // --- All your existing useEffect and handler logic remains unchanged ---
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

  const handleFollowToggle = async () => {
    try {
      await toggleFollowUser(id);
      setIsFollowing((s) => !s);
    } catch (err) {
      console.error("Follow toggle failed:", err);
    }
  };

  const handleCopyLink = () => {
    // Use execCommand for broader compatibility in iFrames
    const el = document.createElement('textarea');
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(el);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600 min-h-screen">
        Loading profile...
      </div>
    );
  if (!profileUser)
    return (
      <div className="p-8 text-center text-gray-600 min-h-screen">
        User not found.
      </div>
    );

  // Animation variants for tab content
  const tabContentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
        <img
          src={profileUser.photo || userIcon}
          alt={profileUser.name || profileUser.firstName}
          className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-sky-500 ring-offset-2 ring-offset-white shadow-lg flex-shrink-0"
        />
        <div className="flex-1 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {profileUser.name ||
                  `${profileUser.firstName || ""} ${profileUser.lastName || ""}`}
              </h2>
              {profileUser.location && (
                <p className="text-sm text-gray-500 mt-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />{" "}
                  {profileUser.location}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-2.5 flex-shrink-0">
              {isMe ? (
                <Link
                  to="/profile/edit"
                  className="px-4 py-2 bg-sky-500 text-white rounded-full flex items-center gap-2 shadow-sm hover:bg-sky-600 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit Profile
                </Link>
              ) : (
                <>
                  {/* DYNAMIC CHAT BUTTON LOGIC */}
                  {chatInfo.status === "loading" && (
                    <button
                      className="px-4 py-2 rounded-full border bg-gray-100 text-gray-400 w-24"
                      disabled
                    >
                      ...
                    </button>
                  )}

                  {chatInfo.status === "accepted" && (
                    <Link
                      to={`/chat/${chatInfo.conversationId}`}
                      className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      Message
                    </Link>
                  )}

                  {chatInfo.status === "pending" && (
                    <button
                      className="px-4 py-2 rounded-full border bg-gray-100 text-gray-500"
                      disabled
                    >
                      Request Sent
                    </button>
                  )}

                  {chatInfo.status === "none" && (
                    <ChatRequestButton
                      targetUserId={profileUser._id}
                      onSent={() =>
                        setChatInfo({ status: "pending", conversationId: null })
                      }
                    />
                  )}
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 rounded-full border transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isFollowing
                        ? "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                        : "bg-sky-500 text-white hover:bg-sky-600 shadow-sm"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </>
              )}

              <button
                onClick={handleCopyLink}
                title="Share Profile"
                className="px-3 py-2 h-10 w-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-300 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                {copied ? (
                  <FontAwesomeIcon icon={faCopy} />
                ) : (
                  <FontAwesomeIcon icon={faShareAlt} />
                )}
                <span className="sr-only">{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>

          <p className="mt-4 text-gray-600 text-sm max-w-xl">
            {profileUser.bio || profileUser.address || "No bio provided."}
          </p>

          {/* NEW Stats Section */}
          <div className="mt-6 flex justify-center md:justify-start gap-8 border-t border-gray-100 pt-4">
            <div className="text-center">
              <span className="text-xl font-bold text-gray-800 block">
                {posts.length}
              </span>
              <span className="text-sm text-gray-500">Posts</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-gray-800 block">
                {profileUser.followers?.length || 0}
              </span>
              <span className="text-sm text-gray-500">Followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex justify-center gap-4 md:gap-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("posts")}
          className={`text-base font-medium pb-3 px-2 transition-all duration-300 ${
            activeTab === "posts"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab("followers")}
          className={`text-base font-medium pb-3 px-2 transition-all duration-300 ${
            activeTab === "followers"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Followers ({profileUser.followers?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`text-base font-medium pb-3 px-2 transition-all duration-300 ${
            activeTab === "about"
              ? "text-sky-600 border-b-2 border-sky-500"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          About
        </button>
      </div>

      {/* Tab Content with Animation */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "posts" && (
            <motion.div
              key="posts"
              className="grid gap-6"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {posts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                  <p className="text-gray-600">No posts yet from this user.</p>
                </div>
              ) : (
                posts.map((p) => <PostCard key={p._id || p.id} post={p} />)
              )}
            </motion.div>
          )}

          {activeTab === "followers" && (
            <motion.div
              key="followers"
              className="bg-white rounded-lg shadow p-4 md:p-6"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {profileUser.followers?.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {profileUser.followers.map((f, idx) => (
                    <li
                      key={f.uid || idx} // Use f.uid for a stable key
                      className="flex items-center justify-between py-4 px-2 transition-colors duration-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-sky-100 text-sky-500 p-2 rounded-full w-10 h-10 flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {f.name || "Unnamed"}
                        </span>
                      </div>
                      <Link
                        to={`/user/${f.uid}`}
                        className="text-sm text-sky-600 hover:underline font-semibold"
                      >
                        View Profile
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center py-10">
                  No followers yet. Be the first to follow!
                </p>
              )}
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              className="bg-white rounded-lg shadow p-6 md:p-8 space-y-5 text-gray-700"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div>
                <strong className="block text-sm font-medium text-gray-500">
                  Email:
                </strong>
                <span className="text-base text-gray-900">
                  {profileUser.email}
                </span>
              </div>
              {profileUser.phone && (
                <div>
                  <strong className="block text-sm font-medium text-gray-500">
                    Phone:
                  </strong>
                  <span className="text-base text-gray-900">
                    {profileUser.phone}
                  </span>
                </div>
              )}
              {profileUser.dob && (
                <div>
                  <strong className="block text-sm font-medium text-gray-500">
                    Date of Birth:
                  </strong>
                  <span className="text-base text-gray-900">
                    {profileUser.dob}
                  </span>
                </div>
              )}
              {profileUser.socialLink && (
                <div>
                  <strong className="block text-sm font-medium text-gray-500">
                    Social:
                  </strong>
                  <a
                    href={profileUser.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-sky-600 hover:underline break-all"
                  >
                    {profileUser.socialLink}
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default UserProfile;