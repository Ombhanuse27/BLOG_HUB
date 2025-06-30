import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById, updateFollowedTopics } from "../api/api";

// Import icons or images for categories
import dataScienceIcon from 'img/ds.png';
import pythonIcon from 'img/python.webp';
import aiIcon from 'img/ai.webp';
import softwareDevIcon from 'img/softwaredev.webp';
import javascriptIcon from 'img/js.webp';
import recipeIcon from 'img/recipe.webp';
import machineLearningIcon from 'img/machinelearning.webp';
import technologyIcon from 'img/tech.png';

const topics = [
  { name: "Data Science", icon: dataScienceIcon, followed: false },
  { name: "Python", icon: pythonIcon, followed: false },
  { name: "Artificial Intelligence", icon: aiIcon, followed: false },
  { name: "Software Development", icon: softwareDevIcon, followed: false },
  { name: "Javascript", icon: javascriptIcon, followed: false },
  { name: "Recipe", icon: recipeIcon, followed: false },
  { name: "Machine Learning", icon: machineLearningIcon, followed: false },
  { name: "Technology", icon: technologyIcon, followed: false },
];

function CategoryPage() {
  const [categories, setCategories] = useState(topics);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      console.log("User ID:", userId);
      try {
        const res = await getUserById(userId, token);
        const followed = res.data.followedTopics || [];
        console.log("Followed Topics:", followed);
        const updatedCategories = topics.map((category) => ({
          ...category,
          followed: followed.includes(category.name),
        }));
        setCategories(updatedCategories);
        setUser(userId);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  const toggleFollow = async (index) => {
    const updatedCategories = categories.map((category, i) =>
      i === index ? { ...category, followed: !category.followed } : category
    );
    setCategories(updatedCategories);

    const followedTopics = updatedCategories
      .filter((category) => category.followed)
      .map((category) => category.name);

    try {
      const token = localStorage.getItem("token");
      await updateFollowedTopics(user, followedTopics, token);
    } catch (error) {
      console.error("Error updating followed topics:", error);
    }
  };

  const handleContinue = () => {
    navigate("/homepage");
  };

  return (
    <div className="px-4 py-6 max-w-md w-full mx-auto sm:px-6 md:px-8">
      <h2 className="text-center text-xl sm:text-2xl font-bold mb-6">Topics to Follow</h2>

      <ul className="space-y-4">
        {categories.map((category, index) => (
          <li
            key={category.name}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-3 sm:mb-0">
              <img src={category.icon} alt={category.name} className="w-8 h-8 mr-3 sm:mr-4" />
              <span className="text-base sm:text-lg font-medium">{category.name}</span>
            </div>
            <button
              className={`w-full sm:w-auto px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                category.followed
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={() => toggleFollow(index)}
            >
              {category.followed ? "Following" : "Follow"}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <button
          className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors"
          onClick={handleContinue}
        >
          Continue to HomePage
        </button>
      </div>
    </div>
  );
}

export default CategoryPage;
