"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
        window.location.href = "/login"; // Redirect ke login
    }
};

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 mt-4 hover:bg-red-50 rounded-lg w-full transition-all"
    >
      <LogOut size={20} />
      <span>Keluar / Ganti Akun</span>
    </button>
  );
}