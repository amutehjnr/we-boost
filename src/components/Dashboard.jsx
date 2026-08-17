// src/pages/DashboardHome.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./client-dashboard/DashboardLayout";
import { FaShoppingCart, FaWallet, FaClock, FaChartLine } from "react-icons/fa";

export default function DashboardHome({ isClient, userModeToggle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <DashboardLayout setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} isClient={isClient} userModeToggle={userModeToggle}>
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">Welcome back, Shaibu Moses!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here’s what’s going on.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<FaWallet />} label="Wallet Balance" value="₦0.00" />
          <Link to="/dashboard/my-orders">
            <StatCard icon={<FaShoppingCart />} label="Total Orders" value="0" />
          </Link>
          <StatCard icon={<FaClock />} label="Pending Orders" value="0" />
          <StatCard icon={<FaChartLine />} label="Total Spent" value="₦0.00" />
        </div>

        {/* Recent Orders placeholder */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 shadow-sm border dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <Link to="/dashboard/my-orders" className="text-red-500 hover:underline">View All</Link>
          </div>
          <div className="py-10 text-center text-gray-400 dark:text-gray-500">
            <p>No orders yet.</p>
            <Link to="/dashboard/new-order">
              <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                + Create Your First Order
              </button>
            </Link>
          </div>
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
