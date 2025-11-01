// src/pages/SignIn.jsx
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";

export default function SignIn({ email, setEmail, password, setPassword, error, handleSignIn, loading }) {
  const [showPassword, setShowPassword] = useState(false);    // State to toggle password visibility
  
  const togglePassword = () => setShowPassword(!showPassword);    // Function to toggle password visibility

  return (
    <AuthLayout
      title="Boost Your Social Media Growth"
      subtitle="Sign in to manage your campaigns, analyze engagement, and connect your accounts effortlessly."
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Welcome Back 👋
      </h2>
      <p className="text-gray-500 text-center mb-6 text-sm">
        Login to your WeBoost account
      </p>

      <form className="space-y-5" onSubmit={handleSignIn}>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email address"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
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
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-red-600" /> Remember me
          </label>
          <a href="#" className="text-red-600 hover:underline">
            Forgot password?
          </a>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className={`w-full ${loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"} text-white font-semibold py-2 rounded-lg transition duration-300`}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="text-red-600 font-semibold hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}
