// src/components/AuthLayout.jsx
import React from "react";
import { FaRocket } from "react-icons/fa";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration / Brand */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-red-600 to-black text-white w-1/2 p-10">
        <div className="flex items-center mb-6 gap-2">
          <FaRocket className="text-4xl animate-bounce" />
          <h1 className="text-3xl font-extrabold">
            We<span className="text-white">Boost</span>
          </h1>
        </div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-200 text-center max-w-md">{subtitle}</p>
      </div>

      {/* Right side - Form */}
      <div className="my-auto flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
