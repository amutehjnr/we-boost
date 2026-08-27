import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube, FaSpotify, FaLinkedin, FaTwitch, FaTelegram, FaCheckCircle, FaLink, FaTimes } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import API from "../../../lib/api";

// Maps display info to the exact enum values the backend expects.
// oauth: true means "Connect" does a real redirect-based login instead
// of a manual prompt. Telegram is handled separately via its own widget.
const PLATFORMS = [
  { name: "Facebook", icon: <FaFacebook className="text-blue-600" />, key: "Facebook", oauth: true },
  { name: "Instagram", icon: <FaInstagram className="text-pink-500" />, key: "Instagram", oauth: true },
  { name: "TikTok", icon: <FaTiktok className="text-black dark:text-white" />, key: "TikTok", oauth: true },
  { name: "Twitter (X)", icon: <FaTwitter className="text-sky-500" />, key: "Twitter", oauth: true },
  { name: "YouTube", icon: <FaYoutube className="text-red-600" />, key: "YouTube", oauth: true },
  { name: "Spotify", icon: <FaSpotify className="text-green-500" />, key: "Spotify", oauth: true },
  { name: "LinkedIn", icon: <FaLinkedin className="text-blue-700" />, key: "LinkedIn", oauth: true },
  { name: "Twitch", icon: <FaTwitch className="text-purple-600" />, key: "Twitch", oauth: true },
  { name: "Telegram", icon: <FaTelegram className="text-sky-400" />, key: "Telegram", telegram: true },
];

export default function LinkedAccounts() {
  const { theme } = useTheme();
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [busyKey, setBusyKey] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const telegramContainerRef = useRef(null);

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

  // After an OAuth redirect back from a platform, show the result and
  // clean the URL so a refresh doesn't repeat it.
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      alert(`${connected} connected successfully!`);
      fetchLinked();
      navigate("/user-dashboard/accounts", { replace: true });
    } else if (error) {
      alert(`Failed to connect ${error}. Please try again.`);
      navigate("/user-dashboard/accounts", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLinked = (key) =>
    linkedAccounts.some((acc) => acc.platform === key && acc.isActive);

  // Load Telegram's login widget script into the placeholder div once we
  // know Telegram isn't linked yet. Telegram handles its own popup UI and
  // calls window.onTelegramAuth with the signed user data when done.
  useEffect(() => {
    if (isLinked("Telegram") || !telegramContainerRef.current) return;

    window.onTelegramAuth = async (user) => {
      setBusyKey("Telegram");
      try {
        await API.post("/platforms/oauth/telegram/verify", user);
        await fetchLinked();
      } catch (err) {
        console.error("Error verifying Telegram login:", err);
        alert(err?.response?.data?.message || "Failed to connect Telegram.");
      } finally {
        setBusyKey(null);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", process.env.REACT_APP_TELEGRAM_BOT_USERNAME || "");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    telegramContainerRef.current.innerHTML = "";
    telegramContainerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedAccounts]);

  const handleConnect = async (platform) => {
    if (platform.oauth) {
      setBusyKey(platform.key);
      try {
        const res = await API.get(`/platforms/oauth/${platform.key.toLowerCase()}/init`);
        window.location.href = res.data.authUrl;
      } catch (err) {
        console.error("Error starting OAuth connect:", err);
        alert("Failed to start connection. Please try again.");
        setBusyKey(null);
      }
      return;
    }

    const username = prompt(`Enter your ${platform.name} username to connect:`);
    if (!username) return;

    setBusyKey(platform.key);
    try {
      await API.post("/platforms/link", { platform: platform.key, username });
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
              ) : platform.telegram ? (
                <div className="mt-3" ref={telegramContainerRef} />
              ) : (
                <button
                  onClick={() => handleConnect(platform)}
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