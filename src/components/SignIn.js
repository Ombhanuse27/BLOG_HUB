import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate for programmatic navigation
import "react-toastify/dist/ReactToastify.css";

import SignInwithGoogle from "./signInWIthGoogle";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize the navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
      navigate("/CategoryPage"); // Use navigate for client-side routing
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
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

      <p className="text-right text-sm mt-2">
        New user? <a href="/register" className="text-blue-500 hover:underline">Register Here</a>
      </p>
      <SignInwithGoogle />
    </form>
  );
}

export default SignIn;
