import { useState, useEffect, useRef } from "react";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { getUserById, createPost, uploadImageToCloudinary } from "../api/api";

const AddPost = () => {
  const editor = useRef(null);
  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

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

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!post.title.trim() || !post.content.trim() || !post.category) {
      toast.error("Please fill all fields");
      return;
    }

    const postId = `post_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "unknown_user";

    const newPost = {
      title: post.title,
      content: post.content,
      category: {
        categoryId: post.category,
        categoryTitle: categories.find(cat => cat.categoryId === post.category)?.categoryTitle || "Unknown",
      },
      userId: user?._id,
      user: fullName,
      timestamp,
    };

    try {
      if (image) {
        const imageUrl = await uploadImageToCloudinary(image);
        newPost.bannerUrl = imageUrl;
      }

      await createPost(newPost, token);
      toast.success("Post created successfully!");

      setPost({ title: "", content: "", category: "" });
      setImage(null);
    } catch (err) {
      console.error("Post creation failed:", err.message);
      toast.error("Failed to create post.");
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto my-8 p-4 sm:p-6 bg-white shadow-md rounded-lg flex flex-col">
      <div className="p-4 sm:p-5 border-b mb-6 flex justify-center items-center">
        <h3 className="text-lg sm:text-xl font-bold text-center text-gray-700">
          What's going on in your mind?
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
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
          <div className="block w-full">
            <JoditEditor
              ref={editor}
              value={post.content}
              onChange={contentFieldChanged}
              className="rounded-lg"
            />
          </div>
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

        <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-4 pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          >
            Create Post
          </button>
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring focus:ring-red-300"
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
