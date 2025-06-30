import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import userIcon from "../img/user.png";
import edit from "../img/edit.png";
import logo from "../img/letsblog.png";
import search from "../img/search.png";
import logout from "../img/log-out.png";
import like from "../img/like.png";
import comment from "../img/comment.png";
import write from "../img/write.png";
import { getUserById, getAllPosts } from "../api/api"; // <-- MERN API calls
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { toggleSavePost } from "../api/api"; // Import the toggleSavePost function



function HomePage() {
  const [open, setOpen] = useState(false);
  const [followedTopics, setFollowedTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("For You");
  const [posts, setPosts] = useState([]);
  const [selectedContent, setSelectedContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  let menuRef = useRef(null);


  useEffect(() => {
  const fetchSavedPosts = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!userId || !token) return;

    try {
      const response = await getUserById(userId, token);
      const saved = response.data.savedPosts || [];
      setSavedPosts(saved);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  fetchSavedPosts();
}, []);

const handleSavePost = async (postId) => {
  try {
    const res = await toggleSavePost(postId);
    if (res.success) {
      if (savedPosts.includes(postId)) {
        setSavedPosts(savedPosts.filter(id => id !== postId));
      } else {
        setSavedPosts([...savedPosts, postId]);
      }
    }
  } catch (err) {
    console.error("Error toggling saved post:", err);
  }
};



  useEffect(() => {
    const fetchFollowedTopics = async () => {
      const currentUser = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (currentUser && token) {
        try {
          const response = await getUserById(currentUser, token);
          const topics = response.data.followedTopics || [];
          setFollowedTopics(topics);
        } catch (error) {
          console.error("Error fetching followed topics:", error);
          setFollowedTopics([]);
        }
      } else {
        console.log("User is not logged in.");
      }
    };

    fetchFollowedTopics();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      const currentUser = localStorage.getItem("userId");

      try {
        const response = await getAllPosts(token);
        const allPosts = response.data;
        let categoryPosts = [];

        for (const post of allPosts) {
          const postCategory = post.category?.categoryTitle;
          const userData = post.userId || {};

          if (
            (selectedCategory === "For You" &&
              followedTopics.includes(postCategory)) ||
            postCategory === selectedCategory
          ) {
            const likesCount = post.likes ? post.likes.length : 0;
            const commentsCount = post.comments ? post.comments.length : 0;

            let userIconUrl = userIcon;
            try {
              const userRes = await getUserById(post.userId, token);
              userIconUrl = userRes.data.photo || userIcon;
            } catch (err) {
              console.warn(`Failed to get user icon for userId ${post.userId}`);
            }

            categoryPosts.push({
              id: post._id,
              userIconUrl,
              likesCount,
              commentsCount,
              ...post,
            });
          }
        }

        categoryPosts.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setPosts(categoryPosts);
        setFilteredPosts(categoryPosts);
        setSelectedContent(
          selectedCategory === "For You"
            ? "Displaying posts for your followed topics"
            : `Displaying content for category: ${selectedCategory}`
        );
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    if (selectedCategory) {
      fetchPosts();
    } else {
      setPosts([]);
      setFilteredPosts([]);
      setSelectedContent("");
    }
  }, [selectedCategory, followedTopics]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (searchQuery) {
        if (posts.length > 0) {
          const filtered = posts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.user.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredPosts(filtered);
          setSelectedContent(
            filtered.length
              ? `Displaying results for: ${searchQuery}`
              : `No posts available for: ${searchQuery}`
          );
        } else {
          setFilteredPosts([]);
          setSelectedContent("No posts available yet.");
        }
      } else {
        setFilteredPosts(posts);
        setSelectedContent(
          selectedCategory === "For You"
            ? "Displaying posts for your followed topics"
            : `Displaying content for category: ${selectedCategory}`
        );
      }
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/SignIn";
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full min-h-screen">
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 h-auto px-3 sm:px-5 py-2 bg-slate-400 shadow-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 sm:gap-10 w-full sm:w-auto">
          <img src={logo} alt="Logo" className="w-24 h-8 object-contain" />
          <div className="w-full sm:w-64 md:w-80 h-10 px-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full flex items-center shadow-inner transition-all focus-within:ring-2 focus-within:ring-blue-500">

            <img src={search} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full text-sm sm:text-base ml-2 bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);

                if (value.trim()) {
                  const filtered = posts.filter(
                    (post) =>
                      post.title.toLowerCase().includes(value.toLowerCase()) ||
                      post.user.toLowerCase().includes(value.toLowerCase())
                  );
                  setFilteredPosts(filtered);
                  setSelectedContent(
                    filtered.length
                      ? `Displaying results for: ${value}`
                      : `No posts available for: ${value}`
                  );
                } else {
                  setFilteredPosts(posts);
                  setSelectedContent(
                    selectedCategory === "For You"
                      ? "Displaying posts for your followed topics"
                      : `Displaying content for category: ${selectedCategory}`
                  );
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 sm:ml-0">
          <Link to="/addpost">
            <img
              src={write}
              alt="Write"
              className="w-6 sm:w-7 h-6 sm:h-8 cursor-pointer"
            />
          </Link>
          <h4 className="text-black text-sm sm:text-base cursor-pointer">
            Write
          </h4>
        </div>
      </div>

      {/* Category Navbar */}
      <nav className="sticky top-[64px] z-40 flex gap-2 overflow-x-auto bg-gray-100 p-2 sm:p-4 text-sm sm:text-base scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <span
          onClick={() => setSelectedCategory("For You")}
          className={`p-2 px-4 rounded-full transition-colors duration-200 cursor-pointer ${
            selectedCategory === "For You"
              ? "bg-blue-500 text-white shadow"
              : "bg-white text-black hover:bg-blue-100"
          }`}
        >
          For You
        </span>
        {followedTopics.map((topic) => (
          <span
            key={topic}
            onClick={() => setSelectedCategory(topic)}
            className={`p-2 px-4 rounded-full transition-colors duration-200 cursor-pointer ${
              selectedCategory === topic
                ? "bg-blue-500 text-white shadow"
                : "bg-white text-black hover:bg-blue-100"
            }`}
          >
            {topic}
          </span>
        ))}
      </nav>

      {/* Info Message */}
      {selectedContent && (
        <div className="p-4 bg-gray-100 text-sm sm:text-lg">
          {selectedContent}
        </div>
      )}

      {/* Post Cards */}
      <div className="p-4 sm:p-6 bg-gray-100 overflow-y-auto flex-grow h-[calc(100vh-16rem)]">
        
        {filteredPosts.length ? (
          filteredPosts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id}>
              
              <motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
  className="relative mb-4 p-4 bg-white shadow-md rounded flex flex-col md:flex-row justify-between items-start gap-4"
>

                
                <div className="flex items-start">
                  <img
                    src={post.userIconUrl || userIcon}
                    alt="User"
                    className="w-10 h-10 rounded-full mr-4 mt-2"
                  />
                  <div>
                    <p className="font-bold text-sm sm:text-base mt-2">
                      {post.user || "Unknown User"}
                    </p>
                    <div className="flex items-center justify-between">
  <h3 className="text-base sm:text-xl font-bold mt-3">
    {post.title}
  </h3>
  
</div>

                    
                    <div className="flex items-center text-gray-500 mt-5 text-xs sm:text-sm">
                      <span>{formatDate(post.createdAt)}</span> 
                      <div className="flex items-center ml-4">
                        <img
                          src={like}
                          alt="Likes"
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                        />
                        <span>{post.likesCount}</span>
                        <img
                          src={comment}
                          alt="Comments"
                          className="w-5 h-5 sm:w-6 sm:h-6 ml-4 mr-1 sm:mr-2"
                        />
                        <span>{post.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
<div className="flex items-end gap-2 md:w-80">
  <button
    className="mb-2 mr-2 text-gray-700 hover:text-yellow-500"
    onClick={(e) => {
      e.preventDefault();
      handleSavePost(post.id);
    }}
  >
    <FontAwesomeIcon
      icon={savedPosts.includes(post.id) ? solidBookmark : regularBookmark}
      className="text-xl"
      title={savedPosts.includes(post.id) ? "Saved" : "Save"}
    />
  </button>

  <img
    src={post.bannerUrl}
    alt={post.title}
    className="w-full md:w-80 h-36 object-cover rounded-xl"
/>
</div>




              </motion.div>
              

            </Link>
          ))
        ) : (
          <p className="text-gray-600 text-sm sm:text-base">
            No posts available for the selected category
          </p>
        )}
      </div>
    </div>
  );
}

function DropdownItem({ img, text, isLogout, handleLogout }) {
  return (
    <li className="dropdownItem">
      <img src={img} alt={text} />
      {isLogout ? (
        <button onClick={handleLogout}>{text}</button>
      ) : (
        <button>{text}</button>
      )}
    </li>
  );
}

export default HomePage;
