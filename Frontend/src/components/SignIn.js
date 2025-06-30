import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { loginUser,getUserById } from "../api/api"; // <-- your backend API call
import "react-toastify/dist/ReactToastify.css";
import GoogleAuthHandler from "./GoogleAuthHandler";


function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await loginUser({ email, password });

      // Optionally store token and user info (if using JWT auth)
      localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);

    const user = await getUserById(data.userId, data.token);
     

      if (user.data.followedTopics?.length > 0) {
        navigate("/HomePage");
      } else {
        navigate("/CategoryPage");
      }
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Login failed", {
        position: "bottom-center",
      });
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-center text-xl font-semibold">Login</h3>

      <div className="mb-3">
        <label className="block mb-1 font-semibold">Email address</label>
        <input
          type="email"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-semibold">Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Submit
        </button>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign in with Google
        </button>
      </div>

      <p className="text-right text-sm mt-2">
        New user? <a href="/register" className="text-blue-500 hover:underline">Register Here</a>
      </p>
    </form>
  );
}

export default SignIn;
