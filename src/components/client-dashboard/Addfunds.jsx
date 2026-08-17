// src/pages/AddFunds.jsx
import React, { useState } from "react";
import { FaWallet } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import DashboardLayout from "./DashboardLayout";

export default function AddFunds({ isClient, userModeToggle }) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Adding ₦${amount} via ${method}`);
  };

  return (
    <DashboardLayout setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} isClient={isClient} userModeToggle={userModeToggle}>
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto px-4 md:px-8 py-10 transition-colors duration-300 ${
            theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
          }`}
        >
          <div className="flex items-center gap-3 mb-8">
            <FaWallet className={`text-3xl ${theme === "dark" ? "text-red-500" : "text-red-600"}`} />
            <h1 className="text-2xl md:text-3xl font-bold">Add Funds</h1>
          </div>

          <div
            className={`p-6 rounded-2xl shadow-xl border max-w-xl ${
              theme === "dark" ? "bg-[#141414] border-gray-800" : "bg-white border-gray-200"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className={`w-full p-3 rounded-md border outline-none ${
                    theme === "dark"
                      ? "bg-black border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                >
                  <option>Bank Transfer</option>
                  <option>Card Payment</option>
                  <option>Crypto (USDT)</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full p-3 rounded-md border outline-none ${
                    theme === "dark"
                      ? "bg-black border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-md font-semibold text-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition-all"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
