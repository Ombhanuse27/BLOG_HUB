import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { getUserById, fetchPostById, updatePostById, uploadImageToCloudinary } from "../api/api";
import { IconWriting, IconFileText, IconCategory, IconX, IconUpload } from "@tabler/icons-react"; // Import icons

const EditPost = () => {
  const editor = useRef(null);
  const { postId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "",
    bannerUrl: null, // Store the existing banner URL
  });
  
  const [image, setImage] = useState(null); // For the new file to upload
  const [imagePreview, setImagePreview] = useState(null); // For the new file's preview
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  
  const [isLoadingPage, setIsLoadingPage] = useState(true); // For initial data fetch
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission

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
          categoryId: `followed-${index}`,
          categoryTitle: topic,
        }));
        setCategories(followedCategories);

        // Fetch the existing post data
        const postData = await fetchPostById(postId);
        
        // Authorization check
        if (postData.userId !== storedUserId) {
          toast.error("You are not authorized to edit this post.");
          navigate(`/post/${postId}`);
          return;
        }

        // Pre-fill the form state
        setPost({
          title: postData.title,
          content: postData.content,
          category: postData.category.categoryId, // Set the ID for the <select>
          bannerUrl: postData.bannerUrl || null, // Set the existing banner
        });
        
        // Ensure Jodit editor gets populated if it's already rendered
        if (editor.current) {
            editor.current.value = postData.content;
        }

      } catch (err) {
        console.error("Fetch error:", err.message);
        toast.error("Failed to load post data for editing.");
        navigate("/");
      } finally {
        setIsLoadingPage(false);
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

  // Handles NEW file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file); // Set the new file
      setImagePreview(URL.createObjectURL(file)); // Set the new preview
    }
  };

  // Removes the NEWLY selected image preview
  const removeNewImagePreview = () => {
    setImage(null);
    setImagePreview(null);
  };
  
  // Removes the EXISTING banner URL from the post state
  const removeExistingBanner = () => {
    setPost({ ...post, bannerUrl: null });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!post.title.trim() || !post.content.trim() || !post.category) {
      toast.error("Title, content, and category are required.");
      return;
    }

    setIsSubmitting(true);

    // Find the full category object based on the selected ID
    const selectedCategoryObject = categories.find(cat => cat.categoryId === post.category);
    const finalCategory = {
      categoryId: selectedCategoryObject?.categoryId || "general",
      categoryTitle: selectedCategoryObject?.categoryTitle || "General"
    };

    const updatedPostData = {
      title: post.title,
      content: post.content,
      category: finalCategory, // ✅ Send the full category object
      userId: user?._id,
      user: user?.name?.trim() || "Unknown User",
    };

    try {
      let finalBannerUrl = post.bannerUrl; // Start with the existing URL

      if (image) {
        // Case 1: A new image was uploaded
        toast.info("Uploading new banner image...");
        finalBannerUrl = await uploadImageToCloudinary(image);
      }
      // Case 2: Existing image was removed (post.bannerUrl is null)
      // Case 3: No change (post.bannerUrl is the original URL)
      // Both are handled by 'finalBannerUrl'

      updatedPostData.bannerUrl = finalBannerUrl;

      await updatePostById(postId, updatedPostData, token);
      toast.success("Post updated successfully!");
      navigate(`/post/${postId}`); // Navigate back to the post detail page
    } catch (err) {
      console.error("Post update failed:", err.message);
      toast.error("Failed to update post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a loading spinner while fetching data
  if (isLoadingPage) {
    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white shadow-2xl rounded-2xl">
        {/* Modern Header */}
        <div className="text-center border-b border-gray-200 pb-6 mb-8">
            <IconWriting className="mx-auto h-12 w-12 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Edit Your Post</h1>
            <p className="text-gray-500 mt-2">Make your changes and save.</p>
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

          {/* New Image Upload & Preview Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Banner
            </label>
            
            {imagePreview ? (
              // 1. Show NEW image preview
              <div className="relative group">
                <img src={imagePreview} alt="New Preview" className="w-full h-64 object-cover rounded-lg shadow-md" />
                <button typeType="button" onClick={removeNewImagePreview} className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition">
                  <IconX size={20} />
                </button>
              </div>
            ) : post.bannerUrl ? (
              // 2. Show EXISTING image
              <div className="relative group">
                <img src={post.bannerUrl} alt="Current Banner" className="w-full h-64 object-cover rounded-lg shadow-md" />
                <button type="button" onClick={removeExistingBanner} className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition">
                  <IconX size={20} />
                </button>
              </div>
            ) : (
              // 3. Show UPLOAD box
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
                    {categories.map((cat) => (
                      <option value={cat.categoryId} key={cat.categoryId}>
                        {cat.categoryTitle}
                      </option>
                    ))}
                </select>
            </div>
          </div>

          {/* Modern Buttons with Loading State */}
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/post/${postId}`)} // Cancel button
              className="w-full sm:w-auto px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;