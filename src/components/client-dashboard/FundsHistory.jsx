// src/pages/FundsHistory.jsx
import React, { useState } from "react";
import { FaHistory } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import DashboardLayout from "./DashboardLayout";

export default function FundsHistory({ isClient, userModeToggle }) {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [transactions] = useState([
    { id: "TXN1001", type: "Deposit", amount: 5000, method: "Bank Transfer", date: "2025-10-10", status: "Successful" },
    { id: "TXN1002", type: "Deposit", amount: 10000, method: "Card", date: "2025-10-12", status: "Pending" },
  ]);

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
            <FaHistory className={`text-3xl ${theme === "dark" ? "text-red-500" : "text-red-600"}`} />
            <h1 className="text-2xl md:text-3xl font-bold">Funds History</h1>
          </div>

          <div
            className={`rounded-2xl shadow-xl border overflow-x-auto ${
              theme === "dark" ? "bg-[#141414] border-gray-800" : "bg-white border-gray-200"
            }`}
          >
            <table className="w-full text-sm md:text-base">
              <thead
                className={`text-left ${
                  theme === "dark" ? "bg-[#1a1a1a] text-gray-300" : "bg-gray-100 text-gray-700"
                }`}
              >
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className={`border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <td className="py-3 px-4">{txn.id}</td>
                    <td className="py-3 px-4">{txn.type}</td>
                    <td className="py-3 px-4">₦{txn.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">{txn.method}</td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        txn.status === "Successful"
                          ? "text-green-500"
                          : txn.status === "Pending"
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    >
                      {txn.status}
                    </td>
                    <td className="py-3 px-4">{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
