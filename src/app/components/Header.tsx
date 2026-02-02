"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, 
  LogOut, 
  X, 
  Settings, 
  HelpCircle,
  Bell,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State untuk data user
  const [userData, setUserData] = useState({
    nama: "Memuat...",
    role: "Admin Program Studi",
    email: "" // Optional: untuk tampilan email
  });

  // State untuk dropdown dan modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasNotification, setHasNotification] = useState(false); // Optional: notification badge

  // Fetch data profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const json = await res.json();
        
        if (json.success) {
          setUserData({
            nama: json.user.nama,
            role: json.user.role,
            email: json.user.email || ""
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

  // Keyboard accessibility for dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsModalOpen(false);
      }
    };

    if (isDropdownOpen || isModalOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen, isModalOpen]);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
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

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleCancelLogout = () => {
    setIsModalOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        {/* Gradient Accent Line */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500" />

        <div className="flex items-center justify-between px-6 lg:px-8 py-3">
          
          {/* Left Section - Logo/Title (Optional) */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800 hidden lg:block">
              Dashboard
            </h2>
          </div>

          {/* Right Section - Actions & Profile */}
          <div className="flex items-center gap-3">
            
            {/* Notification Button (Optional) */}
            <button 
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
              {hasNotification && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
              )}
            </button>

            {/* Help Button (Optional) */}
            <button 
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group hidden lg:flex"
              aria-label="Help"
            >
              <HelpCircle size={20} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
            </button>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300 hidden lg:block"></div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl 
                          bg-gradient-to-br from-gray-50 to-gray-100 
                          hover:from-indigo-50 hover:to-blue-50
                          border border-gray-200 hover:border-indigo-200
                          shadow-sm hover:shadow-md
                          transition-all duration-200 group 
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {/* User Info - Hidden on mobile */}
                <div className="text-right leading-tight hidden lg:block">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                    {userData.nama}
                  </p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    {userData.role}
                  </p>
                </div>

                {/* Avatar with gradient ring */}
                <div className="relative flex-shrink-0">
                  {/* Gradient ring background */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-blue-500 opacity-75 group-hover:opacity-100 blur-sm transition-opacity"></div>
                  
                  {/* Avatar container */}
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-white text-sm font-bold">
                      {getUserInitials(userData.nama)}
                    </span>
                  </div>
                  
                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                {/* Dropdown indicator */}
                <ChevronDown 
                  size={16} 
                  className={`text-gray-500 transition-transform duration-200 hidden lg:block ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 
                            animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* User Info Section - Enhanced */}
                  <div className="p-5 bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600">
                    <div className="flex items-center gap-4">
                      {/* Large avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 shadow-lg">
                          <span className="text-white text-lg font-bold">
                            {getUserInitials(userData.nama)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-base truncate">
                          {userData.nama}
                        </p>
                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium mt-0.5">
                          {userData.role}
                        </p>
                        {userData.email && (
                          <p className="text-xs text-indigo-200 truncate mt-1">
                            {userData.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    {/* Profile/Settings */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/pengaturan');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                                text-gray-700 hover:bg-indigo-50 hover:text-indigo-700
                                transition-all duration-200 group"
                      role="menuitem"
                    >
                      <Settings 
                        size={18} 
                        className="text-gray-400 group-hover:text-indigo-600 transition-colors" 
                      />
                      <span className="font-semibold text-sm">Pengaturan</span>
                    </button>

                    {/* Help Center */}
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                                text-gray-700 hover:bg-indigo-50 hover:text-indigo-700
                                transition-all duration-200 group"
                      role="menuitem"
                    >
                      <HelpCircle 
                        size={18} 
                        className="text-gray-400 group-hover:text-indigo-600 transition-colors" 
                      />
                      <span className="font-semibold text-sm">Bantuan</span>
                    </button>

                    {/* Divider */}
                    <div className="my-2 h-px bg-gray-200"></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                                text-red-600 hover:bg-red-50 
                                transition-all duration-200 group"
                      role="menuitem"
                    >
                      <LogOut 
                        size={18} 
                        className="group-hover:translate-x-0.5 transition-transform" 
                      />
                      <span className="font-semibold text-sm">Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal Konfirmasi Logout - Enhanced */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm 
                      animate-in fade-in duration-200"
            onClick={handleCancelLogout}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md 
                        animate-in zoom-in-95 slide-in-from-top-2 duration-200"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <LogOut size={20} className="text-red-600" />
                  </div>
                  <h2 id="modal-title" className="text-xl font-bold text-gray-800">
                    Konfirmasi Keluar
                  </h2>
                </div>
                <button
                  onClick={handleCancelLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  aria-label="Close modal"
                >
                  <X size={20} className="text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed mb-3">
                  Apakah Anda yakin ingin keluar dari akun <span className="font-semibold text-gray-900">{userData.nama}</span>?
                </p>
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Anda perlu login kembali untuk mengakses aplikasi.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={handleCancelLogout}
                  disabled={isLoggingOut}
                  className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 
                            bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400
                            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white 
                            bg-gradient-to-r from-red-600 to-red-700
                            hover:from-red-700 hover:to-red-800
                            shadow-md hover:shadow-lg
                            transition-all duration-200 
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center gap-2
                            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Keluar...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={18} />
                      <span>Ya, Keluar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}