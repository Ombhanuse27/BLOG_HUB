import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/register";
import Profile from "./components/profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./components/HomePage";
import AddPost from "./components/AddPost";
import CategoryPage from "./components/CategoryPage";
import PostDetail from "./components/PostDetail";
import LandingPage from "./LandingPage";
import { MainLayout } from "./components/Navbar";
import { Navbar2 } from "./components/Navbar2";
import { Navbar3 } from "./Navbar3";
import { getUserById } from "./api/api"; // your backend call
import GoogleAuthHandler from "./components/GoogleAuthHandler"; // your Google auth handler
import EditPost from "./components/EditPost";
import UserProfile from "./components/UserProfile";
// import ChatWindow from "./components/ChatWindow"; // No longer needed
import ChatLayout from "./components/ChatLayout";
// import IncomingChatRequests from "./components/IncomingChatRequests"; // No longer needed


const Home = () => (
  <>
    <Navbar3 />
    <LandingPage />
  </>
);

const App = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      if (token && userId) {
        try {
          // Make sure getUserById returns response.data
          const res = await getUserById(userId, token); 
          setUser(res.data); // Ensure you're setting the user object, not the whole response
        } catch (err) {
          console.error("Invalid token or user fetch failed", err);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      }
    };

    fetchUser();
  }, [token, userId]); // Add token and userId as dependencies

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            token && user ? (
              <Navigate to="/homepage" replace />
            ) : (
               <Home />
            )
          }
        />

        <Route path="/homepage" element={<MainLayout user={user} />} />
        <Route path="/addpost" element={<AddPost user={user} />} />
        <Route path="/post/:postId" element={<PostDetail user={user} />} />
        <Route path="/edit-post/:postId" element={<EditPost user={user} />} />
        <Route path="/categorypage" element={<CategoryPage user={user} />} />
        <Route path="/profile" element={<Navbar2 user={user} />} />
        <Route path="/google-auth" element={<GoogleAuthHandler />} />
        <Route path="/user/:id" element={<UserProfile user={user} />} />
        
        {/* ======== ROUTING FIX ======== */}
        {/* REMOVE the old conflicting routes */}
        {/* <Route path="/chat/:conversationId" element={<ChatWindow />} /> */}
        {/* <Route path="/chat/requests" element={<IncomingChatRequests />} /> */}

        {/* ADD these two lines. This is all you need. */}
        <Route path="/chat" element={<ChatLayout />} />
        <Route path="/chat/:conversationId" element={<ChatLayout />} />
        {/* ============================= */}

        <Route
          path="/signin"
          element={
            <div className="flex justify-center items-center h-screen">
              <div className="bg-white shadow-md rounded-lg p-8 w-196 border-2 border-blue-500 rounded-2xl">
                <SignIn setUser={setUser} />
              </div>
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div className="flex justify-center items-center h-screen">
              <div className="bg-white shadow-md rounded-lg p-8 w-96">
                <SignUp />
              </div>
            </div>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;