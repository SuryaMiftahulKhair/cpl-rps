"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function Header() {
  // 1. State untuk data user
  const [userData, setUserData] = useState({
    nama: "Memuat...",
    role: "Admin Program Studi"
  });

  // 2. Fetch data profil yang sama dengan Sidebar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const json = await res.json();
        
        if (json.success) {
          setUserData({
            nama: json.user.nama, // Mengambil field 'nama' dari database
            role: json.user.role  // Mengambil field 'role' dari database
          });
        }
      } catch (err) {
        console.error("Gagal sinkronisasi header:", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
      
      {/* Accent line */}
      <div className="h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500" />

      <div className="flex items-center justify-end px-8 py-3">
        {/* User Profile Container */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer 
                        bg-gray-50 hover:bg-gray-100 transition-all duration-200
                        border border-gray-200 shadow-sm group">
          
          <div className="text-right leading-tight">
            {/* Nama User Dinamis */}
            <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {userData.nama}
            </p>
            {/* Role Dinamis */}
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              {userData.role}
            </p>
          </div>

          {/* Avatar with ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 blur-[1px] opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-white shadow-inner">
              <User size={20} className="text-white" />
            </div>
            {/* Status Online Indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}