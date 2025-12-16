import { Link } from "react-router-dom";

export function Navbar3() {
  return (
    <div className="h-20 px-8 flex items-center justify-between bg-white shadow-md">
      {/* Logo */}
      <h2 className="text-black text-3xl font-extrabold tracking-wide">
        BLOG<span className="text-blue-600">_Verse</span>
      </h2>

      {/* Links */}
      <div className="flex items-center gap-6">
        <h4 className="text-gray-700 text-lg font-medium hover:text-blue-600 transition-colors cursor-pointer">
          
        </h4>

        <Link to="/signin">
          <button className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-700 transition-all">
            Sign In
          </button>
        </Link>
      </div>
    </div>
  );
}
