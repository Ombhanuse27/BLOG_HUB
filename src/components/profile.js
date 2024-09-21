import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user);

      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        console.log(docSnap.data());
      } else {
        console.log("User is not logged in");
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

  return (
    <div className="text-center">
      {userDetails ? (
        <>
          <div className="flex justify-center">
            <img
              src={userDetails.photo}
              width={"40%"}
              className="rounded-full"
            />
          </div>
          <h3 className="text-center mt-4">Welcome {userDetails.firstName} 🙏🙏</h3>
          <div className="text-center mt-2">
            <p>Email: {userDetails.email}</p>
            <p>First Name: {userDetails.firstName}</p>
          </div>
          <button className="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Profile;
