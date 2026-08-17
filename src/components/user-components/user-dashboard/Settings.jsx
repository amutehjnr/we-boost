import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { FaUser, FaLock, FaBell, FaMoon, FaSun } from "react-icons/fa";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "Moses Enyo",
    email: "moses@example.com",
    password: "",
    confirmPassword: "",
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Settings updated:", formData);
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Manage your profile, security, and preferences.
      </p>

      <form
        onSubmit={handleSubmit}
        className={`max-w-3xl mx-auto rounded-2xl shadow-md border p-8 space-y-8 ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Profile Section */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <FaUser className="text-red-600" /> Profile Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${
                  theme === "dark"
                    ? "bg-black border-gray-700 text-gray-200"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${
                  theme === "dark"
                    ? "bg-black border-gray-700 text-gray-200"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <FaLock className="text-red-600" /> Security
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">New Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${
                  theme === "dark"
                    ? "bg-black border-gray-700 text-gray-200"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${
                  theme === "dark"
                    ? "bg-black border-gray-700 text-gray-200"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <FaBell className="text-red-600" /> Notifications
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="w-5 h-5 accent-red-600"
            />
            <p>Enable notifications for new tasks and earnings updates</p>
          </div>
        </div>

        {/* Theme Section */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            {theme === "dark" ? (
              <FaMoon className="text-red-600" />
            ) : (
              <FaSun className="text-red-600" />
            )}{" "}
            Theme Preference
          </h2>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
          >
            {theme === "dark" ? (
              <>
                <FaSun /> Switch to Light Mode
              </>
            ) : (
              <>
                <FaMoon /> Switch to Dark Mode
              </>
            )}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-md font-semibold text-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition-all"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
