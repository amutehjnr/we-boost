import React, { useEffect, useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import API from "../../../lib/api";

const PAGE_SIZE = 20;

export default function AvailableTask() {
  const { theme } = useTheme();
  const [groups, setGroups] = useState([]);
  const [claimingOrderId, setClaimingOrderId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchGroups = async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true);
    try {
      const res = await API.get(`/tasks/available?limit=${PAGE_SIZE}&page=${pageNum}`);
      const newGroups = res.data.data || [];
      setGroups((prev) => (append ? [...prev, ...newGroups] : newGroups));
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      if (!append) setGroups([]);
    } finally {
      if (append) setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGroups(1, false);
  }, []);

  const handleLoadMore = () => {
    fetchGroups(page + 1, true);
  };

  const handleClaim = async (orderId) => {
    setClaimingOrderId(orderId);
    try {
      await API.post(`/tasks/claim/${orderId}`);
      alert("Task claimed! Find it under My Tasks.");
      // Remove this order's group from the list — the user can only
      // claim one slot per order, so it's no longer relevant to them.
      setGroups((prev) => prev.filter((g) => g.orderId !== orderId));
    } catch (err) {
      console.error("Error claiming task:", err);
      alert(err?.response?.data?.message || "Failed to claim task.");
      // A stale "spots available" count (someone else grabbed the last
      // slot) is worth refreshing rather than leaving misleading.
      fetchGroups(1, false);
    } finally {
      setClaimingOrderId(null);
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
        Choose a task below, complete it, and get paid instantly. Each order lists how many spots are still open — you can claim one per order.
      </p>

      {groups.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          No tasks available right now — link a social account to unlock matching tasks, or check back soon.
        </p>
      )}

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groups.map((group) => {
          const spots = Number(group.dataValues?.availableCount ?? group.availableCount ?? 0);
          const busy = claimingOrderId === group.orderId;
          return (
            <div
              key={group.orderId}
              className={`p-6 rounded-2xl shadow-md border transition-all duration-300 hover:scale-[1.02] ${
                theme === "dark"
                  ? "bg-[#181818] border-gray-700 hover:bg-[#222]"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">{group.platform}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {group.taskType} Task
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {spots} spot{spots === 1 ? "" : "s"} open
                </span>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {group.taskType} this:
                </p>
                <p className="text-sm font-medium break-all">{group.targetUrl}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-600">
                  {group.reward ? `₦${Number(group.reward).toLocaleString()}` : "₦0"}
                </span>
                <button
                  onClick={() => handleClaim(group.orderId)}
                  disabled={busy}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-300 disabled:opacity-60"
                >
                  {busy ? "Claiming..." : "Start Task"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {page < totalPages && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}