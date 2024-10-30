import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import userIcon from '../img/user.png';
import edit from '../img/edit.png';
import logo from '../img/letsblog.png';
import search from '../img/search.png';
import logout from '../img/log-out.png';
import { auth, rtdb, db } from './firebase';
import { getDoc, doc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";

function HomePage() {
  const [open, setOpen] = useState(false);
  const [followedTopics, setFollowedTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("For You"); 
  const [posts, setPosts] = useState([]); 
  const [selectedContent, setSelectedContent] = useState(""); 
  let menuRef = useRef(null);

  useEffect(() => {
    const fetchFollowedTopics = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
        const userDocRef = doc(db, `users/${userId}`);
        
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            const topics = data.followedTopics || [];
            setFollowedTopics(topics);
          } else {
            setFollowedTopics([]);
          }
        } catch (error) {
          console.error("Error fetching followed topics:", error);
        }
      } else {
        console.log("User is not logged in.");
      }
    };

    fetchFollowedTopics();
  }, []); 

  useEffect(() => {
    const fetchPosts = () => {
      const postsRef = ref(rtdb, 'posts');
      onValue(postsRef, (snapshot) => {
        const allPosts = snapshot.val();
        let categoryPosts = [];
  
        if (allPosts) {
          for (let key in allPosts) {
            const postCategory = allPosts[key].category?.categoryTitle;
  
            // Check if the category is "For You"
            if (selectedCategory === "For You") {
              if (followedTopics.includes(postCategory)) {
                categoryPosts.push({
                  id: key,
                  ...allPosts[key],
                });
              }
            } else if (postCategory === selectedCategory) {
              categoryPosts.push({
                id: key,
                ...allPosts[key],
              });
            }
          }
        }
  
        setPosts(categoryPosts);
        setSelectedContent(
          selectedCategory === "For You"
            ? "Displaying posts for your followed topics"
            : `Displaying content for category: ${selectedCategory}`
        );
      }, (error) => {
        console.error("Error fetching posts:", error);
      });
    };
  
    // Fetch posts if a category is selected or "For You" is selected
    if (selectedCategory) {
      fetchPosts();
    } else {
      setPosts([]);
      setSelectedContent("");
    }
  }, [selectedCategory, followedTopics]); // Add followedTopics as dependency
  

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

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/SignIn"; 
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="w-full">
      <div className='h-16 px-5 bg-slate-400 flex items-center justify-between'>
        <div className='flex gap-10 '>
        <img src={logo} alt="Logo" className="w-27 h-8" />
        <div className="w-50 h-10 p-2 -ml-5 bg-white border rounded-2xl flex">
          <img src={search} alt="Search" className="w-5 h-5" />  
          <input
            type="text"  
            placeholder="Search..."
            className="w-40 h-7 ml-2 bg-transparent outline-none"
          />
          </div>
        </div>
        <div className='flex gap-20'>
          <Link to="/addpost">
            <h4 className="text-black cursor-pointer">Write</h4>
          </Link>

          {/* Conditional Dropdown Rendering */}
          {/* <div className="App">
            <div className='menu-container' ref={menuRef}>
              <div className='menu-trigger' onClick={() => setOpen(!open)}>
                <img src={userIcon} alt="User Profile" className="w-7 h-8 rounded-full" />
              </div>
              {open && (
                <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`}>
                  <h3>Bunny<br /><span>Website Developer</span></h3>
                  <ul>
                    <DropdownItem img={userIcon} text={"My Profile"} />
                    <DropdownItem img={edit} text={"Edit Profile"} />
                    <DropdownItem img={logout} text={"Logout"} isLogout handleLogout={handleLogout} />
                  </ul>
                </div>
              )}
            </div>
          </div> */}
        </div>
      </div>

      <nav className="flex space-x-4 bg-gray-200 p-4">
      
  {/* "For You" category */}
  <span
    onClick={() => setSelectedCategory("For You")} 
    className={`p-2 cursor-pointer ${
      selectedCategory === "For You" ? 'bg-white-700 text-black border-b-2 border-slate-900' : 'bg-white-500 text-black'
    }`}
  >
    For You
  </span>
        {followedTopics.length ? (
          followedTopics.map((topic) => (
            <span
              key={topic}
              onClick={() => setSelectedCategory(topic)} 
              className={`p-2 cursor-pointer ${
                selectedCategory === topic ? 'bg-white-700 text-black border-b-2 border-slate-900' : 'bg-white-500 text-black'
              }`}
            >
              {topic}
            </span>
          ))
        ) : (
          <span className="p-2 text-gray-600">No topics followed yet</span>
        )}
      </nav>

      {selectedContent && <div className="p-4 bg-gray-100 text-lg">{selectedContent}</div>}

      <div className="p-6 bg-gray-100 overflow-y-auto flex-grow h-[calc(100vh-16rem)]">
        {posts.length ? (
          posts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id}> {/* Navigates to post details */}
              <div className="mb-4 p-4 bg-white shadow-md rounded flex justify-between items-start post-summary">
                <div className="flex items-start">
                  <img src={post.userIcon || userIcon} alt="User" className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <p className="font-bold">{post.user || "Unknown User"}</p>
                    <h3 className="text-xl font-bold mt-4">{post.title}</h3>
                    <p className="text-gray-500 mt-5">{formatDate(post.timestamp)}</p>
                  </div>
                </div>
                <div>
                  <img 
                    src={post.bannerUrl} 
                    alt={post.title} 
                    className="w-64 h-32 object-cover rounded"
                  />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-600">No posts available for the selected category</p>
        )}
      </div>
    </div>
    
  );
}

function DropdownItem({ img, text, isLogout, handleLogout }) {
  return (
    <li className='dropdownItem'>
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