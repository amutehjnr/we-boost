import React from "react";
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaSpotify } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

export default function MyTasks() {
  const { theme } = useTheme();

  const myTasks = [
    {
      id: 1,
      platform: "Instagram",
      icon: <FaInstagram className="text-pink-500 text-2xl" />,
      type: "Follow",
      reward: "₦50",
      status: "Completed",
      date: "Oct 20, 2025",
    },
    {
      id: 2,
      platform: "TikTok",
      icon: <FaTiktok className="text-black dark:text-white text-2xl" />,
      type: "Like",
      reward: "₦25",
      status: "Pending",
      date: "Oct 21, 2025",
    },
    {
      id: 3,
      platform: "YouTube",
      icon: <FaYoutube className="text-red-600 text-2xl" />,
      type: "Comment",
      reward: "₦40",
      status: "In Progress",
      date: "Oct 21, 2025",
    },
    {
      id: 4,
      platform: "Twitter (X)",
      icon: <FaTwitter className="text-sky-500 text-2xl" />,
      type: "Retweet",
      reward: "₦30",
      status: "Completed",
      date: "Oct 19, 2025",
    },
    {
      id: 5,
      platform: "Spotify",
      icon: <FaSpotify className="text-green-500 text-2xl" />,
      type: "Stream",
      reward: "₦20/min",
      status: "Completed",
      date: "Oct 18, 2025",
    },
  ];

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

  return (
    <div
      className={`transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#121212] text-gray-200"
          : "bg-gray-50 text-gray-800"
      } min-h-screen p-6 rounded-2xl`}
    >
      <h1 className="text-2xl font-bold mb-4">
        My <span className="text-red-600">Tasks</span> 📋
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Track your task history, progress, and payments in one place.
      </p>

      {/* Tasks Table */}
      <div
        className={`rounded-2xl shadow-md border overflow-x-auto ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
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
            {myTasks.map((task) => (
              <tr
                key={task.id}
                className={`border-b transition-all duration-200 ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-[#202020]"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                <td className="py-4 px-6 flex items-center gap-3 font-medium">
                  {task.icon}
                  {task.platform}
                </td>
                <td className="py-4 px-6">{task.type}</td>
                <td className="py-4 px-6 font-semibold text-red-600">
                  {task.reward}
                </td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                  {task.date}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
