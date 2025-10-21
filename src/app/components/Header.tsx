"use client";

import { User, Bell, Search } from "lucide-react";

export default function Header() {
  // Define a placeholder for the user's name (which would come from state/context in a real app)
  const userName = "Prof. Dr. Andi"; 

  return (
    // 1. Enhanced Container: Sticky, more shadow, and a subtle border
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200 shadow-md">
      
      {/* Left Section: Breadcrumb/Title Area (Placeholder for where you might put breadcrumbs) */}
      <h1 className="text-xl font-bold text-gray-800">
        Dashboard CPL
      </h1>

      {/* Center Section: Search Bar */}
      <div className="flex-1 max-w-lg mx-8">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kelas, RPS, atau laporan..."
            className="w-full py-2 pl-10 pr-4 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Section: Utilities & User Profile */}
      <div className="flex items-center gap-4">
        
        {/* Notification Icon */}
        <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
          {/* Unread count indicator (optional) */}
          <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Vertical Separator */}
        <div className="w-px h-6 bg-gray-200"></div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{userName}</p>
            <p className="text-xs text-gray-500">Admin Program Studi</p>
          </div>
          
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center border-2 border-indigo-400">
            {/* NOTE: File path D:\cpl-rps\public\image.png won't work in a web application. 
               It should be a relative public path like /image.png */}
             {/* Fallback to User icon if image fails */}
            {/* You should use a valid public path like /image.png */}
            <User size={24} className="text-white" /> 
            {/* <img 
                src="/image.png" 
                alt="User Avatar" 
                className="w-full h-full object-cover" 
            /> 
            */}
          </div>
        </div>
      </div>
    </header>
  );
}
