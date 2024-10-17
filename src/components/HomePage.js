import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import userIcon from '../img/user.png';
import edit from '../img/edit.png';
import logout from '../img/log-out.png';
import { auth, rtdb, db } from './firebase'; // Import the services from your firebase config
import { getDoc, doc } from "firebase/firestore"; // Firestore imports for followed topics
import { ref, onValue } from "firebase/database"; // Realtime Database imports for posts

function HomePage() {
  const [open, setOpen] = useState(false);
  const [followedTopics, setFollowedTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [posts, setPosts] = useState([]); 
  const [selectedContent, setSelectedContent] = useState(""); 
  let menuRef = useRef();

  // Fetch followed topics from Firestore
  useEffect(() => {
    const fetchFollowedTopics = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
        const userDocRef = doc(db, `users/${userId}`); // Use Firestore db here
        
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            const topics = data.followedTopics || [];
            console.log("Followed topics found:", topics);
            setFollowedTopics(topics); 
          } else {
            console.log("No followed topics found.");
            setFollowedTopics([]); // Set empty if no topics are found
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

  // Fetch posts based on selected category from Realtime Database
  useEffect(() => {
    const fetchPosts = () => {
      const postsRef = ref(rtdb, 'posts'); // Use Realtime Database for fetching posts
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
      setPosts([]); // Clear posts if no category is selected
      setSelectedContent(""); // Clear the selected content when no category is selected
    }
  }, [selectedCategory]);

  // Handle dropdown close
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

  // Handle logout
  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/SignIn"; 
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

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

      {/* Category Navigation */}
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

      {/* Display Selected Content */}
      {selectedContent && <div className="p-4 bg-gray-100 text-lg">{selectedContent}</div>}

      {/* Posts Display */}
      <div className="p-6 bg-gray-100">
        {posts.length ? (
          posts.map((post) => (
            <div key={post.id} className="mb-4 p-4 bg-white shadow-md rounded">
              <h3 className="text-xl font-bold">{post.title}</h3>
              <p className="text-gray-700">{post.content}</p>
              <p className="text-gray-500">{post.category.categoryTitle}</p> 
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
