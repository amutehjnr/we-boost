// src/pages/MyOrders.jsx
import React, { useState, useEffect } from "react";
import { FaListAlt } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import DashboardHeader from "../client-dashboard/DashboardHeader";
import DashboardSidebar from "../client-dashboard/DashboardSidebar";
import DashboardLayout from "./DashboardLayout";

export default function MyOrders({ isClient, userModeToggle }) {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders] = useState([
    { id: "ORD1234", service: "Instagram Followers", quantity: 5000, status: "Completed", date: "2025-10-12" },
    { id: "ORD1235", service: "YouTube Views", quantity: 2000, status: "Processing", date: "2025-10-13" },
    { id: "ORD1236", service: "TikTok Likes", quantity: 1500, status: "Pending", date: "2025-10-14" },
  ]);

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-500";
      case "Processing":
        return "text-yellow-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <DashboardLayout setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} isClient={isClient} userModeToggle={userModeToggle}>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto px-4 md:px-8 py-10 transition-colors duration-300 ${
            theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
          }`}
        >
          <div className="flex items-center gap-3 mb-8">
            <FaListAlt className={`text-3xl ${theme === "dark" ? "text-red-500" : "text-red-600"}`} />
            <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
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
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.service}</td>
                    <td className="py-3 px-4">{order.quantity}</td>
                    <td className={`py-3 px-4 font-semibold ${statusColor(order.status)}`}>
                      {order.status}
                    </td>
                    <td className="py-3 px-4">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
