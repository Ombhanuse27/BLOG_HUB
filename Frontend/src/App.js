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
import { Navbar } from "./components/Navbar";
import { Navbar2 } from "./components/Navbar2";
import { getUserById } from "./api/api"; // your backend call
import GoogleAuthHandler from "./components/GoogleAuthHandler"; // your Google auth handler

const Home = () => (
  <div className="h-20 px-5 flex items-center justify-between">
    <h2 className="text-black font-bold">Lets Blog</h2>
    <div className="flex gap-8">
      <h4 className="text-black cursor-pointer">Our Story</h4>
      <Link to="/signin">
        <h4 className="cursor-pointer text-black">Sign In</h4>
      </Link>
    </div>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      if (token && userId) {
        try {
          const userData = await getUserById(userId, token);
          setUser(userData);
        } catch (err) {
          console.error("Invalid token or user fetch failed", err);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            token && user ? (
              <Navigate to="/homepage" replace />
            ) : (
              <div>
                <Home />
                <LandingPage />
              </div>
            )
          }
        />

        <Route path="/homepage" element={<Navbar user={user} />} />
        <Route path="/addpost" element={<AddPost user={user} />} />
        <Route path="/post/:postId" element={<PostDetail user={user} />} />
        <Route path="/categorypage" element={<CategoryPage user={user} />} />
        <Route path="/profile" element={<Navbar2 user={user} />} />
        <Route path="/google-auth" element={<GoogleAuthHandler />} />

        <Route
          path="/signin"
          element={
            <div className="flex justify-center items-center h-screen">
              <div className="bg-white shadow-md rounded-lg p-8 w-96">
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
