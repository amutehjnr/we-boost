// src/components/user-components/user-dashboard/MyTasks.jsx
import React, { useEffect, useState } from "react";
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaSpotify, FaFacebook, FaMusic } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import API from "../../../lib/api";

export default function MyTasks() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Map platform name to icon
  const platformIcons = {
    Instagram: <FaInstagram className="text-pink-500 text-2xl" />,
    TikTok: <FaTiktok className="text-black dark:text-white text-2xl" />,
    YouTube: <FaYoutube className="text-red-600 text-2xl" />,
    "Twitter (X)": <FaTwitter className="text-sky-500 text-2xl" />,
    Spotify: <FaSpotify className="text-green-500 text-2xl" />,
    Facebook: <FaFacebook className="text-blue-600 text-2xl" />,
    Audiomack: <FaMusic className="text-yellow-500 text-2xl" />,
  };

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "Pending":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
      case "In Progress":
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks/my-tasks?limit=10"); // adjust limit as needed
      setTasks(res.data.tasks || []); // backend should return { tasks: [...] }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div
      className={`transition-colors duration-300 ${
        theme === "dark" ? "bg-[#121212] text-gray-200" : "bg-gray-50 text-gray-800"
      } min-h-screen p-6 rounded-2xl`}
    >
      <h1 className="text-2xl font-bold mb-4">
        My <span className="text-red-600">Tasks</span> 📋
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Track your task history, progress, and payments in one place.
      </p>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading tasks...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No tasks found.</p>
      ) : (
        <div
          className={`rounded-2xl shadow-md border overflow-x-auto ${
            theme === "dark" ? "bg-[#181818] border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <table className="w-full text-sm md:text-base text-left">
            <thead
              className={`text-gray-600 dark:text-gray-400 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <tr>
                <th className="py-4 px-6">Platform</th>
                <th className="py-4 px-6">Task Type</th>
                <th className="py-4 px-6">Reward</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={`border-b transition-all duration-200 ${
                    theme === "dark" ? "border-gray-700 hover:bg-[#202020]" : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="py-4 px-6 flex items-center gap-3 font-medium">
                    {platformIcons[task.platform] || <span className="text-gray-400">?</span>}
                    {task.platform}
                  </td>
                  <td className="py-4 px-6">{task.type}</td>
                  <td className="py-4 px-6 font-semibold text-red-600">{task.reward}</td>
                  <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                    {new Date(task.createdAt || task.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(task.status)}`}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
