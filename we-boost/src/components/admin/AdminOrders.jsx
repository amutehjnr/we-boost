import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

const STATUSES = ["All", "Pending", "Processing", "In Progress", "Completed", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const query = filter === "All" ? "" : `?status=${filter}`;
    API.get(`/admin/orders${query}`)
      .then((res) => setOrders(res.data.data || []))
      .catch((err) => console.error("Failed to load orders:", err));
  }, [filter]);

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "Cancelled":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "Processing":
      case "In Progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      default:
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              filter === s ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl shadow-md border overflow-x-auto bg-white dark:bg-[#181818] border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-3 px-5">Order ID</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Platform / Service</th>
              <th className="py-3 px-5">Quantity</th>
              <th className="py-3 px-5">Amount</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 px-5 text-center text-gray-500 dark:text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-5 font-mono text-xs">{o.orderId}</td>
                <td className="py-3 px-5">{o.client?.fullName}<br /><span className="text-xs text-gray-500">{o.client?.email}</span></td>
                <td className="py-3 px-5">{o.platform} — {o.service}</td>
                <td className="py-3 px-5">{o.quantity}</td>
                <td className="py-3 px-5 font-semibold">₦{Number(o.totalAmount || 0).toLocaleString()}</td>
                <td className="py-3 px-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 px-5 text-gray-500">{new Date(o.createdAt).toDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}