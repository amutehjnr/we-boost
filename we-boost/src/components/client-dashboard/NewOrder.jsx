// src/pages/NewOrder.jsx
import React, { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { FaShoppingCart, FaInfoCircle } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import API from "../../lib/api";

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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const serviceRates = {
    Basic: 10000,
    Moderate: 25000,
    High: 50000,
  };

  // Ensure quantity is converted safely
  const qty = Number(formData.quantity);
  const rate = serviceRates[formData.service];

  const total = qty > 0 ? (qty / 1000) * rate : 0;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.username || !formData.quantity) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      setLoading(false);
      return;
    }

    if (qty < 100) {
      setMessage({ type: "error", text: "Minimum quantity is 100." });
      setLoading(false);
      return;
    }

    if (qty > 10000000) {
      setMessage({ type: "error", text: "Maximum quantity is 10,000,000." });
      setLoading(false);
      return;
    }

    try {
      const res = await API.post(
        "/orders",
        {
          platform: formData.platform,
          category: formData.category,
          service: formData.service,
          targetUrl: formData.username,
          quantity: qty,
        }
      );

      setMessage({ type: "success", text: res.data.message });

      setFormData({
        platform: "Facebook",
        category: "Followers",
        service: "Basic",
        username: "",
        quantity: "",
      });

    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create order.",
      });
    }

    setLoading(false);
  };

  return (
    <DashboardLayout
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      isClient={isClient}
      userModeToggle={userModeToggle}
    >
      <div className="p-6 space-y-6">

        <div className="flex items-center gap-3">
          <FaShoppingCart
            className={`text-3xl ${theme === "dark" ? "text-red-500" : "text-red-600"}`}
          />
          <h1 className="text-2xl font-bold">Place New Order</h1>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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
                <SelectField
                  label="Platform"
                  value={formData.platform}
                  options={[
                    "Facebook",
                    "Instagram",
                    "YouTube",
                    "Twitter",
                    "TikTok",
                    "Spotify",
                    "Audiomack",
                    "YoutubeMusic",
                  ]}
                  onChange={(val) => setFormData({ ...formData, platform: val })}
                  theme={theme}
                />

                <SelectField
                  label="Category"
                  value={formData.category}
                  options={[
                    "Followers",
                    "Likes",
                    "Views",
                    "Comments",
                    "Streams",
                    "Shares",
                  ]}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  theme={theme}
                />
              </div>

              <SelectField
                label="Service"
                value={formData.service}
                options={["Basic", "Moderate", "High"]}
                onChange={(val) => setFormData({ ...formData, service: val })}
                theme={theme}
              />

              <InfoBox
                theme={theme}
                text={`Get ${formData.category.toLowerCase()} for your ${formData.platform} account with ${formData.service} quality.`}
              />

              <InputField
                label="Link / Username"
                placeholder="Enter profile link or username"
                value={formData.username}
                onChange={(val) => setFormData({ ...formData, username: val })}
                theme={theme}
              />

              <InputField
                label="Quantity"
                type="number"
                placeholder="e.g. 1000"
                value={formData.quantity}
                onChange={(val) => setFormData({ ...formData, quantity: val })}
                theme={theme}
                note="Min: 100 – Max: 10,000,000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-semibold rounded-md bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition"
            >
              {loading ? "Placing Order..." : "Place Order"}
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
              <SummaryRow label="Rate:" value={`₦${rate.toLocaleString()}/1K`} />
              <hr
                className={`my-3 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                }`}
              />

              <SummaryRow
                label="Total:"
                value={`₦${total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}`}
                highlight
              />
            </div>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}


// Reusable Components
function SelectField({ label, value, options, onChange, theme }) {
  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      <select
        className={`w-1/2 p-3 rounded-md border outline-none ${
          theme === "dark"
            ? "bg-black border-gray-700 text-gray-200"
            : "bg-gray-50 border-gray-300 text-gray-800"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", theme, note }) {
  return (
    <div className="mb-5">
      <label className="block mb-2 font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full p-3 rounded-md border outline-none ${
          theme === "dark"
            ? "bg-black border-gray-700 text-gray-200"
            : "bg-gray-50 border-gray-300 text-gray-800"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {note && (
        <p className="text-sm mt-1 text-gray-500 dark:text-gray-500">{note}</p>
      )}
    </div>
  );
}

function InfoBox({ text, theme }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md border-l-4 mb-5 ${
        theme === "dark"
          ? "bg-[#1a1a1a] border-red-600 text-gray-300"
          : "bg-red-50 border-red-600 text-gray-700"
      }`}
    >
      <FaInfoCircle className="text-lg text-red-500 mt-1" />
      <p>{text}</p>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between text-sm md:text-base">
      <span className={`font-medium ${highlight ? "text-lg text-red-500 font-bold" : ""}`}>
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