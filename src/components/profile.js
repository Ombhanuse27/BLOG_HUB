import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs } from 'firebase/firestore';
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import userIcon from '../img/user.png';


function Profile() {
  const [userDetails, setUserDetails] = useState(null);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user);

      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          console.log(docSnap.data());
        } else {
          console.log("User is not logged in");
        }
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/SignIn";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const savedPostsRef = collection(db, `users/${currentUser.uid}/savedPosts`);
        const snapshot = await getDocs(savedPostsRef);
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedPosts(posts);
      }
    };
    fetchSavedPosts();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  

  return (
    <div className="text-center">
      {userDetails ? (
        <>
          <div className="flex justify-center">
            <img
              src={userDetails.photo}
              width={"40%"}
              className="rounded-full"
              alt={`${userDetails.firstName}'s profile`} // Modified alt text
            />
          </div>
          <h3 className="text-center mt-4">Welcome {userDetails.firstName} 🙏🙏</h3>
          <div className="text-center mt-2">
            <p>Email: {userDetails.email}</p>
            <p>FIRST Name: {userDetails.firstName}</p>
          </div>
          <button
            className="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Saved Posts</h1>
      <div className="p-6 bg-gray-100 overflow-y-auto flex-grow h-[calc(100vh-16rem)]">
      {savedPosts.length > 0 ? (
        savedPosts.map(post => (
          <Link to={`/post/${post.id}`} key={post.id}> {/* Navigates to post details */}
              <div className="mb-4 p-4 bg-white shadow-md rounded flex justify-between items-start post-summary">
                <div className="flex items-start">
                  <img src={post.userIcon || userIcon} alt="User" className="w-10 h-10 rounded-full " />
                  <div>
                    <p className="p-2 mr-20 font-bold">{post.user || "Unknown User"}</p>
                    <h3 className="text-xl font-bold mt-4 ">{post.title}</h3>
                    <p className="text-gray-500 mt-5 mr-20">{formatDate(post.timestamp)}</p>
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
        <p>No saved posts.</p>
      )}
      </div>
    </div>
  

    </div>
    
  );
}

export default Profile;
