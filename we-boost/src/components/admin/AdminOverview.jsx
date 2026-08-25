import React, { useEffect, useState } from "react";
import { FaUsers, FaShoppingCart, FaHourglassHalf, FaWallet } from "react-icons/fa";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/admin/stats")
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error("Failed to load admin stats:", err));
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: <FaUsers /> },
    { label: "Clients", value: stats?.totalClients ?? 0, icon: <FaUsers /> },
    { label: "Task Users", value: stats?.totalTaskUsers ?? 0, icon: <FaUsers /> },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: <FaShoppingCart /> },
    { label: "Pending Withdrawals", value: stats?.pendingWithdrawals ?? 0, icon: <FaHourglassHalf /> },
    { label: "Total Revenue", value: `₦${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FaWallet /> },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 p-5 rounded-2xl shadow-md border bg-white dark:bg-[#181818] border-gray-200 dark:border-gray-700"
          >
            <div className="text-2xl text-red-600">{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              <h3 className="text-xl font-bold">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}