import React, { useEffect, useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import API from "../../../lib/api";

export default function AvailableTask() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [startingId, setStartingId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks/available?limit=20");
      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStart = async (taskId) => {
    setStartingId(taskId);
    try {
      await API.post(`/tasks/${taskId}/start`);
      alert("Task started! Find it under My Tasks.");
      // Remove it from the available list since it's now claimed
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Error starting task:", err);
      alert(err?.response?.data?.message || "Failed to start task.");
    } finally {
      setStartingId(null);
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
        Available <span className="text-red-600">Tasks</span> 🎯
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Choose a task below, complete it, and get paid instantly.
      </p>

      {tasks.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          No tasks available right now — link a social account to unlock matching tasks, or check back soon.
        </p>
      )}

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-6 rounded-2xl shadow-md border transition-all duration-300 hover:scale-[1.02] ${
              theme === "dark"
                ? "bg-[#181818] border-gray-700 hover:bg-[#222]"
                : "bg-white border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold">{task.platform}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {task.taskType} Task
                </p>
              </div>
            </div>

            <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
              {task.order?.service || task.description || ""}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-600">
                {task.reward ? `₦${Number(task.reward).toLocaleString()}` : "₦0"}
              </span>
              <button
                onClick={() => handleStart(task.id)}
                disabled={startingId === task.id}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-300 disabled:opacity-60"
              >
                {startingId === task.id ? "Starting..." : "Start Task"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}