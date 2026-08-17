// src/components/Header.jsx
import React from "react";
import ModeToggle from "../ModeToggle";
import { FaBell, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function Header({ setSidebarOpen, sidebarOpen, isClient, userModeToggle }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 bg-white dark:bg-[#181818] border-b dark:border-gray-700 px-6 py-3 flex justify-between items-center z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          className="lg:hidden text-gray-700 dark:text-gray-200 text-2xl"
        >
          {sidebarOpen ? '✖' : '☰'}
        </button>
        <ModeToggle isClient={isClient} userModeToggle={userModeToggle} />
      </div>

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
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex justify-center items-center text-gray-800 dark:text-gray-100 font-semibold">
            SM
          </div>
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            Shaibu
          </span>
        </div>
      </div>
    </header>
  );
}
