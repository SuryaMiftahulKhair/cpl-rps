"use client";

import { useState, useEffect, useRef } from "react";
import { User, LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State untuk data user
  const [userData, setUserData] = useState({
    nama: "Memuat...",
    role: "Admin Program Studi"
  });

  // State untuk dropdown dan modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch data profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const json = await res.json();
        
        if (json.success) {
          setUserData({
            nama: json.user.nama,
            role: json.user.role
          });
        }
      } catch (err) {
        console.error("Gagal sinkronisasi header:", err);
      }
    };
    fetchProfile();
  }, []);

  // Close dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        // Redirect ke halaman login
        router.push('/login');
      } else {
        console.error('Logout failed');
        setIsLoggingOut(false);
      }
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  // Handle klik tombol keluar
  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Handle batal logout
  const handleCancelLogout = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        {/* Accent line */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

        <div className="flex items-center justify-end px-8 py-3">
          {/* User Profile Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl 
                        bg-gray-50 hover:bg-gray-100 transition-all duration-200
                        border border-gray-200 shadow-sm group focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
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
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 blur-[1px] opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-white shadow-inner">
                  <User size={20} className="text-white" />
                </div>
                {/* Status Online Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 
                            animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                {/* User Info Section */}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-white shadow-md">
                      <User size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{userData.nama}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">{userData.role}</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200"></div>

                {/* Logout Button */}
                <div className="p-2">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg 
                              text-red-600 hover:bg-red-50 transition-all duration-200
                              group"
                  >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    <span className="font-semibold text-sm">Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Konfirmasi Logout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm 
                      animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 
                        animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Konfirmasi Keluar</h2>
              <button
                onClick={handleCancelLogout}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <LogOut size={24} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">
                    Apakah Anda yakin ingin keluar dari akun ini?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Anda perlu login kembali untuk mengakses aplikasi.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 
                          bg-white border border-gray-300 hover:bg-gray-100 
                          transition-all duration-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-6 py-2.5 rounded-lg font-semibold text-white 
                          bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg
                          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                          flex items-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Keluar...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    <span>Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}