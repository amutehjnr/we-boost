import React, { useState } from "react";
import { FaWallet, FaMoneyBillWave, FaInfoCircle } from "react-icons/fa";
import { useTheme } from "../../../context//ThemeContext";

export default function Withdraw() {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // You’ll replace this with your Firebase or backend call
    if (formData.amount && formData.bankName && formData.accountNumber && formData.accountName) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setFormData({ amount: "", bankName: "", accountNumber: "", accountName: "" });
    }
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <h1 className="text-2xl font-bold mb-2">Withdraw Earnings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Withdraw your earnings directly to your bank account once you’ve met the minimum threshold.
      </p>

      {/* Wallet Summary */}
      <div
        className={`p-5 rounded-2xl flex items-center justify-between mb-8 shadow-md border ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <FaWallet className="text-3xl text-red-600" />
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Wallet Balance</p>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              ₦12,400.00
            </h2>
          </div>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          Add Funds
        </button>
      </div>

      {/* Withdraw Form */}
      <form
        onSubmit={handleSubmit}
        className={`max-w-2xl mx-auto rounded-2xl shadow-md border p-8 space-y-6 ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div>
          <label className="block font-medium mb-2">Withdrawal Amount (₦)</label>
          <input
            type="number"
            placeholder="Enter amount (min ₦1000)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            className={`w-full p-3 rounded-lg border outline-none ${
              theme === "dark"
                ? "bg-black border-gray-700 text-gray-200"
                : "bg-gray-50 border-gray-300 text-gray-800"
            }`}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Bank Name</label>
          <input
            type="text"
            placeholder="e.g. Access Bank"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            required
            className={`w-full p-3 rounded-lg border outline-none ${
              theme === "dark"
                ? "bg-black border-gray-700 text-gray-200"
                : "bg-gray-50 border-gray-300 text-gray-800"
            }`}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Account Number</label>
          <input
            type="text"
            placeholder="Enter 10-digit account number"
            maxLength="10"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            required
            className={`w-full p-3 rounded-lg border outline-none ${
              theme === "dark"
                ? "bg-black border-gray-700 text-gray-200"
                : "bg-gray-50 border-gray-300 text-gray-800"
            }`}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Account Name</label>
          <input
            type="text"
            placeholder="Enter your account name"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            required
            className={`w-full p-3 rounded-lg border outline-none ${
              theme === "dark"
                ? "bg-black border-gray-700 text-gray-200"
                : "bg-gray-50 border-gray-300 text-gray-800"
            }`}
          />
        </div>

        <div
          className={`flex items-start gap-3 text-sm p-3 rounded-md border-l-4 ${
            theme === "dark"
              ? "bg-[#1a1a1a] border-red-600 text-gray-300"
              : "bg-red-50 border-red-600 text-gray-700"
          }`}
        >
          <FaInfoCircle className="text-lg text-red-500 mt-1" />
          <p>
            Withdrawals are processed within <strong>24–48 hours</strong>. Minimum withdrawal is ₦1,000.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-md font-semibold text-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition-all"
        >
          Withdraw Funds
        </button>

        {success && (
          <p className="text-green-500 font-medium text-center mt-3">
            ✅ Withdrawal request submitted successfully!
          </p>
        )}
      </form>
    </div>
  );
}
