import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaYoutube,
  FaSpotify,
  FaLinkedin,
  FaTwitch,
  FaTelegram,
  FaCheckCircle,
  FaLink,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import API from "../../../lib/api";

// oauth: true → redirect login. No oauth → username popup.
// Telegram uses its own widget.
const PLATFORMS = [
  { name: "Facebook", icon: <FaFacebook className="text-blue-600" />, key: "Facebook" },
  { name: "Instagram", icon: <FaInstagram className="text-pink-500" />, key: "Instagram" },
  { name: "TikTok", icon: <FaTiktok className="text-black dark:text-white" />, key: "TikTok" },
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [modalError, setModalError] = useState("");

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
    script.setAttribute(
      "data-telegram-login",
      process.env.REACT_APP_TELEGRAM_BOT_USERNAME || ""
    );
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

  const openUsernameModal = (platform) => {
    setModalPlatform(platform);
    setUsernameInput("");
    setModalError("");
    setModalOpen(true);
  };

  const closeUsernameModal = () => {
    if (busyKey) return;
    setModalOpen(false);
    setModalPlatform(null);
    setUsernameInput("");
    setModalError("");
  };

  const handleConnect = async (platform) => {
    if (platform.oauth) {
      setBusyKey(platform.key);
      try {
        const res = await API.get(
          `/platforms/oauth/${platform.key.toLowerCase()}/init`
        );
        const authUrl = res?.data?.authUrl;
        if (!authUrl) {
          throw new Error(res?.data?.message || "No authorization URL returned");
        }
        window.location.href = authUrl;
      } catch (err) {
        console.error("Error starting OAuth connect:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to start connection. Please try again.";
        alert(msg);
        setBusyKey(null);
      }
      return;
    }

    openUsernameModal(platform);
  };

  const submitUsernameLink = async (e) => {
    e?.preventDefault?.();
    if (!modalPlatform) return;

    const username = usernameInput.trim();
    if (!username) {
      setModalError("Please enter your username.");
      return;
    }
    if (username.length < 2) {
      setModalError("Username is too short.");
      return;
    }
    if (username.length > 100) {
      setModalError("Username is too long.");
      return;
    }

    setModalError("");
    setBusyKey(modalPlatform.key);
    try {
      await API.post("/platforms/link", {
        platform: modalPlatform.key,
        username,
      });
      await fetchLinked();
      setModalOpen(false);
      setModalPlatform(null);
      setUsernameInput("");
      setModalError("");
    } catch (err) {
      console.error("Error linking account:", err);
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.message;
      let msg = apiMsg || "Failed to link account. Please try again.";
      if (!apiMsg) {
        if (status === 401) msg = "Session expired. Please log in again.";
        else if (status === 409) msg = "This account is already linked.";
        else if (status === 400)
          msg = "Invalid username. Please check and try again.";
        else if (!err?.response)
          msg = "Network error. Check your connection and try again.";
      }
      setModalError(msg);
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
        Connect your social or streaming accounts to receive matching tasks and
        boost your earnings.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => {
          const connected = isLinked(platform.key);
          const busy = busyKey === platform.key;
          return (
            <div
              key={platform.key}
              className={`p-6 rounded-2xl border shadow-md flex flex-col items-center justify-between text-center transition-all duration-300 ${
                theme === "dark"
                  ? "bg-[#181818] border-gray-700"
                  : "bg-white border-gray-200"
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

      {/* Username connect popup (manual platforms) */}
      {modalOpen && modalPlatform && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={closeUsernameModal}
        >
          <div
            className={`w-full max-w-md rounded-2xl border shadow-xl p-6 ${
              theme === "dark"
                ? "bg-[#181818] border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{modalPlatform.icon}</div>
              <div>
                <h3 className="text-lg font-bold">
                  Connect {modalPlatform.name}
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Enter your {modalPlatform.name} username
                </p>
              </div>
            </div>

            <form onSubmit={submitUsernameLink} className="space-y-4 relative">
              {busyKey === modalPlatform.key && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/40 backdrop-blur-[1px]">
                  <FaSpinner className="text-3xl text-red-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-white">
                    Connecting...
                  </span>
                </div>
              )}

              {modalError && (
                <div
                  className={`text-sm p-3 rounded-lg border ${
                    theme === "dark"
                      ? "bg-red-900/30 text-red-300 border-red-800"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (modalError) setModalError("");
                  }}
                  placeholder={`e.g. your_${modalPlatform.key.toLowerCase()}_username`}
                  autoFocus
                  disabled={busyKey === modalPlatform.key}
                  className={`w-full p-3 rounded-lg border outline-none disabled:opacity-60 ${
                    modalError
                      ? "border-red-500 bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200"
                      : theme === "dark"
                      ? "bg-black border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeUsernameModal}
                  disabled={!!busyKey}
                  className={`flex-1 py-2.5 rounded-lg font-medium border transition disabled:opacity-60 ${
                    theme === "dark"
                      ? "border-gray-600 hover:bg-gray-800"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!busyKey || !usernameInput.trim()}
                  className="flex-1 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {busyKey === modalPlatform.key ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}