import React from "react";
import { FaWallet, FaArrowUp, FaArrowDown, FaClock } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Earnings() {
  const { theme } = useTheme();

  // Sample earnings data
  const data = [
    { month: "Jan", earnings: 3200 },
    { month: "Feb", earnings: 4100 },
    { month: "Mar", earnings: 3900 },
    { month: "Apr", earnings: 4500 },
    { month: "May", earnings: 5200 },
    { month: "Jun", earnings: 6100 },
  ];

  const stats = [
    {
      icon: <FaWallet />,
      label: "Total Earnings",
      value: "₦32,400",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      icon: <FaArrowDown />,
      label: "Withdrawn",
      value: "₦21,000",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      icon: <FaClock />,
      label: "Pending",
      value: "₦4,800",
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    {
      icon: <FaArrowUp />,
      label: "Available Balance",
      value: "₦6,600",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
  ];

  const transactions = [
    {
      id: 1,
      date: "Oct 20, 2025",
      type: "Task Reward (Instagram Follow)",
      amount: "₦50",
      status: "Completed",
    },
    {
      id: 2,
      date: "Oct 21, 2025",
      type: "Withdrawal",
      amount: "-₦5,000",
      status: "Processed",
    },
    {
      id: 3,
      date: "Oct 22, 2025",
      type: "Task Reward (TikTok Like)",
      amount: "₦25",
      status: "Pending",
    },
  ];

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
      case "Processed":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "Pending":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
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
        {stats.map((item, i) => (
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

      {/* Earnings Chart */}
      <div
        className={`rounded-2xl p-6 mb-10 shadow-md border ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
          Monthly Earnings Overview
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#ef4444"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#ef4444"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
            <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#333" : "#E5E7EB"} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#181818" : "#fff",
                color: theme === "dark" ? "#E5E7EB" : "#111",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorEarnings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div
        className={`rounded-2xl shadow-md border overflow-x-auto ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2 className="text-lg font-bold p-6 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
          Recent Transactions
        </h2>
        <table className="w-full text-sm md:text-base text-left">
          <thead
            className={`text-gray-600 dark:text-gray-400 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <tr>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Type</th>
              <th className="py-4 px-6">Amount</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className={`border-b transition-all duration-200 ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-[#202020]"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                <td className="py-4 px-6">{tx.date}</td>
                <td className="py-4 px-6">{tx.type}</td>
                <td
                  className={`py-4 px-6 font-semibold ${
                    tx.amount.startsWith("-") ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {tx.amount}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                      tx.status
                    )}`}
                  >
                    {tx.status}
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
