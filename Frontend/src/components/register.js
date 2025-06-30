import React, { useState } from "react";
import { toast } from "react-toastify"; // Import toast for notifications
import { registerUser } from "../api/api"; // Import the registerUser function
import { useNavigate,Navigate } from "react-router-dom"; // Import useNavigate for redirection
import "react-toastify/dist/ReactToastify.css"; // Import toast styles


function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

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
      Navigate("/signin"); // Redirect to SignIn page after successful registration

    } catch (error) {
      console.error(error.message);
      toast.error("Registration failed", {
        position: "bottom-center",
      });
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <h3 className="text-center text-xl font-semibold">Sign Up</h3>

      <div className="mb-3">
        <label className="block mb-1 font-semibold">First name</label>
        <input
          type="text"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="First name"
          onChange={(e) => setFname(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-semibold">Last name</label>
        <input
          type="text"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Last name"
          onChange={(e) => setLname(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-semibold">Email address</label>
        <input
          type="email"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-semibold">Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="mt-6">
        <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </div>

      <p className="text-right text-sm mt-2">
        Already registered? <a href="/SignIn" className="text-blue-500 hover:underline">Sign In</a>
      </p>
    </form>
  );
}

export default Register;
