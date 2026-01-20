"use client";

import { User } from "lucide-react";

export default function Header() {
  const userName = "Prof. Dr. Andi";

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
      
      {/* Accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

      <div className="flex items-center justify-end px-8 py-3">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer 
                        bg-gray-50 hover:bg-gray-100 transition-all duration-200
                        border border-gray-200 shadow-sm">
          
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-gray-800">
              {userName}
            </p>
            <p className="text-xs text-gray-500">
              Admin Program Studi
            </p>
          </div>

          {/* Avatar with ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 blur-[1px]" />
            <div className="relative w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-white">
              <User size={22} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
