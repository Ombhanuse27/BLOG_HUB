import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- API & ASSETS ---
// Added 'getAllUsers' to the import
import { getUserById, getAllPosts, toggleSavePost, getAllUsers } from "../api/api"; 
import userIcon from "../img/user.png"; 
import logo from "../img/letsblog.png"; 

// --- ICONS ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark as solidBookmark,
  faRightFromBracket,
  faUser,
  faSearch,
  faHeart,
  faComment,
  faTimes,
  faFilePen,
  faCompass,
  faLayerGroup,
  faPlus,
  faCheck,
  faUsers,
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
  
  // New state for Top Creators
  const [topCreators, setTopCreators] = useState([]);

  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // --- DATA FETCHING ---

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId || !token) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Current User Data
        const userResponse = await getUserById(userId, token);
        const userData = userResponse.data;
        setUser(userData);
        setSavedPosts(userData.savedPosts || []);
        setFollowedTopics(userData.followedTopics || []);

        // 2. Fetch ALL Users for "Who to Follow"
        // We fetch all, then sort by followers count descending
        const allUsersResponse = await getAllUsers(token);
        const allUsers = allUsersResponse.data;

        const sortedUsers = allUsers
          .filter(u => u._id !== userId) // Exclude myself
          .sort((a, b) => {
             const followersA = a.followers ? a.followers.length : 0;
             const followersB = b.followers ? b.followers.length : 0;
             return followersB - followersA; // Descending order
          })
          .slice(0, 5); // Take top 5

        setTopCreators(sortedUsers);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchInitialData();
  }, []); // Run once on mount

  useEffect(() => {
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

                const plainText = extractTextFromHTML(post.content);
                const excerpt = plainText.substring(0, 180) + (plainText.length > 180 ? "..." : "");

                return {
                    id: post._id,
                    userIconUrl,
                    likesCount: post.likes?.length || 0,
                    commentsCount: post.comments?.length || 0,
                    excerpt: excerpt,
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

  // --- HANDLERS ---

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
    }
  };

  // Optimistic UI update for Follow/Unfollow
  const handleToggleFollow = (creatorId) => {
    if (!user) return; 

    setTopCreators(prevCreators => 
      prevCreators.map(creator => {
        if (creator._id === creatorId) {
          const isFollowing = creator.followers.some(f => f.uid === user._id);
          let updatedFollowers;
          
          if (isFollowing) {
            // Unfollow logic (remove myself)
            updatedFollowers = creator.followers.filter(f => f.uid !== user._id);
          } else {
            // Follow logic (add myself)
            updatedFollowers = [...creator.followers, { uid: user._id, name: user.name }];
          }
          return { ...creator, followers: updatedFollowers };
        }
        return creator;
      })
    );
    
    // TODO: Call your actual backend API here, e.g.:
    // await followUser(creatorId, token);
  };

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
    localStorage.removeItem("userId");
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

  // --- RENDER ---

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-700">
      
      {/* ======================= Header ======================= */}
      <header className="sticky top-0 z-50 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Logo & Search */}
          <div className="flex items-center gap-8 flex-1">
            <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <img src={logo} alt="LetsBlog" className="h-9 w-auto object-contain" />
            </Link>
            
            <div className="relative hidden md:block max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-slate-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for ideas..."
                className="w-full pl-11 pr-10 py-2.5 bg-slate-100 border-none rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:bg-white transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            <Link 
              to="/addpost" 
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-full hover:bg-sky-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
            >
              <FontAwesomeIcon icon={faFilePen} />
              <span>Write</span>
            </Link>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setOpen(!open)} 
                className="w-11 h-11 rounded-full p-1 border-2 border-transparent hover:border-sky-200 transition-all focus:outline-none"
              >
                <img 
                  src={user?.photo || userIcon} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover shadow-sm"
                />
              </button>
              
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="font-bold text-slate-800 truncate">{user?.name || "Guest"}</p>
                      <p className="text-sm text-slate-500 truncate">{user?.email || "Sign in to continue"}</p>
                    </div>
                    <div className="py-2">
                       <DropdownLink icon={faUser} text="My Profile" to={"/profile"} />
                       <DropdownLink icon={solidBookmark} text="Saved Posts" to={"/saved"} />
                       <div className="h-px bg-slate-100 my-2 mx-3"></div>
                       <DropdownButton icon={faRightFromBracket} text="Sign out" onClick={handleLogout} isDestructive />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ======================= Main Content ======================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Categories / Tabs */}
        <div className="sticky top-24 z-30 bg-[#FAFAFA]/95 backdrop-blur-sm pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <nav className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {[ "For You", ...followedTopics].map((topic) => (
                <CategoryTab
                key={topic}
                topic={topic}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                />
            ))}
            </nav>
            <div className="h-px w-full bg-slate-200 mt-3"></div>
        </div>

        {/* Content Grid */}
        <div className="mt-8 flex flex-col lg:flex-row gap-12">
            
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-10">
                {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
              </div>
            ) : filteredPosts.length > 0 ? (
              <motion.div layout className="space-y-10">
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
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-3xl" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800 mb-2">No posts here yet</h3>
                 <p className="text-slate-500 max-w-sm">
                   {searchQuery 
                      ? `No results for "${searchQuery}". Check your spelling or try a new search.`
                      : "Follow more topics or write your own story to fill this space!"
                   }
                 </p>
                 {selectedCategory === "For You" && (
                     <button className="mt-6 text-sky-600 font-semibold hover:underline" >
                         Explore Topics
                     </button>
                 )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-8">
              
              {/* Reading List Widget */}
              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4">Reading List</h4>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                      Click the <FontAwesomeIcon icon={regularBookmark} /> icon on any story to easily add it to your reading list.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">Programming</span>
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">Data Science</span>
                  </div>
              </div>

              {/* NEW: Top Creators Widget (Real Data) */}
              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-bold text-slate-800">Top Creators</h4>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Trending</span>
                  </div>
                  
                  {topCreators.length > 0 ? (
                    <div className="space-y-5">
                        {topCreators.map((creator) => {
                            // Check if current user is in the creator's follower list
                            const isFollowing = user ? (creator.followers || []).some(f => f.uid === user._id) : false;

                            return (
                              <div key={creator._id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                          <img src={creator.photo || userIcon} alt={creator.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex flex-col">
                                          <Link to={`/user/${creator._id}`} className="text-sm font-semibold text-slate-800 hover:underline line-clamp-1">
                                              {creator.name}
                                          </Link>
                                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                              <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                                              <span>{creator.followers ? creator.followers.length : 0} Followers</span>
                                          </div>
                                      </div>
                                  </div>
                                  <button
                                    onClick={() => handleToggleFollow(creator._id)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0
                                        ${isFollowing 
                                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm" 
                                            : "border border-slate-300 text-slate-400 hover:border-slate-800 hover:text-slate-800"
                                        }`}
                                    title={isFollowing ? "Unfollow" : "Follow"}
                                  >
                                      <FontAwesomeIcon icon={isFollowing ? faCheck : faPlus} className="text-xs" />
                                  </button>
                              </div>
                            );
                        })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No popular creators found yet.</p>
                  )}
                  
                  <button className="w-full mt-6 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline text-left">
                      See more suggestions
                  </button>
              </div>

          </aside>

        </div>
      </main>
    </div>
  );
}


// =================================================================================
// SUB-COMPONENTS
// =================================================================================

const DropdownLink = ({ icon, text, to }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
    <FontAwesomeIcon icon={icon} className="w-4 h-4 opacity-70" />
    <span>{text}</span>
  </Link>
);

const DropdownButton = ({ icon, text, onClick, isDestructive }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left
    ${isDestructive ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
  >
    <FontAwesomeIcon icon={icon} className="w-4 h-4 opacity-70" />
    <span>{text}</span>
  </button>
);

const CategoryTab = ({ topic, selectedCategory, setSelectedCategory }) => (
  <button
    onClick={() => setSelectedCategory(topic)}
    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap
      ${selectedCategory === topic 
        ? "text-sky-700 bg-sky-50" 
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
  >
    {topic}
  </button>
);


// --- POST CARD ---
const PostCard = ({ post, savedPosts, handleSavePost, formatDate }) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row md:min-h-[16rem]"
  >
    {/* Content Section */}
    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between order-2 md:order-1">
      <div>
        {/* Author Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <img
            src={post.userIconUrl || userIcon}
            alt="Author"
            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
          />
          <Link to={`/user/${post.userId}`} className="text-sm font-semibold text-slate-800 hover:underline cursor-pointer">
            {post.user || "Unknown"}
          </Link>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500">{formatDate(post.createdAt)}</span>
        </div>

        {/* Title & Excerpt */}
        <Link to={`/post/${post.id}`} className="block">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-sky-700 transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-2">
            {post.excerpt}
          </p>
        </Link>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-6">
           <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                {post.category?.categoryTitle || "General"}
           </span>
           <div className="flex items-center gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1.5 hover:text-pink-500 transition-colors cursor-default">
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{post.likesCount}</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-default">
                    <FontAwesomeIcon icon={faComment} />
                    <span>{post.commentsCount}</span>
                </span>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-medium">5 min read</span>
            <button
            onClick={(e) => { e.preventDefault(); handleSavePost(post.id); }}
            className="p-2 -mr-2 text-slate-400 hover:text-sky-600 transition-colors focus:outline-none"
            >
            <FontAwesomeIcon
                icon={savedPosts.includes(post.id) ? solidBookmark : regularBookmark}
                className={`text-lg transition-transform active:scale-90 ${savedPosts.includes(post.id) ? 'text-sky-600' : ''}`}
            />
            </button>
        </div>
      </div>
    </div>

    {/* Poster/Image Section */}
    {post.bannerUrl && (
      <Link 
        to={`/post/${post.id}`} 
        className="w-full md:w-2/5 order-1 md:order-2 overflow-hidden relative h-48 md:h-auto"
      >
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        <img
          src={post.bannerUrl}
          alt={post.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </Link>
    )}
  </motion.article>
);


const PostCardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 h-64 flex flex-col md:flex-row gap-6 animate-pulse">
        <div className="flex-1 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                <div className="h-6 bg-slate-200 rounded w-8"></div>
            </div>
        </div>
        <div className="hidden md:block w-2/5 bg-slate-200 rounded-xl h-full"></div>
    </div>
);

export default HomePage;