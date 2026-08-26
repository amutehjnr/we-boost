import React, { useEffect, useState } from "react";
import API from "../../../lib/api";
import { useTheme } from "../../../context/ThemeContext";

export default function MyTasks() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "Pending Verification":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
      case "Assigned":
      case "In Progress":
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
      case "Rejected":
        return "text-red-500 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks/my-tasks?limit=20");
      setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmitProof = async (taskId) => {
    const proofUrl = prompt("Paste a link proving you completed this task (screenshot, post URL, etc.):");
    if (!proofUrl) return;

    setBusyId(taskId);
    try {
      await API.post(`/tasks/${taskId}/submit`, { proofUrl });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to submit proof.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (taskId) => {
    if (!window.confirm("Cancel this task and release it back to the pool?")) return;

    setBusyId(taskId);
    try {
      await API.put(`/tasks/${taskId}/cancel`);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to cancel task.");
    } finally {
      setBusyId(null);
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
        My <span className="text-red-600">Tasks</span> 📋
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Track your task history, progress, and payments in one place.
      </p>

      {/* Tasks Table */}
      <div
        className={`rounded-2xl shadow-md border overflow-x-auto ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <table className="w-full text-sm md:text-base text-left">
          <thead
            className={`text-gray-600 dark:text-gray-400 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <tr>
              <th className="py-4 px-6">Platform</th>
              <th className="py-4 px-6">Task Type</th>
              <th className="py-4 px-6">Target</th>
              <th className="py-4 px-6">Reward</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 px-6 text-center text-gray-500 dark:text-gray-400">
                  You haven't started any tasks yet.
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={`border-b transition-all duration-200 ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-[#202020]"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                <td className="py-4 px-6 font-medium">{task.platform}</td>
                <td className="py-4 px-6">{task.taskType}</td>
                <td className="py-4 px-6 max-w-[200px] truncate" title={task.targetUrl}>
                  {task.targetUrl}
                </td>
                <td className="py-4 px-6 font-semibold text-red-600">
                  ₦{Number(task.reward).toLocaleString()}
                </td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                  {task.createdAt ? new Date(task.createdAt).toDateString() : ""}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {["Assigned", "In Progress"].includes(task.status) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitProof(task.id)}
                        disabled={busyId === task.id}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-60"
                      >
                        Submit Proof
                      </button>
                      <button
                        onClick={() => handleCancel(task.id)}
                        disabled={busyId === task.id}
                        className="text-xs text-gray-500 hover:text-red-600 px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}