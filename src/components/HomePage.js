import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import userIcon from '../img/user.png';
import edit from '../img/edit.png';
import logout from '../img/log-out.png';
import { auth, rtdb, db } from './firebase';
import { getDoc, doc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";

function HomePage() {
  const [open, setOpen] = useState(false);
  const [followedTopics, setFollowedTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [posts, setPosts] = useState([]); 
  const [selectedContent, setSelectedContent] = useState(""); 
  let menuRef = useRef();

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
        const categoryPosts = [];

        if (allPosts) {
          for (let key in allPosts) {
            if (allPosts[key].category && allPosts[key].category.categoryTitle === selectedCategory) {
              categoryPosts.push({
                id: key,
                ...allPosts[key],
              });
            }
          }
        }

        setPosts(categoryPosts);
        setSelectedContent(`Displaying content for category: ${selectedCategory}`);
      }, (error) => {
        console.error("Error fetching posts:", error);
      });
    };

    if (selectedCategory) {
      fetchPosts();
    } else {
      setPosts([]);
      setSelectedContent("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
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

  // Function to format the timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div>
      <div className='h-16 px-5 bg-red-500 flex items-center justify-between'>
        <h2 className="text-white font-bold">Logo</h2>
        <div className="flex-grow mx-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-70 p-2 border rounded focus:outline-none"
          />
        </div>
        <div className='flex gap-20'>
          <Link to="/addpost">
            <h4 className="text-white cursor-pointer">Write</h4>
          </Link>
          <div className="App">
            <div className='menu-container' ref={menuRef}>
              <div className='menu-trigger' onClick={() => { setOpen(!open) }}>
                <img src={userIcon} alt="User Profile" className="w-7 h-8 rounded-full" />
              </div>
              <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`}>
                <h3>Bunny<br /><span>Website Developer</span></h3>
                <ul>
                  <DropdownItem img={userIcon} text={"My Profile"} />
                  <DropdownItem img={edit} text={"Edit Profile"} />
                  <DropdownItem img={logout} text={"Logout"} isLogout handleLogout={handleLogout} />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex space-x-4 bg-gray-200 p-4">
        {followedTopics.length ? (
          followedTopics.map((topic) => (
            <span
              key={topic}
              onClick={() => setSelectedCategory(topic)} 
              className={`p-2 rounded cursor-pointer ${
                selectedCategory === topic ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
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

      <div className="p-6 bg-gray-100">
        {posts.length ? (
          posts.map((post) => (
            <div key={post.id} className="mb-4 p-4 bg-white shadow-md rounded flex justify-between items-start">
              <div className="flex items-start">
                <img src={post.userIcon || userIcon} alt="User" className="w-10 h-10 rounded-full mr-4" />
                <div>
                  <p className="font-bold">{post.user || "Unknown User"}</p>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                  <p className="text-gray-500">{formatDate(post.timestamp)}</p> {/* Display formatted date */}
                </div>
              </div>
              <div>
                <img 
                  src={post.bannerUrl} 
                  alt={post.title} 
                  className="w-64 h-32 object-cover rounded" // Adjust the size for post banner
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No posts available for the selected category</p>
        )}
      </div>
    </div>
  );
}

function DropdownItem(props) {
  return (
    <li className='dropdownItem'>
      <img src={props.img} alt={props.text} />
      {props.isLogout ? (
        <button onClick={props.handleLogout}>{props.text}</button>
      ) : (
        <button>{props.text}</button>
      )}
    </li>
  );
}

export default HomePage;
