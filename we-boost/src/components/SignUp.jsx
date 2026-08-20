// src/pages/Signup.jsx
import React, { useState } from "react";
import { FaEnvelope, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import API from "../lib/api";

import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("client"); // "client" orders services, "user" completes tasks and earns
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirm = () => setShowConfirm(!showConfirm);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Create Firebase user
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // 2️⃣ Get Firebase ID token
      const firebaseToken = await user.getIdToken();
      const firebaseUid = user.uid;

      // 3️⃣ Register user in backend
      const res = await API.post(
        "/auth/register",
        { fullName, email, firebaseUid, isClient: accountType === "client" },
        { headers: { Authorization: `Bearer ${firebaseToken}` } }
      );

      // 4️⃣ Save backend token
      localStorage.setItem("token", res.data.data.token);

      window.location.href = accountType === "client" ? "/dashboard" : "/user-dashboard";
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Your Account" subtitle="Sign up to get started">
      <form className="space-y-5" onSubmit={handleSignup}>
        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-600">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType("client")}
              className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-colors ${
                accountType === "client"
                  ? "bg-red-600 border-red-600 text-white"
                  : "border-gray-300 text-gray-600 hover:border-red-400"
              }`}
            >
              Order services (Client)
            </button>
            <button
              type="button"
              onClick={() => setAccountType("user")}
              className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-colors ${
                accountType === "user"
                  ? "bg-red-600 border-red-600 text-white"
                  : "border-gray-300 text-gray-600 hover:border-red-400"
              }`}
            >
              Complete tasks & earn
            </button>
          </div>
        </div>

        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <button type="button" onClick={togglePassword} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <button type="button" onClick={toggleConfirm} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className={`w-full ${loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"} text-white font-semibold py-2 rounded-lg`}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{" "}
        <Link to="/signin" className="text-red-600 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}