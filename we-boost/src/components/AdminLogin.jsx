import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield } from "react-icons/fa";
import AuthLayout from "./AuthLayout.jsx";
import API from "../lib/api";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { friendlyAuthError } from "../lib/firebaseErrorMessage";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const firebaseToken = await user.getIdToken();

      const res = await API.post(
        "/auth/login",
        { email, firebaseUid: user.uid },
        { headers: { Authorization: `Bearer ${firebaseToken}` } }
      );

      const loggedInUser = res.data.data.user;

      if (loggedInUser?.role !== "admin") {
        // Not an admin — don't leave them signed in via this page
        await signOut(auth);
        localStorage.removeItem("token");
        setError("This account doesn't have admin access.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.data.token);
      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || friendlyAuthError(err));
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Login" subtitle="Restricted access — authorized staff only">
      <div className="flex justify-center mb-4 text-red-600 text-3xl">
        <FaUserShield />
      </div>
      <form className="space-y-5" onSubmit={handleSignIn}>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Admin Email"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white ${loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </AuthLayout>
  );
}