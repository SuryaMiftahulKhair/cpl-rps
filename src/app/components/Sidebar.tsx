"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Home, FileText, Book, ClipboardList, Monitor, 
  Settings, Layers, ChevronDown, ChevronRight 
} from "lucide-react";

export default function Sidebar() {
  const [openPenilaian, setOpenPenilaian] = useState(false);
  const [openReferensi, setOpenReferensi] = useState(false);

  return (
    <div className="w-64 h-screen bg-white shadow-lg flex flex-col">
      {/* Logo & Title */}
      <div className="flex items-center gap-2 p-4 border-b">
        <img src="/logo-unhas.png" alt="Logo" className="h-10" />
        <div>
          <h1 className="font-bold text-sm text-gray-800">UNHAS</h1>
          <p className="text-xs text-gray-500">TEKNIK AREA (S2)</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 text-sm text-gray-700">
        {/* Home */}
        <Link href="/home" className="flex items-center gap-2 p-2 rounded hover:bg-blue-100">
          <Home size={18} /> Home
        </Link>

        {/* Penilaian (Dropdown) */}
        <button
          onClick={() => setOpenPenilaian(!openPenilaian)}
          className="w-full flex items-center justify-between gap-2 p-2 rounded hover:bg-blue-100"
        >
          <div className="flex items-center gap-2">
            <FileText size={18} /> Penilaian
          </div>
          {openPenilaian ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {openPenilaian && (
          <div className="ml-8 mt-1 space-y-1">
            <Link
              href="/penilaian/data-kelas"
              className="block p-2 rounded hover:bg-blue-50"
            >
              Data Kelas
            </Link>
            <Link
              href="/penilaian/data-nilai"
              className="block p-2 rounded hover:bg-blue-50"
            >
              Data Nilai
            </Link>
          </div>
        )}

        {/* Dokumen Akreditasi */}
        <Link href="/dokumen" className="flex items-center gap-2 p-2 rounded hover:bg-blue-100">
          <Book size={18} /> Dokumen Akreditasi
        </Link>

        {/* RPS Matakuliah */}
        <Link href="/rps" className="flex items-center gap-2 p-2 rounded hover:bg-blue-100">
          <ClipboardList size={18} /> RPS Matakuliah
        </Link>

        {/* Laporan */}
        <Link href="/laporan" className="flex items-center gap-2 p-2 rounded hover:bg-blue-100">
          <ClipboardList size={18} /> Laporan
        </Link>

        {/* Monitoring Univ */}
        <Link href="/monitoring" className="flex items-center gap-2 p-2 rounded hover:bg-blue-100">
          <Monitor size={18} /> Monitoring Univ
        </Link>

        {/* Referensi (Dropdown) */}
        <button
          onClick={() => setOpenReferensi(!openReferensi)}
          className="w-full flex items-center justify-between gap-2 p-2 rounded hover:bg-blue-100"
        >
          <div className="flex items-center gap-2">
            <Layers size={18} /> Referensi
          </div>
          {openReferensi ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {openReferensi && (
          <div className="ml-8 mt-1 space-y-1">
            <Link
              href="/referensi/kurikulum"
              className="block p-2 rounded hover:bg-blue-50"
            >
              Kurikulum Prodi
            </Link>
            <Link
              href="/referensi/jenis-penilaian"
              className="block p-2 rounded hover:bg-blue-50"
            >
              Jenis Penilaian
            </Link>
          </div>
        )}

        {/* Pengaturan */}
        <Link href="/pengaturan" className="flex items-center gap-2 p-2 rounded hover:bg-blue-100">
          <Settings size={18} /> Pengaturan
        </Link>
      </nav>
    </div>
  );
}
