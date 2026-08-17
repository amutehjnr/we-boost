// src/pages/DashboardLayout.jsx
import React, { useState } from "react";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";
import UserDashboardLayout from "../user-components/user-dashboard/UserDashboardLayout";

export default function DashboardLayout({ children, setSidebarOpen, sidebarOpen, isClient, userModeToggle }) {

  return (
    <>
    { isClient ? (
    <div className="h-screen flex overflow-hidden">
      <div className="mt-12 lg:mt-0"><Sidebar sidebarOpen={sidebarOpen} /></div>
      <div className="flex-1 flex flex-col">
        <Header setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} isClient={isClient} userModeToggle={userModeToggle} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
          {children}
        </main>
      </div>
    </div>
    ) : (
      <UserDashboardLayout isClient={isClient} userModeToggle={userModeToggle} />
    )}
    </>
  );
}
