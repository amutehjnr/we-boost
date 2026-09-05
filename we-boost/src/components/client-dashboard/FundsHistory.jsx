// src/pages/FundsHistory.jsx
import React, { useState, useEffect } from "react";
import { FaHistory } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "./DashboardLayout";
import API from "../../lib/api";

export default function FundsHistory({ isClient, userModeToggle }) {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await API.get("/payments");

        setTransactions(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch transactions. Please try again later.");
      }
      setLoading(false);
    };

    fetchPayments();
  }, [token]);

  return (
    <DashboardLayout
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      isClient={isClient}
      userModeToggle={userModeToggle}
    >
      <div
        className={`p-6 min-h-screen transition-colors ${
          theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaHistory
            className={`text-3xl ${
              theme === "dark" ? "text-red-500" : "text-red-600"
            }`}
          />
          <h1 className="text-2xl md:text-3xl font-bold">Funds History</h1>
        </div>

        {/* Content */}
        <div className="mt-4">
          {loading ? (
            <p className="text-gray-400">Loading transactions...</p>
          ) : error ? (
            <p className="text-red-500 font-semibold">{error}</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500">No transactions found.</p>
          ) : (
            <div
              className={`rounded-2xl shadow-xl border overflow-x-auto ${
                theme === "dark"
                  ? "bg-[#141414] border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <table className="w-full min-w-[700px] text-sm md:text-base">
                <thead
                  className={`${
                    theme === "dark"
                      ? "bg-[#1a1a1a] text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <tr>
                    <th className="py-3 px-4 text-left">Transaction ID</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Method</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id || txn.transactionId}
                      className={`border-t ${
                        theme === "dark"
                          ? "border-gray-700"
                          : "border-gray-200"
                      }`}
                    >
                      <td className="py-3 px-4">{txn.transactionId || txn.id}</td>

                      <td className="py-3 px-4 capitalize">
                        {txn.type || "N/A"}
                      </td>

                      <td className="py-3 px-4">
                        ₦{Number(txn.amount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        {txn.paymentMethod || "Unknown"}
                      </td>

                      <td
                        className={`py-3 px-4 font-semibold ${
                          txn.status === "Successful"
                            ? "text-green-500"
                            : txn.status === "Pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {txn.status || "Unknown"}
                      </td>

                      <td className="py-3 px-4">
                        {txn.createdAt
                          ? new Date(txn.createdAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}