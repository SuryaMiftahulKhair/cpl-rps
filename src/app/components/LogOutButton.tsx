"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Panggil API Logout (Kita buat sebentar lagi)
    // Atau pakai Server Action kalau kakak pakai Server Action
    
    // Cara Cepat: Hapus cookie lewat API Route khusus logout
    await fetch("/api/auth/logout", { method: "POST" });
    
    router.push("/login"); // Lempar ke login
    router.refresh(); // Refresh agar middleware sadar session hilang
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