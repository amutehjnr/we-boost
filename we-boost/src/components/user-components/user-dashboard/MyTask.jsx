import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import API from "../../../lib/api";
import { useTheme } from "../../../context/ThemeContext";

export default function MyTasks() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [proofModal, setProofModal] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofError, setProofError] = useState("");
  const isDark = theme === "dark";

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

  const openProofModal = (taskId) => {
    setProofModal(taskId);
    setProofUrl("");
    setProofError("");
  };

  const closeProofModal = () => {
    if (busyId) return;
    setProofModal(null);
    setProofUrl("");
    setProofError("");
  };

  const handleSubmitProof = async (e) => {
    e?.preventDefault?.();
    if (!proofModal) return;

    const url = proofUrl.trim();
    if (!url) {
      setProofError("Please paste a proof link.");
      return;
    }
    if (url.length < 5) {
      setProofError("Proof link looks too short.");
      return;
    }

    setProofError("");
    setBusyId(proofModal);
    try {
      await API.post(`/tasks/${proofModal}/submit`, { proofUrl: url });
      setProofModal(null);
      setProofUrl("");
      fetchTasks();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        (!err?.response
          ? "Network error. Check your connection and try again."
          : "Failed to submit proof.");
      setProofError(msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (taskId) => {
    if (!window.confirm("Cancel this task and release it back to the pool?"))
      return;

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
        isDark ? "bg-[#121212] text-gray-200" : "bg-gray-50 text-gray-800"
      } min-h-screen p-6 rounded-2xl`}
    >
      <h1 className="text-2xl font-bold mb-4">
        My <span className="text-red-600">Tasks</span> 📋
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Track your task history, progress, and payments in one place.
      </p>

      <div
        className={`overflow-x-auto rounded-2xl shadow-md border ${
          isDark ? "bg-[#181818] border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <table className="w-full text-left text-sm">
          <thead
            className={`text-gray-500 dark:text-gray-400 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <tr>
              <th className="py-3 px-6">Platform</th>
              <th className="py-3 px-6">Type</th>
              <th className="py-3 px-6">Target</th>
              <th className="py-3 px-6">Reward</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 px-6 text-center text-gray-500 dark:text-gray-400"
                >
                  You haven&apos;t started any tasks yet.
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={`border-b transition-all duration-200 ${
                  isDark
                    ? "border-gray-700 hover:bg-[#202020]"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                <td className="py-4 px-6 font-medium">{task.platform}</td>
                <td className="py-4 px-6">{task.taskType}</td>
                <td
                  className="py-4 px-6 max-w-[200px] truncate"
                  title={task.targetUrl}
                >
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {["Assigned", "In Progress"].includes(task.status) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openProofModal(task.id)}
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

      {proofModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={closeProofModal}
        >
          <div
            className={`w-full max-w-md rounded-2xl border shadow-xl p-6 ${
              isDark
                ? "bg-[#181818] border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Submit Proof</h3>
            <p
              className={`text-sm mb-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Paste a link proving you completed this task (screenshot, post
              URL, etc.).
            </p>

            <form onSubmit={handleSubmitProof} className="space-y-4 relative">
              {busyId === proofModal && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/40">
                  <FaSpinner className="text-3xl text-red-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-white">
                    Submitting...
                  </span>
                </div>
              )}

              {proofError && (
                <div
                  className={`text-sm p-3 rounded-lg border ${
                    isDark
                      ? "bg-red-900/30 text-red-300 border-red-800"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {proofError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Proof link
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => {
                    setProofUrl(e.target.value);
                    if (proofError) setProofError("");
                  }}
                  placeholder="https://..."
                  autoFocus
                  disabled={busyId === proofModal}
                  className={`w-full p-3 rounded-lg border outline-none disabled:opacity-60 ${
                    proofError
                      ? "border-red-500"
                      : isDark
                      ? "bg-black border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeProofModal}
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
                  disabled={!!busyId || !proofUrl.trim()}
                  className="flex-1 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {busyId === proofModal ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}