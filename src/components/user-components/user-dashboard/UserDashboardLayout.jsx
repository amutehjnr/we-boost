// src/layouts/UserDashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import Logo from "../../../images/we-boost.png";
import ModeToggle from "../../ModeToggle";
import DashboardLayout from "../../client-dashboard/DashboardLayout";
import {
  FaHome,
  FaClipboardList,
  FaWallet,
  FaLink,
  FaMoneyBillWave,
  FaUsers,
  FaCog,
  FaSun,
  FaMoon,
} from "react-icons/fa";

export default function UserDashboardLayout({ isClient, userModeToggle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // ✅ Auto redirect when mode changes
  useEffect(() => {
    if (isClient) navigate("/dashboard", { replace: true });
    else navigate("/user-dashboard", { replace: true });
  }, [isClient]);

  const menuItems = [
    { path: "/user-dashboard", label: "Home", icon: <FaHome /> },
    { path: "/user-dashboard/tasks", label: "Available Tasks", icon: <FaClipboardList /> },
    { path: "/user-dashboard/my-tasks", label: "My Tasks", icon: <FaClipboardList /> },
    { path: "/user-dashboard/earnings", label: "Earnings", icon: <FaWallet /> },
    { path: "/user-dashboard/accounts", label: "Linked Accounts", icon: <FaLink /> },
    { path: "/user-dashboard/withdraw", label: "Withdraw", icon: <FaMoneyBillWave /> },
    { path: "/user-dashboard/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isClient ? "client" : "user"}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`flex h-screen bg-gray-50 dark:bg-[#121212] transition-colors`}
      >
        {!isClient ? (
          <>
            {/* Sidebar */}
            <aside
              className={`fixed lg:static z-30 top-0 left-0 h-full w-64 bg-white dark:bg-[#181818] shadow-md border-r dark:border-gray-800 transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } lg:translate-x-0 transition-transform duration-300`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                <Link to="/">
                  <img src={Logo} alt="WeBoost-logo" className="h-8" />
                </Link>
                <button
                  className="lg:hidden text-gray-700 dark:text-gray-300 text-xl"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              </div>

              <nav className="mt-6 flex flex-col">
                {menuItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative flex items-center gap-3 px-6 py-3 transition-colors
                        ${
                          isActive
                            ? "bg-red-600 dark:bg-red-600 text-white font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
                        }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-red-600 rounded-r"></span>
                      )}
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <header className="flex items-center justify-between bg-white dark:bg-[#181818] px-6 py-3 border-b dark:border-gray-700 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-2xl text-gray-700 dark:text-gray-200"
                  >
                    ☰
                  </button>
                  <ModeToggle isClient={isClient} userModeToggle={userModeToggle} />
                </div>

                <div className="flex items-center gap-5">
                  <button onClick={toggleTheme}>
                    {theme === "dark" ? (
                      <FaSun className="text-yellow-400 text-xl" />
                    ) : (
                      <FaMoon className="text-gray-500 dark:text-gray-200 text-xl" />
                    )}
                  </button>

                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-semibold text-gray-800 dark:text-gray-100">
                      SM
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                      Shaibu Moses
                    </span>
                  </div>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
              </main>
            </div>
          </>
        ) : (
          <DashboardLayout
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            isClient={isClient}
            userModeToggle={userModeToggle}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
