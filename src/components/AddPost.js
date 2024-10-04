import { useState, useEffect, useRef } from "react";
import { loadAllCategories } from "../services/category-service";
import JoditEditor from "jodit-react";
import { createPost as doCreatePost, uploadPostImage } from "../services/post-service";
import { getCurrentUserDetail } from "../auth";
import { toast } from "react-toastify";

const AddPost = () => {
  const editor = useRef(null);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(undefined);
  const [post, setPost] = useState({
    title: "",
    content: "",
    categoryId: "",
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    setUser(getCurrentUserDetail());
    loadAllCategories()
      .then((data) => {
        console.log(data);
        setCategories(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const fieldChanged = (event) => {
    setPost({ ...post, [event.target.name]: event.target.value });
  };

  const contentFieldChanaged = (data) => {
    setPost({ ...post, content: data });
  };

  const createPost = (event) => {
    event.preventDefault();
    if (post.title.trim() === "") {
      toast.error("Post title is required !!");
      return;
    }

    if (post.content.trim() === "") {
      toast.error("Post content is required !!");
      return;
    }

    if (post.categoryId === "") {
      toast.error("Select some category !!");
      return;
    }

    post["userId"] = user.id;
    doCreatePost(post)
      .then((data) => {
        uploadPostImage(image, data.postId)
          .then((data) => {
            toast.success("Image Uploaded !!");
          })
          .catch((error) => {
            toast.error("Error in uploading image");
            console.log(error);
          });

        toast.success("Post Created !!");
        setPost({
          title: "",
          content: "",
          categoryId: "",
        });
      })
      .catch((error) => {
        toast.error("Post not created due to some error !!");
      });
  };

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-white shadow-md rounded-lg">
      <div className="p-5 border-b mb-4">
        <h3 className="text-xl font-bold text-gray-700">What’s going on in your mind?</h3>
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
            onChange={contentFieldChanaged}
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
            name="categoryId"
            onChange={fieldChanged}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          >
            {/*  <option disabled value={0}>
              -- Select category --
            </option> */ }

            <option>React</option>
            <option>Node</option>
            <option>Express</option>
            <option>JavaScript</option>
              
            {categories.map((category) => (
              <option value={category.categoryId} key={category.categoryId}>
                {category.categoryTitle}
              </option>
            ))}
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
                categoryId: "",
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
