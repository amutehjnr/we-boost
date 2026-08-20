// src/pages/userDashboard/UserDashboardHome.jsx
import React from "react";
import { FaWallet, FaCheckCircle, FaTasks, FaTrophy } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext"; // ✅ import your theme context
import UserDashboardLayout from "./UserDashboardLayout";
import API from "../../../lib/api";

export default function UserDashboardHome() {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Fetch profile, stats, and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          API.get("/users/profile"),
          API.get("/users/stats"),
        ]);

        const fetchedUser = profileRes.data.data;
        setUser(fetchedUser);
        setStats(statsRes.data.data);

        // Only fetch tasks if user is NOT a client
        if (!fetchedUser.isClient) {
          try {
            const tasksRes = await API.get("/tasks/my-tasks?limit=5");
            setTasks(tasksRes.data.data || []);
          } catch (err) {
            console.error("Error fetching tasks:", err.response || err);
            setTasks([]);
          } finally {
            setTasksLoading(false);
          }
        } else {
          // Clients don't have tasks
          setTasks([]);
          setTasksLoading(false);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  const dynamicStats = stats
    ? [
        {
          icon: <FaWallet />,
          label: "Wallet Balance",
          value: `₦${stats.walletBalance?.toLocaleString() || 0}`,
          color:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        {
          icon: <FaCheckCircle />,
          label: "Tasks Completed",
          value: stats.tasksCompleted || 0,
          color:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        },
        {
          icon: <FaTasks />,
          label: "Orders Created",
          value: stats.ordersCreated || 0,
          color:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        },
        {
          icon: <FaTrophy />,
          label: "User Level",
          value: `Level ${stats.userLevel || 1}`,
          color:
            "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        },
      ]
    : [
        {
          icon: <FaWallet />,
          label: "Wallet Balance",
          value: "₦0",
          color:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        {
          icon: <FaCheckCircle />,
          label: "Tasks Completed",
          value: 0,
          color:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        },
        {
          icon: <FaTasks />,
          label: "Orders Created",
          value: 0,
          color:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        },
        {
          icon: <FaTrophy />,
          label: "User Level",
          value: "Level 1",
          color:
            "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        },
      ];

    return (
            <div
                className={`space-y-8 transition-colors duration-300 ${theme === "dark" ? "bg-[#121212] text-gray-200" : "bg-gray-50 text-gray-800"
                    } p-6 rounded-2xl`}
            >
                <h1 className="text-2xl font-bold">
                    Welcome back, <span className="text-red-600">{user?.fullName || "User"}</span> 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Here’s an overview of your performance and earnings today.
                </p>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {dynamicStats.map((item, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-4 p-5 rounded-2xl shadow-md transition-all duration-300 ${item.color}`}
                        >
                            <div className="text-3xl">{item.icon}</div>
                            <div>
                                <p className="text-sm font-medium">{item.label}</p>
                                <h3 className="text-lg font-bold">{item.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Tasks Section */}
                <div className="bg-white dark:bg-[#181818] p-6 rounded-2xl shadow-md border dark:border-gray-700 transition-all duration-300">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                        Recent Tasks
                    </h2>
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="border-b dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            <tr>
                                <th className="py-3">Platform</th>
                                <th className="py-3">Task Type</th>
                                <th className="py-3">Reward</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b dark:border-gray-700">
                                <td className="py-3">Instagram</td>
                                <td>Follow</td>
                                <td>₦50</td>
                                <td className="text-green-500 font-medium">Completed</td>
                            </tr>
                            <tr className="border-b dark:border-gray-700">
                                <td className="py-3">TikTok</td>
                                <td>Like</td>
                                <td>₦25</td>
                                <td className="text-yellow-500 font-medium">Pending</td>
                            </tr>
                            <tr>
                                <td className="py-3">YouTube</td>
                                <td>Comment</td>
                                <td>₦40</td>
                                <td className="text-green-500 font-medium">Completed</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
    );
}
