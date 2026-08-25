import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChartBar, FaUsers, FaMoneyCheckAlt } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function AdminLayout({ children }) {
  const { theme } = useTheme();
  const location = useLocation();

  const links = [
    { path: "/admin", label: "Overview", icon: <FaChartBar /> },
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
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}