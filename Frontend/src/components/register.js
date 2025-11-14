import React, { useState } from "react";
import { toast } from "react-toastify";
import { registerUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const defaultCategories = [
      "Data Science",
      "Self Improvement",
      "Technology",
      "Writing",
      "Relationships",
    ];

    const userData = {
      email,
      password,
      firstName: fname,
      lastName: lname,
      followedTopics: [],
      categories: defaultCategories,
    };

    try {
      const res = await registerUser(userData);
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
      navigate("/signin");
    } catch (error) {
      console.error(error.message);
      toast.error("Registration failed", {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Create Your Account
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">
          Sign up and explore new stories & ideas.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-6">

        {/* First Name */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            type="text"
            placeholder="Enter first name"
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-xl text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setFname(e.target.value)}
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Enter last name"
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-xl text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setLname(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter email"
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-xl text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-xl text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-xl text-lg font-semibold 
                     hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          Create Account
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <a href="/signin" className="font-semibold text-blue-600 hover:underline">
          Sign In
        </a>
      </p>
    </div>
  );
}

export default Register;
