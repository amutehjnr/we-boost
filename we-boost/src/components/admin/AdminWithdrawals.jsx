import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("Pending");

  const fetchWithdrawals = async () => {
    try {
      const res = await API.get(`/withdrawals/admin/all?status=${filter}`);
      setWithdrawals(res.data.data || []);
    } catch (err) {
      console.error("Failed to load withdrawals:", err);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleProcess = async (id, status) => {
    let transactionReference = "";
    let adminNotes = "";

    if (status === "Completed") {
      transactionReference = prompt("Enter the bank transfer reference for this payout:") || "";
      if (!transactionReference) return;
    } else {
      adminNotes = prompt("Reason for rejecting this withdrawal:") || "";
    }

    setBusyId(id);
    try {
      await API.put(`/withdrawals/${id}/process`, { status, transactionReference, adminNotes });
      fetchWithdrawals();
    } catch (err) {
      console.error("Failed to process withdrawal:", err);
      alert(err?.response?.data?.message || "Failed to process withdrawal.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-2">Withdrawals</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Approve a withdrawal only after you've actually sent the bank transfer yourself — this doesn't move money automatically.
      </p>

      <div className="flex gap-2 mb-6">
        {["Pending", "Completed", "Rejected"].map((s) => (
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
              <th className="py-3 px-5">User</th>
              <th className="py-3 px-5">Amount</th>
              <th className="py-3 px-5">Bank</th>
              <th className="py-3 px-5">Account</th>
              <th className="py-3 px-5">Requested</th>
              {filter === "Pending" && <th className="py-3 px-5">Action</th>}
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 px-5 text-center text-gray-500 dark:text-gray-400">
                  No {filter.toLowerCase()} withdrawals.
                </td>
              </tr>
            )}
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-5">{w.user?.fullName}<br /><span className="text-xs text-gray-500">{w.user?.email}</span></td>
                <td className="py-3 px-5 font-semibold">₦{Number(w.amount).toLocaleString()}</td>
                <td className="py-3 px-5">{w.bankName}</td>
                <td className="py-3 px-5">{w.accountNumber}<br /><span className="text-xs text-gray-500">{w.accountName}</span></td>
                <td className="py-3 px-5 text-gray-500">{new Date(w.createdAt).toDateString()}</td>
                {filter === "Pending" && (
                  <td className="py-3 px-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcess(w.id, "Completed")}
                        disabled={busyId === w.id}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleProcess(w.id, "Rejected")}
                        disabled={busyId === w.id}
                        className="bg-gray-200 dark:bg-gray-700 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}