import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import AuthLayout from "./AuthLayout.jsx";
import API from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification link. Please use the link from your email.");
      return;
    }

    API.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification failed. The link may have expired.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthLayout title="Email Verification" subtitle="">
      <div className="flex flex-col items-center text-center py-6">
        {status === "verifying" && <p className="text-gray-500">Verifying your email...</p>}

        {status === "success" && (
          <>
            <FaCheckCircle className="text-green-500 text-5xl mb-4" />
            <p className="text-gray-700 mb-6">{message}</p>
            <Link to="/dashboard" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg">
              Go to Dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <FaTimesCircle className="text-red-500 text-5xl mb-4" />
            <p className="text-gray-700 mb-6">{message}</p>
            <Link to="/signin" className="text-red-600 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}