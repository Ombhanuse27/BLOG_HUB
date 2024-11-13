import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from './firebase'; 
import { doc, setDoc, getDoc } from "firebase/firestore"; 

const topics = [
  { name: "Data Science", followed: false },
  { name: "Python", followed: false },
  { name: "Artificial Intelligence", followed: false },
  { name: "Software Development", followed: false },
  { name: "Javascript", followed: false },
  { name: "Recipe", followed: false },
  { name: "Machine Learning", followed: false },
  { name: "Technology", followed: false },
];

function CategoryPage() {
  const [categories, setCategories] = useState(topics);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchFollowedTopics = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        const userId = currentUser.uid;

        try {
          const userDocRef = doc(db, "users", userId);
          const docSnapshot = await getDoc(userDocRef);
          
          if (docSnapshot.exists()) {
            const followed = docSnapshot.data().followedTopics || [];
            const updatedCategories = topics.map((category) => ({
              ...category,
              followed: followed.includes(category.name),
            }));
            setCategories(updatedCategories);
          }
        } catch (error) {
          console.error("Error fetching followed topics:", error);
        }
      }
    };

    fetchFollowedTopics();
  }, [user]);

  const toggleFollow = async (index) => {
    const updatedCategories = categories.map((category, i) =>
      i === index ? { ...category, followed: !category.followed } : category
    );
    setCategories(updatedCategories);

    if (user) {
      const userId = user.uid;
      const followedTopics = updatedCategories
        .filter((category) => category.followed)
        .map((category) => category.name);

      try {
        console.log("Followed Topics to Store:", followedTopics);

        // Store the followed topics in Firestore under the user document
        await setDoc(
          doc(db, "users", userId),
          { followedTopics },
          { merge: true } // Merge the new followed topics with existing data
        );

        console.log("Followed topics updated successfully in Firestore");
      } catch (error) {
        console.error("Error updating followed topics:", error);
      }
    }
  };

  const handleContinue = () => {  
    navigate("/homepage"); 
  };

  return (
    <div className="p-4">
      <h2 className="text-center text-xl font-semibold">Topics to follow</h2>
      <ul className="space-y-4">
        {categories.map((category, index) => (
          <li key={category.name} className="flex justify-between items-center">
            <span>{category.name}</span>
            <button
              className={`p-2 rounded ${category.followed ? "bg-gray-500 text-white" : "bg-blue-600 text-white"}`}
              onClick={() => toggleFollow(index)}
            >
              {category.followed ? "Following" : "Follow"}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center">
        <button 
          className="p-2 bg-green-600 text-white rounded"
          onClick={handleContinue}
        >
          Continue to HomePage
        </button>
      </div>
    </div>
  );
}

export default CategoryPage;
