"use client";

import { User } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800">App. Pengukuran CPL</h1>

      {/* User Profile */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden border">
          <img src="D:\cpl-rps\public\image.png" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
