import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Link } from "react-router-dom";
import userIcon from '../img/user.png';
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid'; 

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [savedPosts, setSavedPosts] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editData, setEditData] = useState({
    photo: '',
    name: '',
    address: '',
    phone: '',
    socialLink: '',
    location: '',
    dob: ''
  });

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          setEditData(docSnap.data()); // Pre-fill editData with existing data
        } else {
          console.log("User not found.");
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

  const fetchSavedPosts = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const savedPostsRef = collection(db, `users/${currentUser.uid}/savedPosts`);
      const snapshot = await getDocs(savedPostsRef);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedPosts(posts);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        let photoURL = userDetails.photo;

        if (editData.photo && editData.photo instanceof File) {
          const storageRef = ref(storage, `images/${user.uid}/${uuidv4()}`);
          await uploadBytes(storageRef, editData.photo);
          photoURL = await getDownloadURL(storageRef);
        }

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          ...editData,
          photo: photoURL,
        });

        setUserDetails({ ...userDetails, ...editData, photo: photoURL });
        setShowEditProfile(false);
        console.log("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

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
              src={userDetails.photo || userIcon}
              width={"40%"}
              className="rounded-full mt-4 w-20 h-20 object-cover"
            />
          </div>
          <h3 className="text-center mt-4">Welcome {userDetails.firstName} 🙏🙏</h3>
          <div className="text-center mt-2">
            <p>Email: {userDetails.email}</p>
            <button
              className="text-xl mt-2 text-green-500"
              onClick={() => setShowEditProfile(true)}
            >
              Edit Profile
            </button>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}

      <nav className="flex space-x-4 mt-4 bg-gray-200 p-4">
        <span
          onClick={() => setSelectedSection("Saved Posts")}
          className={`p-2 cursor-pointer ${
            selectedSection === "Saved Posts" ? 'bg-white-700 text-black border-b-2 border-slate-900' : 'bg-white-500 text-black'
          }`}
        >
          Saved Posts
        </span>
        <span
          onClick={() => setSelectedSection("About")}
          className={`p-2 cursor-pointer ${
            selectedSection === "Saved Posts" ? 'bg-white-700 text-black border-b-2 border-slate-900' : 'bg-white-500 text-black'
          }`}
        >
          About
        </span>
      </nav>

      <div className="w-full">
        <h1 className="text-2xl mt-5 flex ml-10 font-bold mb-4">Showing the Saved Posts</h1>
        <div className="p-6 bg-gray-100 overflow-y-auto flex-grow h-[calc(100vh-16rem)]">
          {savedPosts.length > 0 ? (
            savedPosts.map(post => (
              <Link to={`/post/${post.id}`} key={post.id}>
                <div className="mb-4 p-4 bg-white shadow-md rounded flex justify-between items-start post-summary">
                  <div className="flex items-start">
                    <img src={post.userIcon || userIcon} alt="User" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="p-2 mr-20 font-bold">{post.user || "Unknown User"}</p>
                      <h3 className="text-xl font-bold mt-4">{post.title}</h3>
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

      {showEditProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
            <input type="file" name="photo" className="mb-3" onChange={(e) => setEditData({ ...editData, photo: e.target.files[0] })} />
            <input type="text" name="name" placeholder="Name" value={editData.name} className="mb-2 p-2 border" onChange={handleEditInputChange} />
            <input type="text" name="address" placeholder="Address" value={editData.address} className="mb-2 p-2 border" onChange={handleEditInputChange} />
            <input type="tel" name="phone" placeholder="Phone Number" value={editData.phone} className="mb-2 p-2 border" onChange={handleEditInputChange} />
            <input type="text" name="socialLink" placeholder="Social Media Link" value={editData.socialLink} className="mb-2 p-2 border" onChange={handleEditInputChange} />
            <input type="text" name="location" placeholder="Location" value={editData.location} className="mb-2 p-2 border" onChange={handleEditInputChange} />
            <input type="date" name="dob" placeholder="Date of Birth" value={editData.dob} className="mb-2 p-2 border" onChange={handleEditInputChange} />
            <button className="bg-blue-600 text-white p-2 rounded mt-4" onClick={handleSaveProfile}>Save</button>
            <button className="bg-red-500 text-white p-2 rounded mt-2" onClick={() => setShowEditProfile(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
