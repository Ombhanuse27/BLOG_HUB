import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getUserById } from "../api/api";
import "react-toastify/dist/ReactToastify.css";

// Import icons (e.g., from react-icons)
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock } from "react-icons/fi";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in both fields.", { position: "bottom-center" });
    }
    setIsLoading(true);

    try {
      const { data } = await loginUser({ email, password });
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "https://blog-hub-ud2n.onrender.com/api/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-500 mt-2">Sign in to continue to your account.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full p-3 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Separator */}
        <div className="flex items-center justify-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full p-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
          >
            <FcGoogle size={22} />
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* Registration Link */}
        <p className="text-center text-sm text-gray-600">
          New user?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;