import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardCheck,
  FaSpinner,
} from "react-icons/fa";
import DashboardLayout from "./DashboardLayout";
import { useTheme } from "../../context/ThemeContext";
import API from "../../lib/api";

export default function VerifyTasks({ isClient, userModeToggle }) {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const isDark = theme === "dark";

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

  const handleApprove = async (taskId) => {
    setBusyId(taskId);
    try {
      await API.post(`/tasks/${taskId}/verify`, {
        approved: true,
        verificationNotes: "",
      });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Failed to verify task:", error);
      alert(error?.response?.data?.message || "Failed to process this task.");
    } finally {
      setBusyId(null);
    }
  };

  const openRejectModal = (taskId) => {
    setRejectModal(taskId);
    setRejectReason("");
    setRejectError("");
  };

  const closeRejectModal = () => {
    if (busyId) return;
    setRejectModal(null);
    setRejectReason("");
    setRejectError("");
  };

  const handleRejectSubmit = async (e) => {
    e?.preventDefault?.();
    if (!rejectModal) return;

    setRejectError("");
    setBusyId(rejectModal);
    try {
      await API.post(`/tasks/${rejectModal}/verify`, {
        approved: false,
        verificationNotes: rejectReason.trim(),
      });
      setTasks((prev) => prev.filter((t) => t.id !== rejectModal));
      setRejectModal(null);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject task:", error);
      const msg =
        error?.response?.data?.message ||
        (!error?.response
          ? "Network error. Check your connection and try again."
          : "Failed to process this task.");
      setRejectError(msg);
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
          isDark ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <FaClipboardCheck
            className={`text-3xl ${isDark ? "text-red-500" : "text-red-600"}`}
          />
          <h1 className="text-2xl md:text-3xl font-bold">Verify Tasks</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Review proof submitted by task-doers on your orders, then approve or
          reject.
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
              className={`p-5 rounded-2xl border shadow-md ${
                isDark
                  ? "bg-[#141414] border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">
                    {task.platform} — {task.taskType}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order: {task.order?.orderId} &middot; Submitted by:{" "}
                    {task.assignedUser?.fullName || "Unknown"} (
                    {task.assignedUser?.email})
                  </p>
                  <p className="mt-2 text-sm">
                    Was asked to {task.taskType}:{" "}
                    <span className="font-medium break-all">
                      {task.targetUrl}
                    </span>
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
                    onClick={() => handleApprove(task.id)}
                    disabled={busyId === task.id}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                  >
                    {busyId === task.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheckCircle />
                    )}{" "}
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(task.id)}
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

      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={closeRejectModal}
        >
          <div
            className={`w-full max-w-md rounded-2xl border shadow-xl p-6 ${
              isDark
                ? "bg-[#181818] border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Reject Task</h3>
            <p
              className={`text-sm mb-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Optionally add a reason. The task-doer may see this note.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 relative">
              {busyId === rejectModal && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/40">
                  <FaSpinner className="text-3xl text-red-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-white">
                    Rejecting...
                  </span>
                </div>
              )}

              {rejectError && (
                <div
                  className={`text-sm p-3 rounded-lg border ${
                    isDark
                      ? "bg-red-900/30 text-red-300 border-red-800"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {rejectError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError("");
                  }}
                  rows={3}
                  placeholder="e.g. Proof does not match the required action"
                  autoFocus
                  disabled={busyId === rejectModal}
                  className={`w-full p-3 rounded-lg border outline-none disabled:opacity-60 ${
                    isDark
                      ? "bg-black border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={!!busyId}
                  className={`flex-1 py-2.5 rounded-lg font-medium border transition disabled:opacity-60 ${
                    isDark
                      ? "border-gray-600 hover:bg-gray-800"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!busyId}
                  className="flex-1 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {busyId === rejectModal ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    "Reject Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}