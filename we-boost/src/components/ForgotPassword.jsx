import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { friendlyAuthError } from "../lib/firebaseErrorMessage";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll email you a reset link">
      {sent ? (
        <div className="text-center">
          <p className="text-gray-700 mb-6">
            If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your inbox.
          </p>
          <Link to="/signin" className="text-red-600 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white ${loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-center text-gray-500 text-sm">
            <Link to="/signin" className="text-red-600 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}