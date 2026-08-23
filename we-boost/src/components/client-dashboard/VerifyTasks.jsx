import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaClipboardCheck } from "react-icons/fa";
import DashboardLayout from "./DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import API from "../../lib/api";

export default function VerifyTasks({ isClient, userModeToggle }) {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks/pending-verification");
      setTasks(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch pending tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleVerify = async (taskId, approved) => {
    let verificationNotes = "";
    if (!approved) {
      verificationNotes = prompt("Reason for rejecting this task (optional):") || "";
    }

    setBusyId(taskId);
    try {
      await API.post(`/tasks/${taskId}/verify`, { approved, verificationNotes });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Failed to verify task:", error);
      alert(error?.response?.data?.message || "Failed to process this task.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      isClient={isClient}
      userModeToggle={userModeToggle}
    >
      <div
        className={`flex-1 overflow-y-auto px-4 md:px-8 py-10 transition-colors duration-300 ${
          theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <FaClipboardCheck className={`text-3xl ${theme === "dark" ? "text-red-500" : "text-red-600"}`} />
          <h1 className="text-2xl md:text-3xl font-bold">Verify Tasks</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Review proof submitted by task-doers on your orders, then approve or reject.
        </p>

        {tasks.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            No tasks awaiting verification right now.
          </p>
        )}

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-6 rounded-2xl shadow-md border ${
                theme === "dark" ? "bg-[#141414] border-gray-800" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">
                    {task.platform} — {task.taskType}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order: {task.order?.orderId} &middot; Submitted by: {task.assignedUser?.fullName || "Unknown"} ({task.assignedUser?.email})
                  </p>
                  {task.proofUrl && (
                    <p className="mt-2 text-sm">
                      Proof link:{" "}
                      <a
                        href={task.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 underline break-all"
                      >
                        {task.proofUrl}
                      </a>
                    </p>
                  )}
                  {task.proofText && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Note: {task.proofText}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify(task.id, true)}
                    disabled={busyId === task.id}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                  >
                    <FaCheckCircle /> Approve
                  </button>
                  <button
                    onClick={() => handleVerify(task.id, false)}
                    disabled={busyId === task.id}
                    className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}