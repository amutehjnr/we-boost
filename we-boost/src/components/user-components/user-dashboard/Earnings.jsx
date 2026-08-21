import React, { useEffect, useState } from "react";
import { FaWallet, FaArrowUp, FaArrowDown, FaClock } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import API from "../../../lib/api";

export default function Earnings() {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    API.get("/users/stats")
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error("Error fetching stats:", err));

    API.get("/withdrawals?limit=10")
      .then((res) => setWithdrawals(res.data.data || []))
      .catch((err) => console.error("Error fetching withdrawals:", err));
  }, []);

  const pending = withdrawals
    .filter((w) => w.status === "Pending")
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const summaryCards = [
    {
      icon: <FaWallet />,
      label: "Total Earnings",
      value: `₦${Number(stats?.totalEarnings || 0).toLocaleString()}`,
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      icon: <FaArrowDown />,
      label: "Withdrawn",
      value: `₦${Number(stats?.totalWithdrawn || 0).toLocaleString()}`,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      icon: <FaClock />,
      label: "Pending",
      value: `₦${pending.toLocaleString()}`,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    {
      icon: <FaArrowUp />,
      label: "Available Balance",
      value: `₦${Number(stats?.walletBalance || 0).toLocaleString()}`,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
  ];

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "Pending":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
      case "Rejected":
      case "Cancelled":
        return "text-red-500 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <div
      className={`transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#121212] text-gray-200"
          : "bg-gray-50 text-gray-800"
      } min-h-screen p-6 rounded-2xl`}
    >
      <h1 className="text-2xl font-bold mb-4">
        My <span className="text-red-600">Earnings</span> 💰
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Track your earnings, withdrawals, and task rewards.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {summaryCards.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-5 rounded-2xl shadow-md dark:shadow-none ${item.color}`}
          >
            <div className="text-3xl">{item.icon}</div>
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <h3 className="text-lg font-bold">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawals Table */}
      <div
        className={`rounded-2xl shadow-md border overflow-x-auto ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2 className="text-lg font-bold p-6 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
          Recent Withdrawals
        </h2>
        <table className="w-full text-sm md:text-base text-left">
          <thead
            className={`text-gray-600 dark:text-gray-400 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <tr>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Bank</th>
              <th className="py-4 px-6">Amount</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 px-6 text-center text-gray-500 dark:text-gray-400">
                  No withdrawals yet.
                </td>
              </tr>
            )}
            {withdrawals.map((w) => (
              <tr
                key={w.id}
                className={`border-b transition-all duration-200 ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-[#202020]"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                <td className="py-4 px-6">
                  {w.createdAt ? new Date(w.createdAt).toDateString() : ""}
                </td>
                <td className="py-4 px-6">{w.bankName}</td>
                <td className="py-4 px-6 font-semibold text-red-500">
                  -₦{Number(w.amount).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(w.status)}`}
                  >
                    {w.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}