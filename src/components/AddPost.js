import { useState, useEffect, useRef } from "react";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { auth, db, rtdb } from './firebase'; // import Realtime Database
import { doc, getDoc } from "firebase/firestore"; 
import { ref as dbRef, set } from "firebase/database"; // For Realtime Database
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // For Firebase Storage

const AddPost = () => {
  const editor = useRef(null);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);  // User state
  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [image, setImage] = useState(null);

  // Define the getUserDetails function directly here
  const getUserDetails = async () => {
    return new Promise((resolve, reject) => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              resolve(docSnap.data());
            } else {
              reject("User data not found.");
            }
          } catch (error) {
            reject("Error fetching user data: " + error.message);
          }
        } else {
          reject("User is not logged in.");
        }
      });
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDetails = await getUserDetails();  // Fetch user details
        setUser(userDetails);  // Set user data
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Error fetching user details.");
      }
    };

    fetchUser();

    const fetchFollowedTopics = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
        const userDocRef = doc(db, "users", userId);
        
        try {
          const docSnapshot = await getDoc(userDocRef);
          if (docSnapshot.exists()) {
            const followedTopics = docSnapshot.data().followedTopics || [];
            const followedCategories = followedTopics.map((topic, index) => ({
              categoryId: `followed-${index}`, // Use a dynamic category ID
              categoryTitle: topic,
            }));
            setCategories(followedCategories);
          } else {
            console.log("No followed topics found for the user.");
          }
        } catch (error) {
          console.error("Error fetching followed topics:", error);
          toast.error("Error fetching followed topics.");
        }
      }
    };

    fetchFollowedTopics();
  }, []);

  const fieldChanged = (event) => {
    setPost({ ...post, [event.target.name]: event.target.value });
  };

  const contentFieldChanged = (data) => {
    setPost({ ...post, content: data });
  };

  const createPost = async (event) => {
    event.preventDefault();
  
    if (post.title.trim() === "") {
      toast.error("Post title is required!");
      return;
    }
  
    if (post.content.trim() === "") {
      toast.error("Post content is required!");
      return;
    }
  
    if (post.category === "") {
      toast.error("Select a category!");
      return;
    }
  
    // Generate a unique post ID using timestamp
    const postId = `post_${Date.now()}`;
  
    // Fetch the user's first name and last name from Firestore
    let fullName = "unknown_user"; // Default value
    try {
      if (user) {
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        fullName = `${firstName} ${lastName}`.trim(); // Combine first and last name
      }
    } catch (error) {
      console.error("Error fetching full name:", error);
      toast.error("Error fetching user name.");
    }
  
    // Include a timestamp
    const timestamp = new Date().toISOString();
  
    // Prepare the post object to store in Realtime Database
    const newPost = {
      title: post.title,
      content: post.content,
      category: {
        categoryId: post.category,
        categoryTitle: categories.find(cat => cat.categoryId === post.category)?.categoryTitle || "Unknown",
      },
      userId: auth.currentUser?.uid || 'unknown',  // Ensure we have userId
      user: fullName,  // Correctly retrieved full name
      timestamp: timestamp,
    };
  
    try {
      // If an image is selected, upload it to Firebase Storage
      if (image) {
        const storage = getStorage();
        const bannerRef = storageRef(storage, `banners/banner_${postId}_${Date.now()}`);
  
        // Upload the image
        await uploadBytes(bannerRef, image);
  
        // Get the download URL of the uploaded image
        const bannerUrl = await getDownloadURL(bannerRef);
        newPost.bannerUrl = bannerUrl;
      }
  
      // Save the post data to Firebase Realtime Database
      const postRef = dbRef(rtdb, `posts/${postId}`);
      await set(postRef, newPost);
  
      toast.success("Post Created Successfully!");
  
      // Reset the form
      setPost({
        title: "",
        content: "",
        category: "",
      });
      setImage(null); // Reset the image
  
    } catch (error) {
      toast.error("Post not created due to an error: " + error.message);
      console.error("Error adding post:", error); // Log the error for debugging
    }
  };

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-white shadow-md rounded-lg flex">
      <div className="p-5 border-b mb-4">
        <h3 className="text-xl font-bold  text-gray-700">What's going on in your mind?</h3>
      </div>
      <form onSubmit={createPost} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Post Title
          </label>
          <input
            type="text"
            id="title"
            placeholder="Enter your post title here"
            name="title"
            value={post.title}
            onChange={fieldChanged}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Post Content
          </label>
          <JoditEditor
            ref={editor}
            value={post.content}
            onChange={contentFieldChanged}
            className="block w-full border border-gray-300 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Select Post Banner
          </label>
          <input
            id="image"
            type="file"
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Post Category
          </label>
          <select
            id="category"
            name="category"
            value={post.category}
            onChange={fieldChanged}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option disabled value="">
              -- Select category --
            </option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option value={category.categoryId} key={category.categoryId}>
                  {category.categoryTitle}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option> 
            )}
          </select>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          >
            Create Post
          </button>
          <button
            type="button"
            className="ml-4 px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring focus:ring-red-300"
            onClick={() =>
              setPost({
                title: "",
                content: "",
                category: "",
              })
            }
          >
            Reset Content
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPost;
