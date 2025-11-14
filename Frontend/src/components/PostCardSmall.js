import React from "react";
import { Link } from "react-router-dom";
import userIcon from "../img/user.png";

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, ""); // remove all HTML tags
};

const PostCardSmall = ({ post }) => {
  const plainText = stripHtml(post.content);

  const excerpt =
    post.excerpt ||
    (plainText.length > 150 ? plainText.slice(0, 150) + "..." : plainText);

  return (
    <div className="bg-white rounded-lg shadow p-4 flex gap-4">
      <div className="flex-1">
        <Link to={`/post/${post._id || post.id}`} className="text-lg font-semibold hover:text-sky-600">
          {post.title}
        </Link>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {excerpt}
        </p>

        <div className="mt-3 text-xs text-gray-500">
          <Link to={`/user/${post.userId}`} className="hover:text-sky-600">
            {post.user}
          </Link>
          · {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      {post.bannerUrl && (
        <img
          src={post.bannerUrl}
          alt={post.title}
          className="w-28 h-20 object-cover rounded"
        />
      )}
    </div>
  );
};

export default PostCardSmall;
