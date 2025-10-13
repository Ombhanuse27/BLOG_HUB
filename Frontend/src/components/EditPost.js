// ✅ src/components/EditPost.js (Create this new file)

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { getUserById, fetchPostById, updatePostById, uploadImageToCloudinary } from "../api/api";

const EditPost = () => {
  const editor = useRef(null);
  const { postId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUserId = localStorage.getItem("userId");
        if (!storedToken || !storedUserId) {
            toast.error("You must be logged in to edit a post.");
            navigate("/login");
            return;
        }
        setToken(storedToken);

        // Fetch user data and followed topics for the category dropdown
        const userRes = await getUserById(storedUserId, storedToken);
        setUser(userRes.data);
        const followedCategories = (userRes.data.followedTopics || []).map((topic, index) => ({
          categoryId: `followed-${index}`, // Ensure this logic matches how categories are stored
          categoryTitle: topic,
        }));
        setCategories(followedCategories);

        // Fetch the existing post data
        const postData = await fetchPostById(postId);
        if (postData.userId !== storedUserId) {
            toast.error("You are not authorized to edit this post.");
            navigate(`/post/${postId}`);
            return;
        }

        // Pre-fill the form with existing post data
        setPost({
            title: postData.title,
            content: postData.content,
            category: postData.category.categoryId, // Make sure categoryId is correct
            bannerUrl: postData.bannerUrl || "",

        });

      } catch (err) {
        console.error("Fetch error:", err.message);
        toast.error("Failed to load post data for editing.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, navigate]);

  const fieldChanged = (event) => {
    setPost({ ...post, [event.target.name]: event.target.value });
  };

  const contentFieldChanged = (data) => {
    setPost({ ...post, content: data });
  };

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!post.title.trim() || !post.content.trim() || !post.category) {
      toast.error("Please fill all fields");
      return;
    }

    const updatedPostData = {
      title: post.title,
      content: post.content,
      category: {
        categoryId: post.category,
        categoryTitle: categories.find(cat => cat.categoryId === post.category)?.categoryTitle || "Unknown",
      },
      
      userId: user?._id,
      user: user?.name,
    };

    try {
      if (image) {
        toast.info("Uploading new banner image...");
        const imageUrl = await uploadImageToCloudinary(image);
        updatedPostData.bannerUrl = imageUrl;
      }

      await updatePostById(postId, updatedPostData, token);
      toast.success("Post updated successfully!");
      navigate(`/post/${postId}`); // Navigate back to the post detail page
    } catch (err) {
      console.error("Post update failed:", err.message);
      toast.error("Failed to update post.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading editor...</div>;
  }

  return (
    <div className="max-w-5xl w-full mx-auto my-8 p-4 sm:p-6 bg-white shadow-md rounded-lg flex flex-col">
      <div className="p-4 sm:p-5 border-b mb-6 flex justify-center items-center">
        <h3 className="text-lg sm:text-xl font-bold text-center text-gray-700">
          Edit Your Post
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* Title Field */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Post Title
          </label>
          <input
            type="text" id="title" placeholder="Enter post title" name="title"
            value={post.title} onChange={fieldChanged}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Post Content
          </label>
          <JoditEditor
            ref={editor} value={post.content} onChange={contentFieldChanged}
          />
        </div>

        {/* Image Field */}
        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Select a New Banner (Optional)
          </label>
          {/* ✅ Show existing image preview */}
  {post.bannerUrl && (
    <img
      src={post.bannerUrl}
      alt="Current Banner"
      className="w-full max-h-60 object-cover rounded-lg mb-2"
    />
  )}
          <input id="image" type="file" onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Category Field */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Post Category
          </label>
          <select id="category" name="category" value={post.category} onChange={fieldChanged}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option disabled value="">-- Select category --</option>
            {categories.map((category) => (
              <option value={category.categoryId} key={category.categoryId}>
                {category.categoryTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-center pt-4">
          <button type="submit"
            className="w-full sm:w-auto px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;