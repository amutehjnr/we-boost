import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChartBar, FaUsers, FaMoneyCheckAlt, FaShoppingCart, FaTasks, FaCreditCard, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";

export default function AdminLayout({ children }) {
  const { theme } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    window.location.href = "/admin-login";
  };

  const links = [
    { path: "/admin", label: "Overview", icon: <FaChartBar /> },
    { path: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { path: "/admin/tasks", label: "Tasks", icon: <FaTasks /> },
    { path: "/admin/payments", label: "Payments", icon: <FaCreditCard /> },
    { path: "/admin/withdrawals", label: "Withdrawals", icon: <FaMoneyCheckAlt /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers /> },
  ];

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"}`}>
      <aside className={`w-56 shrink-0 border-r p-5 ${theme === "dark" ? "bg-[#141414] border-gray-800" : "bg-white border-gray-200"}`}>
        <h2 className="text-lg font-bold mb-6 text-red-600">Admin Panel</h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === link.path
                  ? "bg-red-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-6 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}