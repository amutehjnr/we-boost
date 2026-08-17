// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import Logo from "../../images/we-boost.png"
import {
  FaHome,
  FaPlusCircle,
  FaList,
  FaMoneyBillWave,
  FaHistory,
  FaCogs,
  FaKey,
  FaHeadset,
  FaUser,
} from "react-icons/fa";

export default function Sidebar({ sidebarOpen }) {
  const menu = [
    { name: "Home", path: "/dashboard", icon: <FaHome /> },
    { name: "New Order", path: "/dashboard/new-order", icon: <FaPlusCircle /> },
    { name: "My Orders", path: "/dashboard/my-orders", icon: <FaList /> },
    { name: "Add Funds", path: "/dashboard/add-funds", icon: <FaMoneyBillWave /> },
    { name: "Funds History", path: "/dashboard/fund-history", icon: <FaHistory /> },
    { name: "Services", path: "/services", icon: <FaCogs /> },
    { name: "Support", path: "/support", icon: <FaHeadset /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
  ];

  return (
    <aside className={`w-64 bg-white dark:bg-[#121212] border-r dark:border-gray-800 flex-shrink-0 lg:block h-full z-30 ${sidebarOpen ? "absolute" : "hidden"}`}>
      <div className="p-4 text-center border-b dark:border-gray-700">
        <Link to="/">
          <img src={Logo} alt="WeBoost" className="mx-auto h-10" />
        </Link>
      </div>
      <nav className="mt-4 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 gap-3 transition-colors ${
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
