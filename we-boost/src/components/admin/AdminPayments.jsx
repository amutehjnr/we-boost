import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

const STATUSES = ["All", "Pending", "Successful", "Failed"];

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    const query = filter === "All" ? "" : `?status=${filter}`;
    API.get(`/admin/payments${query}`)
      .then((res) => setPayments(res.data.data || []))
      .catch((err) => console.error("Failed to load payments:", err));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const statusColor = (status) => {
    switch (status) {
      case "Successful":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "Failed":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this bank transfer and credit the user wallet?")) return;
    setBusyId(id);
    try {
      await API.post(`/admin/payments/${id}/approve`);
      alert("Deposit approved. Wallet credited.");
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to approve payment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Reason for rejection (optional):") || "";
    setBusyId(id);
    try {
      await API.post(`/admin/payments/${id}/reject`, { reason });
      alert("Deposit rejected.");
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject payment.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Payments</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              filter === s
                ? "bg-red-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
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
              <th className="py-3 px-5">Transaction ID</th>
              <th className="py-3 px-5">User</th>
              <th className="py-3 px-5">Gateway</th>
              <th className="py-3 px-5">Amount</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Date</th>
              <th className="py-3 px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 px-5 text-center text-gray-500 dark:text-gray-400"
                >
                  No payments found.
                </td>
              </tr>
            )}
            {payments.map((p) => {
              const isManualPending =
                p.paymentGateway === "Manual" &&
                (p.status === "Pending" || p.status === "Processing");

              return (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-5 font-mono text-xs">
                    {p.transactionId}
                  </td>
                  <td className="py-3 px-5">
                    {p.user?.fullName}
                    <br />
                    <span className="text-xs text-gray-500">
                      {p.user?.email}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    {p.paymentGateway}
                    {p.paymentMethod === "Bank Transfer" && (
                      <div className="text-xs text-gray-500">Bank Transfer</div>
                    )}
                  </td>
                  <td className="py-3 px-5 font-semibold">
                    ₦{Number(p.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-500">
                    {new Date(p.createdAt).toDateString()}
                  </td>
                  <td className="py-3 px-5">
                    {isManualPending ? (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          disabled={busyId === p.id}
                          onClick={() => handleApprove(p.id)}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {busyId === p.id ? "..." : "Approve"}
                        </button>
                        <button
                          disabled={busyId === p.id}
                          onClick={() => handleReject(p.id)}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}