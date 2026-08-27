import React, { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube, FaSpotify, FaCheckCircle, FaLink, FaTimes } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import API from "../../../lib/api";

// Maps display info to the exact enum values the backend expects
const PLATFORMS = [
  { name: "Facebook", icon: <FaFacebook className="text-blue-600" />, key: "Facebook" },
  { name: "Instagram", icon: <FaInstagram className="text-pink-500" />, key: "Instagram" },
  { name: "TikTok", icon: <FaTiktok className="text-black dark:text-white" />, key: "TikTok" },
  { name: "Twitter (X)", icon: <FaTwitter className="text-sky-500" />, key: "Twitter" },
  { name: "YouTube", icon: <FaYoutube className="text-red-600" />, key: "YouTube" },
  { name: "Spotify", icon: <FaSpotify className="text-green-500" />, key: "Spotify" },
];

export default function LinkedAccounts() {
  const { theme } = useTheme();
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [busyKey, setBusyKey] = useState(null);

  const fetchLinked = async () => {
    try {
      const res = await API.get("/platforms/linked");
      setLinkedAccounts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching linked accounts:", err);
      setLinkedAccounts([]);
    }
  };

  useEffect(() => {
    fetchLinked();
  }, []);

  const isLinked = (key) =>
    linkedAccounts.some((acc) => acc.platform === key && acc.isActive);

  const handleConnect = async (platformKey) => {
    const username = prompt(`Enter your ${platformKey} username to connect:`);
    if (!username) return;

    setBusyKey(platformKey);
    try {
      await API.post("/platforms/link", { platform: platformKey, username });
      await fetchLinked();
    } catch (err) {
      console.error("Error linking account:", err);
      alert(err?.response?.data?.message || "Failed to link account.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleUnlink = async (platformKey) => {
    setBusyKey(platformKey);
    try {
      await API.delete(`/platforms/unlink/${platformKey}`);
      await fetchLinked();
    } catch (err) {
      console.error("Error unlinking account:", err);
      alert(err?.response?.data?.message || "Failed to unlink account.");
    } finally {
      setBusyKey(null);
    }
  };

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
        {PLATFORMS.map((platform) => {
          const connected = isLinked(platform.key);
          const busy = busyKey === platform.key;
          return (
            <div
              key={platform.key}
              className={`p-6 rounded-2xl border shadow-md flex flex-col items-center justify-between text-center transition-all duration-300 ${
                theme === "dark" ? "bg-[#181818] border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="text-5xl mb-4">{platform.icon}</div>
              <h2 className="text-lg font-semibold mb-2">{platform.name}</h2>

              {connected ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-green-500 font-semibold">
                    <FaCheckCircle /> <span>Connected</span>
                  </div>
                  <button
                    onClick={() => handleUnlink(platform.key)}
                    disabled={busy}
                    className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 disabled:opacity-60"
                  >
                    <FaTimes /> {busy ? "Removing..." : "Unlink"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform.key)}
                  disabled={busy}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-60"
                >
                  <FaLink /> {busy ? "Connecting..." : "Connect"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}