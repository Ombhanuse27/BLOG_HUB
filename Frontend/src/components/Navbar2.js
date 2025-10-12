import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconHexagonLetterB,
  IconLayoutDashboard,
  IconUserCircle,
  IconCategory,
  IconLogout,
} from "@tabler/icons-react";
import defaultUserPhoto from "../img/loki2.jpg"; // Your default user image
import Profile from "./profile";
import customLogo from "../img/logo.png"; // Example: your main logo
import homeIcon from "../img/home_icon.png";
import profileIcon from "../img/profile_icon.png";
import categoryIcon from "../img/categories_icon.png";
import logoutIcon from "../img/log-out.png";



export function Navbar2() {
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

  const links = [
    {
      label: "Home",
      href: "/homepage",
      icon: <img src={homeIcon} alt="Home" className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <img src={profileIcon} alt="Home" className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Categories",
      href: "/categorypage",
      icon: <img src={categoryIcon} alt="Home" className="h-5 w-5 flex-shrink-0" />,
    },
  ];

  const handleLogout = () => {
    localStorage.clear(); // Clears all user data
    navigate("/signin");
  };

  return (
    <div className="flex flex-row w-screen h-screen bg-zinc-100 dark:bg-zinc-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between">
          {/* Top Section: Logo & Links */}
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
                  icon: <IconLogout className="h-5 w-5 flex-shrink-0" />,
                }}
                open={open}
              />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content Area: Renders the current page */}
      <main className="flex-1 overflow-y-auto">
        <Profile/>{/* Child routes (HomePage, Profile, etc.) are rendered here */}
      </main>
    </div>
  );
}

const Logo = ({ open }) => (
  <NavLink
    to="/homepage"
    className="font-normal flex space-x-3 items-center text-sm py-1 relative z-20"
  >
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

const UserProfile = ({ user, open }) => (
  <div className="flex items-center gap-3 px-3 py-2">
    <img
      src={user.photo}
      className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
      alt="User Avatar"
    />
    <span
      className={`text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
    >
      {user.name}
    </span>
  </div>
);