import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// --- 1. IMPORT YOUR CUSTOM ICONS HERE ---
import customLogo from "../img/logo.png"; // Example: your main logo
import homeIcon from "../img/home_icon.png";
import profileIcon from "../img/profile_icon.png";
import categoryIcon from "../img/categories_icon.png";
import logoutIcon from "../img/log-out.png";
import defaultUserPhoto from "../img/loki2.jpg"; // Default user image
import HomePage from "./HomePage";

/**
 * MainLayout Component
 * This component serves as the main wrapper for pages that need the sidebar.
 * It manages the sidebar's state (open/closed) and renders the current page content via <Outlet />.
 */
export function MainLayout() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({ name: "User", photo: defaultUserPhoto });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name || "User",
          photo: parsedUser.photo || defaultUserPhoto,
        });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  // --- 2. UPDATE THE LINKS ARRAY WITH YOUR ICONS ---
  const links = [
    {
      label: "Home",
      href: "/homepage",
      icon: <img src={homeIcon} alt="Home" className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <img src={profileIcon} alt="Profile" className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Categories",
      href: "/categorypage",
      icon: <img src={categoryIcon} alt="Categories" className="h-5 w-5 flex-shrink-0" />,
    },
    {
    label: "Chat Requests",
    href: "/chat",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 9h7.5m-7.5 3.75h4.5M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4.83-1.21L3 20.25l1.46-4.38A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  return (
    <div className="flex flex-row w-screen h-screen bg-zinc-100 dark:bg-zinc-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between">
          {/* Top Section: Logo & Main Navigation Links */}
          <div className="flex flex-col flex-1">
            <Logo open={open} />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <NavLink to={link.href} key={idx} className="block">
                  {({ isActive }) => (
                    <SidebarLink
                      isActive={isActive}
                      link={{ label: link.label, icon: link.icon }}
                      open={open}
                    />
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Bottom Section: User Profile & Logout */}
          <div>
            <hr className="my-4 border-zinc-200 dark:border-zinc-700" />
            <UserProfile user={user} open={open} />
            <div onClick={handleLogout} className="cursor-pointer">
              <SidebarLink
                link={{
                  label: "Logout",
                  // --- 3. UPDATE THE LOGOUT ICON ---
                  icon: <img src={logoutIcon} alt="Logout" className="h-5 w-5 flex-shrink-0" />,
                }}
                open={open}
              />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content Area: Renders the active page */}
      <main className="flex-1 overflow-y-auto">
        <HomePage/>
      </main>
    </div>
  );
}

// Logo component updated to use a custom image
export const Logo = ({ open }) => {
  return (
    <NavLink
      to="/homepage"
      className="font-normal flex space-x-3 items-center text-sm py-1 relative z-20"
    >
      {/* --- 4. UPDATE THE LOGO ICON --- */}
      <img src={customLogo} alt="LetsBlog Logo" className="h-8 w-8 flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: open ? 1 : 0, x: open ? 0 : -10 }}
        transition={{ duration: 0.3 }}
        className="font-bold text-lg text-black dark:text-white whitespace-nowrap"
      >
        LetsBlog
      </motion.span>
    </NavLink>
  );
};

// User Profile component (no changes needed here, it already uses an image)
const UserProfile = ({ user, open }) => (
  <div className="flex items-center gap-3 px-3 py-2">
    <img
      src={user.photo}
      className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
      alt="User Avatar"
    />
    <span
      className={`
        text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate
        transition-opacity duration-300
        ${open ? "opacity-100" : "opacity-0"}
      `}
    >
      {user.name}
    </span>
  </div>
);