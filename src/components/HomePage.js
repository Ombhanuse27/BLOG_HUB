import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import userIcon from '../img/user.png';
import edit from '../img/edit.png';
import logout from '../img/log-out.png';
import { auth, db } from './firebase'; 
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"; 

function HomePage() {
  const [open, setOpen] = useState(false);
  const [followedTopics, setFollowedTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [posts, setPosts] = useState([]); 
  let menuRef = useRef();

  // Fetch followed topics
  useEffect(() => {
    const fetchFollowedTopics = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
        const userDocRef = doc(db, "users", userId); 
        const docSnapshot = await getDoc(userDocRef); 

        if (docSnapshot.exists()) {
          const topics = docSnapshot.data().followedTopics || [];
          setFollowedTopics(topics); 
        }
      }
    };

    fetchFollowedTopics();
  }, []); 

  // Fetch posts based on selected category
  useEffect(() => {
    const fetchPosts = async () => {
      if (selectedCategory) {
        const q = query(collection(db, "posts"), where("category", "==", selectedCategory));
        const querySnapshot = await getDocs(q);
        const categoryPosts = querySnapshot.docs.map(doc => doc.data());
        setPosts(categoryPosts); 
      }
    };

    fetchPosts();
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
  });

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

      {/* Posts Display */}
      <div className="p-6 bg-gray-100">
        {posts.length ? (
          posts.map((post) => (
            <div key={post.id} className="mb-4 p-4 bg-white shadow-md rounded">
              <h3 className="text-xl font-bold">{post.title}</h3>
              <p className="text-gray-700">{post.content}</p>
              <p className="text-gray-500">{post.category}</p>
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
