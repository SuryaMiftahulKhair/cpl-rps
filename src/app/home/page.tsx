"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  HiOutlineHome,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="p-8 space-y-6">

          {/* Title */}
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 border-b pb-3">
            <HiOutlineHome className="w-6 h-6 text-indigo-600" />
            Dashboard Utama
          </div>

          {/* ALERT */}
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 flex gap-4 text-red-800 shadow-sm">
            <HiOutlineExclamationTriangle className="w-7 h-7 mt-1 text-red-600 shrink-0" />
            
            <div>
              <h4 className="text-lg font-semibold text-red-900 mb-1">
                Peringatan Penting
              </h4>
              <p className="text-sm leading-relaxed">
                Pastikan <strong>Semester</strong> pada Data Kelas telah
                disinkronkan sebelum melakukan permintaan kepada dosen untuk
                menginput nilai.
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
