import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebase"; // Ensure correct import
import { toast } from "react-toastify"; // Import toast for notifications

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Define default categories to be stored in Firestore
      const defaultCategories = [
        "Data Science",
        "Self Improvement",
        "Technology",
        "Writing",
        "Relationships"
      ];

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName: fname,
        lastName: lname,
        followedTopics: [], // Initially no topics followed
        categories: defaultCategories // Add categories field
      });

      console.log("User Registered Successfully!!");
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
    } catch (error) {
      console.error(error.message);
      toast.error(error.message, {
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
