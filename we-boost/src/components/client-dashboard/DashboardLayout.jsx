// src/pages/DashboardLayout.jsx
import React from "react";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";
import UserDashboardLayout from "../user-components/user-dashboard/UserDashboardLayout";

export default function DashboardLayout({
  children,
  setSidebarOpen,
  sidebarOpen,
  isClient,
  userModeToggle
}) {
  // If user is a CLIENT → use main dashboard layout
  if (isClient) {
    return (
      <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-[#0f0f0f]">
        
        {/* SIDEBAR */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* RIGHT CONTENT */}
        <div className="flex-1 flex flex-col">
          {/* HEADER */}
          <Header
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            isClient={isClient}
            userModeToggle={userModeToggle}
          />

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto p-0">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // If NOT client → load user dashboard layout
  return (
    <UserDashboardLayout
      isClient={isClient}
      userModeToggle={userModeToggle}
    >
      {children}
    </UserDashboardLayout>
  );
}
