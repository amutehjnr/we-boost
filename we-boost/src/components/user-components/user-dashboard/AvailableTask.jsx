// src/pages/userDashboard/AvailableTask.jsx
import React, { useEffect, useState } from "react";
import API from "../../../lib/api";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaTwitter,
  FaYoutube,
  FaSpotify,
  FaMusic,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const platformIcons = {
  Instagram: <FaInstagram className="text-pink-500 text-3xl" />,
  TikTok: <FaTiktok className="text-black dark:text-white text-3xl" />,
  YouTube: <FaYoutube className="text-red-600 text-3xl" />,
  "Twitter (X)": <FaTwitter className="text-sky-500 text-3xl" />,
  Spotify: <FaSpotify className="text-green-500 text-3xl" />,
  Audiomack: <FaMusic className="text-yellow-500 text-3xl" />,
  Facebook: <FaFacebook className="text-blue-600 text-3xl" />,
};

export default function AvailableTask() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks/my-tasks?limit=10");

        setTasks(res.data.tasks || res.data.data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load tasks. Try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-6">
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 mt-6">
        {error}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-6">
        No tasks available.
      </div>
    );
  }

  return (
    <div
      className={`transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#121212] text-gray-200"
          : "bg-gray-50 text-gray-800"
      } min-h-screen p-6 rounded-2xl`}
    >
      <h1 className="text-2xl font-bold mb-4">
        Available <span className="text-red-600">Tasks</span> 🎯
      </h1>

      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Choose a task below, complete it, and get paid instantly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id || task._id}
            className={`p-6 rounded-2xl shadow-md border transition-all duration-300 hover:scale-[1.02] ${
              theme === "dark"
                ? "bg-[#181818] border-gray-700 hover:bg-[#222]"
                : "bg-white border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              {platformIcons[task.platform] || (
                <span className="text-3xl">🎯</span>
              )}

              <div>
                <h2 className="text-lg font-bold">
                  {task.platform}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {task.type} Task
                </p>
              </div>
            </div>

            <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
              {task.description ||
                "Complete this task to earn rewards."}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-600">
                {task.reward
                  ? `₦${Number(task.reward).toLocaleString()}`
                  : "₦0"}
              </span>

              <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-300">
                Start Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}