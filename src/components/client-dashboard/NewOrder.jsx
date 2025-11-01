// src/pages/NewOrder.jsx
import React, { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { FaShoppingCart, FaInfoCircle } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function NewOrder({ isClient, userModeToggle }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    platform: "Facebook",
    category: "Followers",
    service: "Basic",
    username: "",
    quantity: "",
  });

  const serviceRates = {
    Basic: 10000,
    Moderate: 25000,
    High: 50000,
  };

  const rate = serviceRates[formData.service];
  const total =
    formData.quantity && !isNaN(formData.quantity)
      ? (formData.quantity / 1000) * rate
      : 0;

  return (
    <DashboardLayout setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} isClient={isClient} userModeToggle={userModeToggle}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <FaShoppingCart
            className={`text-3xl ${
              theme === "dark" ? "text-red-500" : "text-red-600"
            }`}
          />
          <h1 className="text-2xl font-bold">Place New Order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div
            className={`lg:col-span-2 p-6 rounded-2xl shadow-xl border flex flex-col justify-between ${
              theme === "dark"
                ? "bg-[#141414] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div>
              <h2 className="text-xl font-semibold mb-5">Order Details</h2>

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block mb-2 font-medium">Platform</label>
                  <select
                    className={`w-1/2 p-3 rounded-md border outline-none ${
                      theme === "dark"
                        ? "bg-black border-gray-700 text-gray-200"
                        : "bg-gray-50 border-gray-300 text-gray-800"
                    }`}
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                  >
                    <option>Facebook</option>
                    <option>Instagram</option>
                    <option>YouTube</option>
                    <option>Twitter (X)</option>
                    <option>TikTok</option>
                    <option>Spotify</option>
                    <option>Audiomack</option>
                    <option>YoutubeMusic</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Category</label>
                  <select
                    className={`w-1/2 p-3 rounded-md border outline-none ${
                      theme === "dark"
                        ? "bg-black border-gray-700 text-gray-200"
                        : "bg-gray-50 border-gray-300 text-gray-800"
                    }`}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option>Followers</option>
                    <option>Likes</option>
                    <option>Views</option>
                    <option>Comments</option>
                    <option>Streams</option>
                    <option>Shares</option>
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-medium">Service</label>
                <select
                  className={`w-1/2 p-3 rounded-md border outline-none ${
                    theme === "dark"
                      ? "bg-black border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                >
                  <option>Basic</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
              </div>

              <div
                className={`flex items-start gap-3 p-3 rounded-md border-l-4 mb-5 ${
                  theme === "dark"
                    ? "bg-[#1a1a1a] border-red-600 text-gray-300"
                    : "bg-red-50 border-red-600 text-gray-700"
                }`}
              >
                <FaInfoCircle className="text-lg text-red-500 mt-1" />
                <p>
                  Get {formData.category.toLowerCase()} for your{" "}
                  {formData.platform} account with {formData.service} quality.
                </p>
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-medium">Link / Username</label>
                <input
                  type="text"
                  placeholder="Enter profile link or username"
                  className={`w-full p-3 rounded-md border outline-none ${
                    theme === "dark"
                      ? "bg-black border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div className="mb-8">
                <label className="block mb-2 font-medium">Quantity</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  className={`w-full p-3 rounded-md border outline-none ${
                    theme === "dark"
                      ? "bg-black border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-500">
                  Min: 100 – Max: 10,000,000
                </p>
              </div>
            </div>

            <button className="w-full py-3 text-lg font-semibold rounded-md bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition">
              Place Order
            </button>
          </div>

          {/* Order Summary */}
          <div
            className={`p-6 rounded-2xl shadow-xl border ${
              theme === "dark"
                ? "bg-[#141414] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <FaInfoCircle className="text-red-500" /> Order Summary
            </h2>

            <div className="space-y-4 text-sm">
              <SummaryRow label="Service:" value={formData.service} />
              <SummaryRow label="Quantity:" value={formData.quantity || "—"} />
              <SummaryRow
                label="Rate:"
                value={`₦${rate.toLocaleString("en-NG")}/1K`}
              />
              <hr
                className={`my-3 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                }`}
              />
              <SummaryRow
                label="Total:"
                value={`₦${total.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}`}
                highlight
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between text-sm md:text-base">
      <span
        className={`font-medium ${
          highlight ? "text-lg text-red-500 font-bold" : ""
        }`}
      >
        {label}
      </span>
      <span
        className={`font-semibold ${
          highlight ? "text-lg text-red-500" : "text-gray-400 dark:text-gray-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
