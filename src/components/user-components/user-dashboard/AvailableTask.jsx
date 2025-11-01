import React from "react";
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

export default function Tasks() {
  const { theme } = useTheme();

  const tasks = [
    {
      id: 1,
      platform: "Instagram",
      icon: <FaInstagram className="text-pink-500 text-3xl" />,
      type: "Follow",
      reward: "₦50",
      description: "Follow this Instagram account to earn instantly.",
    },
    {
      id: 2,
      platform: "TikTok",
      icon: <FaTiktok className="text-black dark:text-white text-3xl" />,
      type: "Like",
      reward: "₦25",
      description: "Like a trending TikTok video.",
    },
    {
      id: 3,
      platform: "YouTube",
      icon: <FaYoutube className="text-red-600 text-3xl" />,
      type: "Comment",
      reward: "₦40",
      description: "Leave a positive comment on a YouTube video.",
    },
    {
      id: 4,
      platform: "Twitter (X)",
      icon: <FaTwitter className="text-sky-500 text-3xl" />,
      type: "Retweet",
      reward: "₦30",
      description: "Retweet and like a post on Twitter.",
    },
    {
      id: 5,
      platform: "Spotify",
      icon: <FaSpotify className="text-green-500 text-3xl" />,
      type: "Stream",
      reward: "₦20 / min",
      description: "Stream a new music release on Spotify for at least 1 minute.",
    },
    {
      id: 6,
      platform: "Audiomack",
      icon: <FaMusic className="text-yellow-500 text-3xl" />,
      type: "Stream",
      reward: "₦15 / min",
      description: "Stream this new track on Audiomack and earn per minute.",
    },
    {
        id: 7,
        platform: "Facebook",
        icon: <FaFacebook className="text-blue-600 text-3xl" />,
        type: "Share",
        reward: "₦30",
        description: "Share a post on Facebook to earn instantly.",
    }
  ];

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

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-6 rounded-2xl shadow-md border transition-all duration-300 hover:scale-[1.02] ${
              theme === "dark"
                ? "bg-[#181818] border-gray-700 hover:bg-[#222]"
                : "bg-white border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              {task.icon}
              <div>
                <h2 className="text-lg font-bold">{task.platform}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {task.type} Task
                </p>
              </div>
            </div>

            <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
              {task.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-600">{task.reward}</span>
              <button
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-300"
              >
                Start Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
