// src/pages/SignUp.jsx
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Firebase function to create a user
import { auth } from "../firebaseConfig"; // Adjust the import path as necessary
import AuthLayout from "../components/AuthLayout";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    //Basic validation
    if (password.length < 8) {  
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🧠 Optionally set display name in Firebase user profile
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      // ✅ Redirect after successful sign up
      navigate("/dashboard");
    } catch (error) {
      // 🧾 Handle Firebase Auth errors gracefully
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Try signing in instead.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <AuthLayout
      title="Join the WeBoost Community"
      subtitle="Create an account and unlock access to tools that grow your social media faster."
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Create Account 🚀
      </h2>
      <p className="text-gray-500 text-center mb-6 text-sm">
        Start your growth journey with us
      </p>

      <form className="space-y-5" onSubmit={handleSignUp}>
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

        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            placeholder="Email address"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
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
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm Password"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className={`w-full ${
            loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          } text-white font-semibold py-2 rounded-lg transition duration-300`}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{" "}
        <Link
          to="/signin"
          className="text-red-600 font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
