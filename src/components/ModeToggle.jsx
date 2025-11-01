import React, { useState } from "react";
import { FaUserTie, FaUser } from "react-icons/fa";

export default function RoleToggle({ isClient, setIsClient, userModeToggle }) {

  return (
    <div
      onClick={userModeToggle}
      className={`relative w-24 h-8 flex items-center rounded-full cursor-pointer transition-all duration-300 border 
        ${isClient ? "bg-red-600 border-red-600" : "bg-white border-red-600"}
      `}
    >
      {/* Toggle circle */}
      <div
        className={`absolute w-10 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow-md transition-all duration-300 
          ${isClient ? "left-1 bg-white text-black" : "right-1 bg-red-600 text-white"}
        `}
      >
        {isClient ? <FaUserTie className="text-red-600" /> : <FaUser />}
      </div>

      {/* Labels */}
      <div className="w-full flex justify-between px-3 text-[10px] font-medium">
        <span className={isClient ? "text-white" : "text-red-600"}>Client</span>
        <span className={isClient ? "text-black" : "text-red-600"}>User</span>
      </div>
    </div>
  );
}
