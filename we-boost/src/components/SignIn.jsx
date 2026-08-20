import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import API from "../lib/api";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function SignIn() {
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
      // Firebase login
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Firebase ID token
      const firebaseToken = await user.getIdToken();

      // Backend login
      const res = await API.post(
        "/auth/login",
        { email, firebaseUid: user.uid },
        { headers: { Authorization: `Bearer ${firebaseToken}` } }
      );

      localStorage.setItem("token", res.data.data.token);

      const isClient = res.data.data.user?.isClient;
      window.location.href = isClient ? "/dashboard" : "/user-dashboard";
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Access your account">
      <form className="space-y-5" onSubmit={handleSignIn}>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
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

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white ${loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-gray-500 mt-6">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-red-600 font-semibold">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}