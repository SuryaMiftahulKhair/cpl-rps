"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Book,
  ClipboardList,
  Monitor,
  Settings,
  Layers,
  ChevronDown,
  ChevronRight,
  LayoutPanelTop,
  ScrollText,
  LucideIcon,
} from "lucide-react";

// --- Konfigurasi Warna & Style ---
const primaryColor = "text-indigo-600";
const primaryBgHover = "hover:bg-indigo-50";
const activeBg = "bg-indigo-100 text-indigo-700 font-semibold";

// --- Tipe Props ---
interface MenuItemProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isActive: boolean;
}

interface DropdownToggleProps {
  icon: LucideIcon;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  isActive: boolean;
}

// --- Komponen Reusable MenuItem ---
const MenuItem: React.FC<MenuItemProps> = ({ href, icon: Icon, children, isActive }) => (
  <Link
    href={href}
    className={`
      flex items-center gap-3 p-3 rounded-lg transition-colors duration-150
      ${isActive ? activeBg : `text-gray-700 ${primaryBgHover}`}
    `}
  >
    <Icon size={20} className={isActive ? primaryColor : "text-gray-500"} />
    {children}
  </Link>
);

// --- Komponen Reusable DropdownToggle ---
const DropdownToggle: React.FC<DropdownToggleProps> = ({
  icon: Icon,
  children,
  isOpen,
  onClick,
  isActive,
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-150
      ${isActive ? activeBg : `text-gray-700 ${primaryBgHover}`}
    `}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={isActive ? primaryColor : "text-gray-500"} />
      <span className={isActive ? "font-semibold" : ""}>{children}</span>
    </div>
    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
  </button>
);

export default function Sidebar() {
  const [openPenilaian, setOpenPenilaian] = useState(false);
  const [openReferensi, setOpenReferensi] = useState(false);

  const pathname = usePathname(); // dapatkan URL aktif
  const currentPath = pathname || "/";

  const isPenilaianActive = currentPath.startsWith("/penilaian");
  const isReferensiActive = currentPath.startsWith("/referensi");

  return (
    <div className="w-64 h-screen bg-white shadow-2xl flex flex-col border-r border-gray-200">
      {/* --- Header / Branding --- */}
      <div className="flex flex-col items-start p-5 border-b border-indigo-100 bg-indigo-50/50">
        <div className="flex items-center gap-3">
          <LayoutPanelTop size={28} className={primaryColor} />
          <h1 className="font-extrabold text-xl text-indigo-700 tracking-tight">APP-CPL</h1>
        </div>
        <p className="text-xs font-medium text-gray-500 mt-2 ml-1">
          UNHAS TEKNIK AREA (S2)
        </p>
      </div>

      {/* --- Navigasi --- */}
      <nav className="flex-1 p-3 space-y-1 text-sm">
        {/* Home */}
        <MenuItem href="/home" icon={Home} isActive={currentPath === "/home"}>
          Home
        </MenuItem>

        {/* Penilaian (Dropdown) */}
        <DropdownToggle
          icon={FileText}
          isOpen={openPenilaian}
          onClick={() => setOpenPenilaian(!openPenilaian)}
          isActive={isPenilaianActive}
        >
          Penilaian
        </DropdownToggle>
        {openPenilaian && (
          <div className="ml-5 py-1 space-y-1 border-l border-indigo-200">
            <Link
              href="/penilaian/data-kelas"
              className="block py-2 pl-6 rounded text-gray-600 transition-colors duration-150 hover:bg-indigo-50"
            >
              Data Kelas
            </Link>
            <Link
              href="/penilaian/data-nilai"
              className="block py-2 pl-6 rounded text-gray-600 transition-colors duration-150 hover:bg-indigo-50"
            >
              Data Nilai
            </Link>
          </div>
        )}

        {/* Dokumen Akreditasi */}
        <MenuItem href="/dokumen" icon={Book} isActive={currentPath === "/dokumen"}>
          Dokumen Akreditasi
        </MenuItem>

        {/* RPS Matakuliah */}
        <MenuItem href="/rps" icon={ScrollText} isActive={currentPath === "/rps"}>
          RPS Matakuliah
        </MenuItem>

        {/* Laporan */}
        <MenuItem href="/laporan" icon={ClipboardList} isActive={currentPath === "/laporan"}>
          Laporan
        </MenuItem>

        {/* Monitoring Univ */}
        <MenuItem href="/monitoring" icon={Monitor} isActive={currentPath === "/monitoring"}>
          Monitoring Univ
        </MenuItem>

        {/* Referensi (Dropdown) */}
        <DropdownToggle
          icon={Layers}
          isOpen={openReferensi}
          onClick={() => setOpenReferensi(!openReferensi)}
          isActive={isReferensiActive}
        >
          Referensi
        </DropdownToggle>
        {openReferensi && (
          <div className="ml-5 py-1 space-y-1 border-l border-indigo-200">
            <Link
              href="/referensi/KP"
              className="block py-2 pl-6 rounded text-gray-600 transition-colors duration-150 hover:bg-indigo-50"
            >
              Kurikulum Prodi
            </Link>
            <Link
              href="/referensi/JP"
              className="block py-2 pl-6 rounded text-gray-600 transition-colors duration-150 hover:bg-indigo-50"
            >
              Jenis Penilaian
            </Link>
          </div>
        )}
      </nav>

      {/* --- Footer / Settings --- */}
      <div className="p-3 border-t border-gray-100">
        <MenuItem href="/settings" icon={Settings} isActive={currentPath === "/settings"}>
          Pengaturan
        </MenuItem>
      </div>
    </div>
  );
}
