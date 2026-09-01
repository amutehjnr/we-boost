import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { FaUser, FaLock, FaBell } from "react-icons/fa";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../../firebase";
import API from "../../../lib/api";

export default function Settings() {
  const { theme } = useTheme();

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
    notifications: true,
  });

  // Load the real profile instead of showing placeholder data
  useEffect(() => {
    API.get("/users/profile")
      .then((res) => {
        const user = res.data.data;
        setFormData((prev) => ({
          ...prev,
          fullName: user.fullName || "",
          email: user.email || "",
          notifications:
            user.notificationsEnabled !== undefined
              ? user.notificationsEnabled
              : true,
        }));
      })
      .catch((error) => {
        console.error("Failed to load settings:", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save profile info + notification preference
    setSaving(true);
    try {
      await API.put("/users/profile", {
        fullName: formData.fullName,
        notificationsEnabled: formData.notifications,
      });
      alert("Settings saved successfully.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert(error?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }

    // Password change is a separate, optional step — only run if the user
    // actually filled in the password fields.
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        alert("New password and confirmation do not match.");
        return;
      }
      if (formData.password.length < 8) {
        alert("New password must be at least 8 characters.");
        return;
      }
      if (!formData.currentPassword) {
        alert("Please enter your current password to change it.");
        return;
      }

      setChangingPassword(true);
      try {
        const currentUser = auth.currentUser;
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          formData.currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, formData.password);

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          password: "",
          confirmPassword: "",
        }));
        alert("Password updated successfully.");
      } catch (error) {
        console.error("Failed to update password:", error);
        if (error.code === "auth/wrong-password") {
          alert("Current password is incorrect.");
        } else if (error.code === "auth/requires-recent-login") {
          alert("Please sign out and sign back in, then try again.");
        } else {
          alert("Failed to update password. Please try again.");
        }
      } finally {
        setChangingPassword(false);
      }
    }
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
                disabled
                title="Email is tied to your account sign-in and can't be changed here."
                className={`w-full p-3 rounded-lg border outline-none opacity-60 cursor-not-allowed ${
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
            <div className="sm:col-span-2">
              <label className="block font-medium mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Required to change your password"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border outline-none ${
                  theme === "dark"
                    ? "bg-black border-gray-700 text-gray-200"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              />
            </div>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || changingPassword}
          className="w-full py-3 rounded-md font-semibold text-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition-all disabled:opacity-60"
        >
          {saving || changingPassword ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}