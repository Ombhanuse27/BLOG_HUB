import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import userIcon from "../img/user.png";
import { storage } from "./firebase";
import like from "../img/like.png";
import comment from "../img/comment.png";
import { rtdb } from "./firebase";
import { onValue, ref } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Saved Posts");
  const [savedPosts, setSavedPosts] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editData, setEditData] = useState({
    photo: "",
    name: "",
    address: "",
    phone: "",
    socialLink: "",
    location: "",
    dob: "",
  });

  // Fetch user data from Firestore
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

  // Fetch saved posts from Firestore and Realtime Database
  const fetchSavedPosts = async () => {
    const currentUser = auth.currentUser;
    console.log("Current User:", currentUser); // Debugging

    if (currentUser) {
      try {
        // Fetch saved posts from Firestore
        const savedPostsRef = collection(
          db,
          `users/${currentUser.uid}/savedPosts`
        );
        const snapshot = await getDocs(savedPostsRef);
        console.log("Snapshot docs:", snapshot.docs); // Debugging

        const posts = [];
        const promises = [];

        snapshot.docs.forEach((docSnap) => {
          const fetchPostDetails = async () => {
            const postData = docSnap.data();
            const postId = docSnap.id;
            console.log("Post Data:", postData); // Debugging

            // Default values
            let userIconUrl = userIcon; // Use the default user icon
            let likesCount = 0;
            let commentsCount = 0;

            // Fetch user profile icon from Firestore
            if (postData.userId) {
              try {
                const userDocRef = doc(db, `users/${postData.userId}`);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  userIconUrl = userDocSnap.data()?.photo || userIconUrl;
                }
              } catch (error) {
                console.error(
                  `Error fetching user profile for userId: ${postData.userId}`,
                  error
                );
              }
            }

            // Fetch like and comment counts from Realtime Database
            const postRef = ref(rtdb, `posts/${postId}`);
            const postSnapshotPromise = new Promise((resolve) => {
              onValue(
                postRef,
                (snapshot) => {
                  const postDetails = snapshot.val();
                  likesCount = postDetails?.likes
                    ? Object.keys(postDetails.likes).length
                    : 0;
                  commentsCount = postDetails?.comments
                    ? Object.keys(postDetails.comments).length
                    : 0;

                  resolve({
                    id: postId,
                    userIcon: userIconUrl,
                    likesCount,
                    commentsCount,
                    ...postData,
                  });
                },
                (error) => {
                  console.error(
                    `Error fetching Realtime Database data for postId: ${postId}`,
                    error
                  );
                  resolve({
                    id: postId,
                    userIcon: userIconUrl,
                    likesCount,
                    commentsCount,
                    ...postData,
                  });
                }
              );
            });

            return postSnapshotPromise;
          };

          promises.push(fetchPostDetails());
        });

        // Wait for all promises to resolve
        const results = await Promise.all(promises);
        console.log("Saved Posts Results:", results); // Debugging
        setSavedPosts(results); // Update the savedPosts state
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    }
  };

  // Fetch user data and saved posts on component mount
  useEffect(() => {
    fetchUserData();
    fetchSavedPosts();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/SignIn";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  // Handle input changes in the edit profile form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        let photoURL = userDetails.photo;

        // Upload new photo if selected
        if (editData.photo && editData.photo instanceof File) {
          const fileRef = storageRef(storage, `images/${user.uid}/${uuidv4()}`);
          await uploadBytes(fileRef, editData.photo);
          photoURL = await getDownloadURL(fileRef);
        }

        // Update user data in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          ...editData,
          photo: photoURL,
        });

        // Update local state
        setUserDetails({ ...userDetails, ...editData, photo: photoURL });
        setShowEditProfile(false);
        console.log("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  // Format timestamp to a readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "No Date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
  <div className="w-full min-h-screen bg-gray-100 py-6 px-4">
    <div className="max-w-4xl  mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-y-auto flex-grow h-[calc(100vh-16rem)]">
      {userDetails ? (
        <>
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center">
            <img
              src={userDetails.photo || userIcon}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow"
              alt="Profile"
            />
            <h3 className="mt-4 text-lg sm:text-xl font-semibold">
              Welcome {userDetails.firstName} 🙏
            </h3>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Email: {userDetails.email}
            </p>
            <button
              className="mt-3 text-blue-600 hover:underline text-sm"
              onClick={() => setShowEditProfile(true)}
            >
              Edit Profile
            </button>
          </div>

          {/* Tabs */}
          <div className="flex justify-center flex-wrap gap-2 sm:space-x-4 mt-6 border-b pb-2">
            {["Saved Posts", "About"].map((section) => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-4 py-2 font-medium text-sm sm:text-base ${
                  selectedSection === section
                    ? "border-b-4 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Edit Profile Modal */}
          {showEditProfile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
              <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-md">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Edit Profile
                </h2>
                {/* Photo input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      photo: e.target.files[0],
                    }))
                  }
                  className="mb-2"
                />
                {/* Input fields */}
                {[
                  "name",
                  "address",
                  "phone",
                  "socialLink",
                  "location",
                  "dob",
                ].map((field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                    value={editData[field]}
                    onChange={handleEditInputChange}
                    className="w-full mb-2 p-2 border rounded text-sm"
                  />
                ))}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setShowEditProfile(false)}
                    className="px-4 py-2 bg-gray-300 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="mt-6">
            {selectedSection === "Saved Posts" ? (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Your Saved Posts
                </h2>
                {savedPosts.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {savedPosts.map((post) => (
                      <Link to={`/post/${post.id}`} key={post.id}>
                        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition flex flex-col sm:flex-row">
                          {/* Left: Content */}
                          <div className="flex-1 sm:pr-4">
                            <div className="flex items-start gap-4">
                              <img
                                src={post.userIcon || userIcon}
                                alt="User"
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">
                                  {post.user || "Unknown"}
                                </p>
                                <h3 className="text-base sm:text-lg font-bold mt-1">
                                  {post.title || "No Title"}
                                </h3>
                                <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-2 flex-wrap gap-2">
                                  <span>{formatDate(post.timestamp)}</span>
                                  <div className="flex items-center gap-2 ml-0 sm:ml-4">
                                    <img
                                      src={like}
                                      alt="Likes"
                                      className="w-4 h-4 sm:w-5 sm:h-5"
                                    />
                                    <span>{post.likesCount}</span>
                                    <img
                                      src={comment}
                                      alt="Comments"
                                      className="w-5 h-5 sm:w-6 sm:h-6 ml-2"
                                    />
                                    <span>{post.commentsCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Banner Image */}
                          <div className="mt-3 sm:mt-0 sm:ml-2">
                            <img
                              src={
                                post.bannerUrl ||
                                "https://via.placeholder.com/150"
                              }
                              alt={post.title || "Post"}
                              className="w-full sm:w-32 h-24 object-cover rounded"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    You haven’t saved any posts yet.
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  About
                </h2>
                <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {userDetails.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {userDetails.address || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {userDetails.phone || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Social Link:</span>{" "}
                    <a
                      href={userDetails.socialLink}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {userDetails.socialLink || "N/A"}
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {userDetails.location || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Date of Birth:</span>{" "}
                    {userDetails.dob || "N/A"}
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <p className="text-center">Loading profile...</p>
      )}
    </div>
  </div>
);

}

export default Profile;
