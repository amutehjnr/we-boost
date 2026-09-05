import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./client-dashboard/DashboardLayout";
import { FaShoppingCart, FaWallet, FaClock, FaChartLine } from "react-icons/fa";
import API from "../lib/api";
import { formatCurrency, formatNumber } from "../utils/format";

export default function DashboardHome({ isClient, userModeToggle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await API.get("/orders/stats");
        setStats(statsRes.data.data);

        const ordersRes = await API.get("/orders?limit=5");
        setRecentOrders(ordersRes.data.data);

        const userRes = await API.get("/users/profile");
        setWalletBalance(Number(userRes.data.data.walletBalance) || 0);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [token]);

  return (
    <DashboardLayout setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} isClient={isClient} userModeToggle={userModeToggle}>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here’s what’s going on.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<FaWallet />} label="Wallet Balance" value={formatCurrency(walletBalance)} />
          <Link to="/dashboard/my-orders">
            <StatCard icon={<FaShoppingCart />} label="Total Orders" value={stats.totalOrders || 0} />
          </Link>
          <StatCard icon={<FaClock />} label="Pending Orders" value={stats.pendingOrders || 0} />
          <StatCard icon={<FaChartLine />} label="Total Spent" value={formatCurrency(stats.totalSpent)} />
        </div>

        <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 shadow-sm border dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <Link to="/dashboard/my-orders" className="text-red-500 hover:underline">View All</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-gray-400 dark:text-gray-500">
              <p>No orders yet.</p>
              <Link to="/dashboard/new-order">
                <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  + Create Your First Order
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm md:text-base">
              <thead className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4">{order.orderId}</td>
                    <td className="py-3 px-4">{`${order.platform} ${order.category}`}</td>
                    <td className="py-3 px-4">{formatNumber(order.quantity, 0)}</td>
                    <td className="py-3 px-4">{`${formatNumber(order.progressPercentage)}%`}</td>
                    <td className={`py-3 px-4 font-semibold ${statusColor(order.status)}`}>{order.status}</td>
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

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl p-5 shadow hover:shadow-md transition flex items-center gap-4 border dark:border-gray-800">
      <div className="text-red-500 text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <h4 className="text-xl font-bold">{value}</h4>
      </div>
    </div>
  );
}

function statusColor(status) {
  switch (status) {
    case "Completed": return "text-green-500";
    case "Processing": return "text-yellow-500";
    case "Cancelled": return "text-red-500";
    default: return "text-gray-400";
  }
}