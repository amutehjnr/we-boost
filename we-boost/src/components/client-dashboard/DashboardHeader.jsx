import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ModeToggle from "../ModeToggle";
import { FaBell, FaSun, FaMoon, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import API from "../../lib/api";

export default function Header({ setSidebarOpen, sidebarOpen, isClient, userModeToggle }) {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);

  // Load logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/profile");
        setUser(res.data.data);
      } catch (err) {
        console.error("❌ Failed to load user", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  // Generate initials (e.g. "Mustapha Sani" → "MS")
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter((n) => n.trim() !== "")
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join("");
  };

  return (
    <header className="sticky top-0 bg-white dark:bg-[#181818] border-b dark:border-gray-700 px-6 py-3 flex justify-between items-center z-20">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar (Mobile) */}
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="lg:hidden text-gray-700 dark:text-gray-200 text-2xl"
        >
          {sidebarOpen ? "✖" : "☰"}
        </button>

        <ModeToggle isClient={isClient} userModeToggle={userModeToggle} />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-5">
        <FaBell className="text-gray-600 dark:text-gray-300 text-xl cursor-pointer" />

        {theme === "dark" ? (
          <FaSun
            onClick={toggleTheme}
            className="text-yellow-400 text-xl cursor-pointer"
          />
        ) : (
          <FaMoon
            onClick={toggleTheme}
            className="text-gray-600 text-xl cursor-pointer"
          />
        )}

        {/* USER PROFILE — now links to the profile page */}
        <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
          {/* Image OR initials */}
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt="User"
              className="w-9 h-9 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                setUser((prev) => ({ ...prev, photoUrl: null }));
              }}
            />
          ) : (
            <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex justify-center items-center text-gray-800 dark:text-gray-100 font-semibold">
              {getInitials(user?.fullName)}
            </div>
          )}

          <span className="text-gray-700 dark:text-gray-300 text-sm">
            {user?.fullName || "User"}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          title="Log out"
          className="text-gray-600 dark:text-gray-300 hover:text-red-600 text-xl"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}