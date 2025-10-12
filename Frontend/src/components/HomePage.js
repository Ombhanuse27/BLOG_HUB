import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- API & ASSETS ---
import { getUserById, getAllPosts, toggleSavePost } from "../api/api"; // Your MERN API calls
import userIcon from "../img/user.png"; // Default user icon
import logo from "../img/letsblog.png"; // Your logo

// --- ICONS (using FontAwesome for consistency) ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark as solidBookmark,
  faPenToSquare,
  faRightFromBracket,
  faUser,
  faSearch,
  faHeart,
  faComment,
  faTimes,
  faFilePen,
  faCompass,
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";


// =================================================================================
// MAIN HOME PAGE COMPONENT
// =================================================================================
function HomePage() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followedTopics, setFollowedTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("For You");
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // --- DATA FETCHING & SIDE EFFECTS ---

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId || !token) {
        setLoading(false);
        // Handle not logged in case, maybe redirect
        return;
      }

      try {
        // Fetch user data, followed topics, and saved posts in parallel
        const userResponse = await getUserById(userId, token);
        const userData = userResponse.data;
        setUser(userData);
        setSavedPosts(userData.savedPosts || []);
        setFollowedTopics(userData.followedTopics || []);
      } catch (error) {
        console.error("Error fetching initial user data:", error);
      }
      // Loading is set to false in the posts fetch effect
    };
    fetchInitialData();
  }, []);

 // In your HomePage.js file

  useEffect(() => {
    // Helper function to strip HTML tags
    const extractTextFromHTML = (htmlString) => {
      const doc = new DOMParser().parseFromString(htmlString, 'text/html');
      return doc.body.textContent || "";
    };

    const fetchPosts = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const response = await getAllPosts(token);
        const allPosts = response.data;
        
        const enrichedPosts = await Promise.all(
            allPosts.map(async (post) => {
                let userIconUrl = userIcon;
                try {
                    const userRes = await getUserById(post.userId, token);
                    userIconUrl = userRes.data.photo || userIcon;
                } catch (err) {
                    console.warn(`Failed to get user icon for userId ${post.userId}`);
                }

                // --- CHANGE IS HERE ---
                // 1. Convert the HTML content to plain text first
                const plainText = extractTextFromHTML(post.content);

                // 2. Create the excerpt from the clean plain text
                const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? "..." : "");

                return {
                    id: post._id,
                    userIconUrl,
                    likesCount: post.likes?.length || 0,
                    commentsCount: post.comments?.length || 0,
                    excerpt: excerpt, // Use the new, clean excerpt
                    ...post,
                };
            })
        );
        
        let categoryPosts;
        if (selectedCategory === "For You") {
          categoryPosts = enrichedPosts.filter(post => 
            followedTopics.includes(post.category?.categoryTitle)
          );
        } else {
          categoryPosts = enrichedPosts.filter(
            (post) => post.category?.categoryTitle === selectedCategory
          );
        }

        categoryPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(categoryPosts);
        setFilteredPosts(categoryPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (followedTopics.length > 0 || selectedCategory !== "For You") {
        fetchPosts();
    } else if (selectedCategory === "For You" && followedTopics.length === 0) {
        setPosts([]);
        setFilteredPosts([]);
        setLoading(false);
    }
  }, [selectedCategory, followedTopics]);

  // --- UI & EVENT HANDLERS ---

  const handleSavePost = async (postId) => {
    const originalSavedPosts = [...savedPosts];
    setSavedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );

    try {
      await toggleSavePost(postId);
    } catch (err) {
      console.error("Failed to save the post. Reverting the change.", err);
      setSavedPosts(originalSavedPosts);
      // Consider showing a toast notification for the error
    }
  };
  
  // Real-time search filtering
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);


  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId"); // Ensure userId is also removed
    window.location.href = "/SignIn";
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- JSX & RENDER ---

  return (
    <div className="w-full min-h-screen bg-zinc-50 font-sans">
      {/* ======================= Header / Top Navbar ======================= */}
      <header className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Left side: Logo & Search */}
          <div className="flex items-center gap-6">
            <Link to="/">
              <img src={logo} alt="Logo" className="w-28 h-8 object-contain" />
            </Link>
            <div className="relative hidden md:block">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search posts or authors..."
                className="w-full md:w-64 lg:w-80 h-10 pl-10 pr-4 bg-zinc-100 border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
               {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
                     <FontAwesomeIcon icon={faTimes} />
                  </button>
               )}
            </div>
          </div>

          {/* Right side: Actions & User Menu */}
          <div className="flex items-center gap-4">
            <Link to="/addpost" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600 transition-colors shadow-sm">
              <FontAwesomeIcon icon={faFilePen} />
              <span>Write</span>
            </Link>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setOpen(!open)} className="w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                <img src={user?.photo || userIcon} alt="User" className="w-full h-full object-cover"/>
              </button>
              
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-3 border-b">
                      <p className="font-semibold text-sm truncate">{user?.name || "User Name"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || "user@example.com"}</p>
                    </div>
                    <ul>
                       <DropdownLink icon={faUser} text="Profile" to={"/profile"} />
                     
                       <DropdownButton icon={faRightFromBracket} text="Logout" onClick={handleLogout} />
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ======================= Main Content Area ======================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Navbar */}
        <nav className="relative mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {[ "For You", ...followedTopics].map((topic) => (
            <CategoryTab
              key={topic}
              topic={topic}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          ))}
        </nav>

        {/* Posts Grid */}
        <div>
          {loading ? (
            // --- Loading State: Skeleton Cards ---
            <div className="grid grid-cols-1 gap-8">
              {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : filteredPosts.length > 0 ? (
            // --- Posts Available State ---
            <motion.div
              layout
              className="grid grid-cols-1 gap-8"
            >
              <AnimatePresence>
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    savedPosts={savedPosts}
                    handleSavePost={handleSavePost}
                    formatDate={formatDate}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // --- Empty State ---
            <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border">
               <FontAwesomeIcon icon={faCompass} className="text-5xl text-gray-300 mb-4" />
               <h3 className="text-xl font-semibold text-gray-800">No Posts Found</h3>
               <p className="text-gray-500 mt-2 max-w-md mx-auto">
                 {searchQuery 
                    ? `We couldn't find any posts for "${searchQuery}". Try another search.`
                    : selectedCategory === "For You"
                    ? "Posts from topics you follow will appear here. Explore and follow some topics!"
                    : `There are no posts in the "${selectedCategory}" category yet.`
                 }
               </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


// =================================================================================
// SUB-COMPONENTS
// =================================================================================

// --- Dropdown Menu Components ---
const DropdownLink = ({ icon, text, to }) => (
  <Link to={to} className="dropdownItem">
    <FontAwesomeIcon icon={icon} className="w-4 h-4 text-gray-500" />
    <span>{text}</span>
  </Link>
);

const DropdownButton = ({ icon, text, onClick }) => (
  <button onClick={onClick} className="dropdownItem w-full">
    <FontAwesomeIcon icon={icon} className="w-4 h-4 text-gray-500" />
    <span>{text}</span>
  </button>
);

// --- Category Tab Component with Animation ---
const CategoryTab = ({ topic, selectedCategory, setSelectedCategory }) => (
  <button
    onClick={() => setSelectedCategory(topic)}
    className={`relative py-2 px-4 text-sm font-medium rounded-full transition-colors whitespace-nowrap
      ${selectedCategory === topic ? "text-sky-600" : "text-gray-600 hover:text-black hover:bg-gray-100"}`}
  >
    {topic}
    {selectedCategory === topic && (
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
        layoutId="underline"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
  </button>
);


// --- Post Card Component ---
const PostCard = ({ post, savedPosts, handleSavePost, formatDate }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-md border border-gray-200/80 overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <div className="flex flex-col sm:flex-row">
      {/* Content Section */}
      <div className="flex-grow p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={post.userIconUrl || userIcon}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-sm text-gray-800">{post.user || "Unknown User"}</p>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        <Link to={`/post/${post.id}`} className="block group">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors mb-2 leading-tight">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        </Link>
        
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{post.likesCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faComment} />
                    <span>{post.commentsCount}</span>
                </span>
                <span className="text-xs font-medium bg-sky-100 text-sky-700 py-1 px-2.5 rounded-full">
                    {post.category?.categoryTitle || "General"}
                </span>
            </div>
            
            <button
                className="text-gray-400 hover:text-sky-500 transition-colors"
                onClick={(e) => { e.preventDefault(); handleSavePost(post.id); }}
                title={savedPosts.includes(post.id) ? "Unsave" : "Save"}
            >
                <FontAwesomeIcon
                  icon={savedPosts.includes(post.id) ? solidBookmark : regularBookmark}
                  className={`text-xl ${savedPosts.includes(post.id) ? 'text-sky-500' : ''}`}
                />
            </button>
        </div>

      </div>

      {/* Image Section */}
      {post.bannerUrl && (
        <Link to={`/post/${post.id}`} className="sm:w-1/3 block">
          <img
            src={post.bannerUrl}
            alt={post.title}
            className="w-full h-48 sm:h-full object-cover"
          />
        </Link>
      )}
    </div>
  </motion.div>
);

// --- Post Card Skeleton Loader ---
const PostCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200/80 overflow-hidden">
        <div className="flex flex-col sm:flex-row animate-pulse">
            <div className="flex-grow p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-2/4 mb-1.5"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="sm:w-1/3 bg-gray-200 h-48 sm:h-auto"></div>
        </div>
    </div>
);


// Make sure to add this CSS to your main stylesheet (e.g., index.css)
// for the dropdown items and scrollbar styles.
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .dropdownItem {
    @apply flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer;
  }
}
*/

export default HomePage;