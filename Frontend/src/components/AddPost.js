import { useState, useEffect, useRef } from "react";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { getUserById, createPost, uploadImageToCloudinary } from "../api/api";
import { IconWriting, IconFileText, IconPhoto, IconCategory, IconX, IconUpload } from "@tabler/icons-react"; // Assuming you have tabler-icons installed

const AddPost = () => {
  const editor = useRef(null);
  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // For image preview
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUserId = localStorage.getItem("userId");
        if (!storedToken || !storedUserId) throw new Error("Not authenticated");

        setToken(storedToken);
        const res = await getUserById(storedUserId, storedToken);
        setUser(res.data);

        const followedCategories = (res.data.followedTopics || []).map((topic, index) => ({
          categoryId: `followed-${index}`,
          categoryTitle: topic,
        }));
        setCategories(followedCategories);
      } catch (err) {
        console.error("User fetch error:", err.message);
        toast.error("Failed to load user data.");
      }
    };
    fetchUser();
  }, []);

  const fieldChanged = (event) => {
    setPost({ ...post, [event.target.name]: event.target.value });
  };

  const contentFieldChanged = (data) => {
    setPost({ ...post, content: data });
  };

  // ✨ Updated to handle image preview
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✨ Function to clear the image
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!post.title.trim() || !post.content.trim() || !post.category) {
      toast.error("Title, content, and category are required.");
      return;
    }

    setIsSubmitting(true); // Start loading

    const selectedCategoryObject = categories.find(cat => cat.categoryId === post.category);

    // Create the final category object for the post
    // This now perfectly matches your Mongoose schema
    const finalCategory = {
      categoryId: selectedCategoryObject?.categoryId || "general",
      categoryTitle: selectedCategoryObject?.categoryTitle || "General"
    };

    const fullName = user?.name?.trim() || "Unknown User";
    
    const newPost = {
      title: post.title,
      content: post.content,
      category: finalCategory, // ✅ Use the full category object
      userId: user?._id,
      user: fullName,
      timestamp: new Date().toISOString(),
    };
    try {
      if (image) {
        const imageUrl = await uploadImageToCloudinary(image);
        newPost.bannerUrl = imageUrl;
      }

      await createPost(newPost, token);
      toast.success("Post created successfully!");

      // Reset form state
      setPost({ title: "", content: "", category: "" });
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Post creation failed:", err.message);
      toast.error("Failed to create post.");
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };
  
  const handleReset = () => {
    setPost({ title: "", content: "", category: "" });
    removeImage();
    editor.current.value = "";
    toast.info("Form has been reset.");
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white shadow-2xl rounded-2xl">
        {/* ✨ Modern Header */}
        <div className="text-center border-b border-gray-200 pb-6 mb-8">
            <IconWriting className="mx-auto h-12 w-12 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Create a New Post</h1>
            <p className="text-gray-500 mt-2">Share your thoughts with the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Post Title
            </label>
            <div className="relative">
                <IconFileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text" id="title" placeholder="e.g., My Journey with React" name="title"
                    value={post.title} onChange={fieldChanged}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
            </div>
          </div>

          {/* Jodit Editor */}
          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
              Post Content
            </label>
            <div className="rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                <JoditEditor ref={editor} value={post.content} onChange={contentFieldChanged} />
            </div>
          </div>

          {/* ✨ New Image Upload & Preview Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Banner
            </label>
            {imagePreview ? (
              <div className="relative group">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg shadow-md" />
                <button type="button" onClick={removeImage} className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition">
                  <IconX size={20} />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="image" name="image" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Category Select */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Post Category
            </label>
            <div className="relative">
                <IconCategory className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select id="category" name="category" value={post.category} onChange={fieldChanged}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none">
                    <option disabled value=""> -- Select a category -- </option>
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                        <option value={cat.categoryId} key={cat.categoryId}> {cat.categoryTitle} </option>
                        ))
                    ) : ( <option disabled>Follow topics to see categories</option> )}
                </select>
            </div>
          </div>

          {/* ✨ Modern Buttons with Loading State */}
          <div className="flex flex-col sm:flex-row-reverse gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex justify-center items-center px-8 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                "Create Post"
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPost;