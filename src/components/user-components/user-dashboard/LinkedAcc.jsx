import React, { useState } from "react";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube, FaSpotify, FaCheckCircle, FaLink } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

export default function LinkedAccounts() {
  const { theme } = useTheme();

  const [linked, setLinked] = useState({
    facebook: false,
    instagram: true,
    tiktok: false,
    twitter: true,
    youtube: false,
    spotify: false,
  });

  const toggleLink = (platform) => {
    setLinked((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const platforms = [
    { name: "Facebook", icon: <FaFacebook className="text-blue-600" />, key: "facebook" },
    { name: "Instagram", icon: <FaInstagram className="text-pink-500" />, key: "instagram" },
    { name: "TikTok", icon: <FaTiktok className="text-black dark:text-white" />, key: "tiktok" },
    { name: "Twitter (X)", icon: <FaTwitter className="text-sky-500" />, key: "twitter" },
    { name: "YouTube", icon: <FaYoutube className="text-red-600" />, key: "youtube" },
    { name: "Spotify", icon: <FaSpotify className="text-green-500" />, key: "spotify" },
  ];

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Linked Accounts</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Connect your social or streaming accounts to receive matching tasks and boost your earnings.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <div
            key={platform.key}
            className={`p-6 rounded-2xl border shadow-md flex flex-col items-center justify-between text-center transition-all duration-300 ${
              theme === "dark" ? "bg-[#181818] border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="text-5xl mb-4">{platform.icon}</div>
            <h2 className="text-lg font-semibold mb-2">{platform.name}</h2>

            {linked[platform.key] ? (
              <div className="flex items-center gap-2 text-green-500 font-semibold">
                <FaCheckCircle /> <span>Connected</span>
              </div>
            ) : (
              <button
                onClick={() => toggleLink(platform.key)}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaLink /> Connect
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
