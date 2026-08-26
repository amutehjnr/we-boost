import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

const STATUSES = ["All", "Available", "Assigned", "In Progress", "Pending Verification", "Completed", "Rejected"];

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("Pending Verification");
  const [busyId, setBusyId] = useState(null);

  const fetchTasks = () => {
    const query = filter === "All" ? "" : `?status=${filter}`;
    API.get(`/admin/tasks${query}`)
      .then((res) => setTasks(res.data.data || []))
      .catch((err) => console.error("Failed to load tasks:", err));
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleVerify = async (taskId, approved) => {
    const verificationNotes = !approved ? (prompt("Reason for rejecting (optional):") || "") : "";
    setBusyId(taskId);
    try {
      await API.post(`/tasks/${taskId}/verify`, { approved, verificationNotes });
      fetchTasks();
    } catch (err) {
      console.error("Failed to verify task:", err);
      alert(err?.response?.data?.message || "Failed to process this task.");
    } finally {
      setBusyId(null);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "Pending Verification":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "Assigned":
      case "In Progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "Rejected":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>

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
              <th className="py-3 px-5">Platform / Type</th>
              <th className="py-3 px-5">Order</th>
              <th className="py-3 px-5">Task-doer</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Reward</th>
              <th className="py-3 px-5">Status</th>
              {filter === "Pending Verification" && <th className="py-3 px-5">Action</th>}
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 px-5 text-center text-gray-500 dark:text-gray-400">
                  No tasks found.
                </td>
              </tr>
            )}
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-5">{t.platform} — {t.taskType}</td>
                <td className="py-3 px-5 font-mono text-xs">{t.order?.orderId}</td>
                <td className="py-3 px-5">{t.assignedUser?.fullName || "—"}</td>
                <td className="py-3 px-5">{t.client?.fullName || "—"}</td>
                <td className="py-3 px-5 font-semibold">₦{Number(t.reward || 0).toLocaleString()}</td>
                <td className="py-3 px-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                {filter === "Pending Verification" && (
                  <td className="py-3 px-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(t.id, true)}
                        disabled={busyId === t.id}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(t.id, false)}
                        disabled={busyId === t.id}
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