import React, { useEffect, useState, useRef } from "react";
import { FaSpinner, FaImage, FaTimes } from "react-icons/fa";
import API from "../../../lib/api";
import { useTheme } from "../../../context/ThemeContext";

export default function MyTasks() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [proofModal, setProofModal] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [proofError, setProofError] = useState("");
  const fileInputRef = useRef(null);
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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openProofModal = (taskId) => {
    setProofModal(taskId);
    setProofFile(null);
    setPreviewUrl("");
    setProofError("");
  };

  const closeProofModal = () => {
    if (busyId) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProofModal(null);
    setProofFile(null);
    setPreviewUrl("");
    setProofError("");
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowed.includes(file.type)) {
      setProofError("Only image files are allowed (jpg, png, webp, gif).");
      setProofFile(null);
      setPreviewUrl("");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProofError("Image must be 5MB or smaller.");
      setProofFile(null);
      setPreviewUrl("");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProofError("");
    setProofFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProofFile(null);
    setPreviewUrl("");
    setProofError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitProof = async (e) => {
    e?.preventDefault?.();
    if (!proofModal) return;

    if (!proofFile) {
      setProofError("Please select a screenshot image.");
      return;
    }

    setProofError("");
    setBusyId(proofModal);
    try {
      const formData = new FormData();
      formData.append("proof", proofFile);
      await API.post(`/tasks/${proofModal}/submit`, formData);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setProofModal(null);
      setProofFile(null);
      setPreviewUrl("");
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

  const ActionButtons = ({ task }) =>
    ["Assigned", "In Progress"].includes(task.status) ? (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => openProofModal(task.id)}
          disabled={busyId === task.id}
          className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition disabled:opacity-60"
        >
          Submit Proof
        </button>
        <button
          onClick={() => handleCancel(task.id)}
          disabled={busyId === task.id}
          className="text-xs sm:text-sm text-gray-500 hover:text-red-600 px-2 py-2"
        >
          Cancel
        </button>
      </div>
    ) : null;

  return (
    <div
      className={`transition-colors duration-300 ${
        isDark ? "bg-[#121212] text-gray-200" : "bg-gray-50 text-gray-800"
      } min-h-screen p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl`}
    >
      <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
        My <span className="text-red-600">Tasks</span> 📋
      </h1>
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-8">
        Track your task history, progress, and payments in one place.
      </p>

      {/* Mobile / tablet cards */}
      <div className="lg:hidden space-y-3">
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            You haven&apos;t started any tasks yet.
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-xl border p-4 shadow-sm ${
              isDark
                ? "bg-[#181818] border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-semibold text-base truncate">
                  {task.platform}
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {task.taskType}
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </div>

            <div
              className={`text-xs sm:text-sm space-y-1.5 mb-3 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <p className="truncate" title={task.targetUrl}>
                <span className="font-medium text-gray-500">Target: </span>
                {task.targetUrl}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <p>
                  <span className="font-medium text-gray-500">Reward: </span>
                  <span className="font-semibold text-red-600">
                    ₦{Number(task.reward).toLocaleString()}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-gray-500">Date: </span>
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

            <ActionButtons task={task} />
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div
        className={`hidden lg:block overflow-x-auto rounded-2xl shadow-md border ${
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
                  {task.createdAt
                    ? new Date(task.createdAt).toDateString()
                    : ""}
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
                  <ActionButtons task={task} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proof modal — responsive */}
      {proofModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60"
          onClick={closeProofModal}
        >
          <div
            className={`w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border shadow-xl p-4 sm:p-6 ${
              isDark
                ? "bg-[#181818] border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden w-10 h-1 rounded-full bg-gray-500/40 mx-auto mb-3" />

            <h3 className="text-base sm:text-lg font-bold mb-1">
              Submit Proof
            </h3>
            <p
              className={`text-xs sm:text-sm mb-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Upload a screenshot that shows you completed this task (max 5MB).
            </p>

            <form onSubmit={handleSubmitProof} className="space-y-4 relative">
              {busyId === proofModal && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/40">
                  <FaSpinner className="text-3xl text-red-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-white">
                    Uploading screenshot...
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
                <label className="block text-sm font-medium mb-2">
                  Screenshot
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  capture="environment"
                  onChange={onFileChange}
                  disabled={busyId === proofModal}
                  className="hidden"
                  id="proof-file-input"
                />
                {!previewUrl ? (
                  <label
                    htmlFor="proof-file-input"
                    className={`flex flex-col items-center justify-center gap-2 w-full min-h-[120px] sm:min-h-[140px] rounded-xl border-2 border-dashed cursor-pointer transition ${
                      isDark
                        ? "border-gray-600 hover:border-red-500 bg-black/40"
                        : "border-gray-300 hover:border-red-500 bg-gray-50"
                    }`}
                  >
                    <FaImage className="text-2xl text-red-500" />
                    <span className="text-sm font-medium text-center px-2">
                      Tap to choose or take screenshot
                    </span>
                    <span
                      className={`text-xs text-center px-2 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      JPG, PNG, WEBP or GIF · max 5MB
                    </span>
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-gray-700">
                    <img
                      src={previewUrl}
                      alt="Proof preview"
                      className="w-full max-h-48 sm:max-h-64 object-contain bg-black/20"
                    />
                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={busyId === proofModal}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white hover:bg-red-600 transition"
                      title="Remove"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={closeProofModal}
                  disabled={!!busyId}
                  className={`flex-1 py-3 sm:py-2.5 rounded-lg font-medium border transition disabled:opacity-60 ${
                    isDark
                      ? "border-gray-600 hover:bg-gray-800"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!busyId || !proofFile}
                  className="flex-1 py-3 sm:py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {busyId === proofModal ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Submit Screenshot"
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