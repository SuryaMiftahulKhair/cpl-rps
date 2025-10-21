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
const activeBg = "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 font-semibold shadow-sm";
const dropdownItemActive = "bg-indigo-50 text-indigo-700 font-medium border-l-2 border-indigo-600";

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

interface SubMenuItemProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}

// --- Komponen Reusable MenuItem ---
const MenuItem: React.FC<MenuItemProps> = ({ href, icon: Icon, children, isActive }) => (
  <Link
    href={href}
    className={`
      flex items-center gap-3 p-3 rounded-lg transition-all duration-200
      ${isActive ? activeBg : `text-gray-700 ${primaryBgHover}`}
      hover:translate-x-1
    `}
  >
    <Icon size={20} className={isActive ? primaryColor : "text-gray-500"} />
    <span className={isActive ? "font-semibold" : ""}>{children}</span>
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
      w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
      ${isActive ? activeBg : `text-gray-700 ${primaryBgHover}`}
      group
    `}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={isActive ? primaryColor : "text-gray-500 group-hover:text-indigo-500"} />
      <span className={isActive ? "font-semibold" : ""}>{children}</span>
    </div>
    <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
      <ChevronDown size={16} className="text-gray-400" />
    </div>
  </button>
);

// --- Komponen SubMenuItem ---
const SubMenuItem: React.FC<SubMenuItemProps> = ({ href, children, isActive }) => (
  <Link
    href={href}
    className={`
      block py-2.5 pl-6 pr-3 rounded-r-lg transition-all duration-200
      ${isActive 
        ? dropdownItemActive 
        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-l-2 border-transparent hover:border-indigo-300"
      }
    `}
  >
    <span className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-indigo-600" : "bg-gray-300"}`}></span>
      {children}
    </span>
  </Link>
);

export default function Sidebar() {
  const [openPenilaian, setOpenPenilaian] = useState(false);
  const [openReferensi, setOpenReferensi] = useState(false);

  const pathname = usePathname();
  const currentPath = pathname || "/";

  const isPenilaianActive = currentPath.startsWith("/penilaian");
  const isReferensiActive = currentPath.startsWith("/referensi");

  return (
    <div className="w-64 h-screen bg-white shadow-xl flex flex-col border-r border-gray-200">
      {/* --- Header / Branding --- */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-5"></div>
        <div className="relative flex flex-col items-start p-5 border-b border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
              <LayoutPanelTop size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-indigo-700 tracking-tight">
                APP-CPL
              </h1>
              <p className="text-xs font-medium text-indigo-600 mt-0.5">
                Learning Outcomes
              </p>
            </div>
          </div>
          <div className="mt-3 w-full">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-indigo-700">
                UNHAS TEKNIK AREA
              </p>
              <p className="text-xs text-gray-600 mt-0.5">Program Magister (S2)</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Navigasi --- */}
      <nav className="flex-1 p-3 space-y-1 text-sm overflow-y-auto">
        {/* Home */}
        <MenuItem href="/home" icon={Home} isActive={currentPath === "/home"}>
          Home
        </MenuItem>

        {/* Penilaian (Dropdown) */}
        <div className="pt-1">
          <DropdownToggle
            icon={FileText}
            isOpen={openPenilaian}
            onClick={() => setOpenPenilaian(!openPenilaian)}
            isActive={isPenilaianActive}
          >
            Penilaian
          </DropdownToggle>
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${openPenilaian ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}
            `}
          >
            <div className="ml-5 space-y-1 border-l-2 border-indigo-100 pl-1">
              <SubMenuItem 
                href="/penilaian/data-kelas" 
                isActive={currentPath === "/penilaian/data-kelas"}
              >
                Data Kelas
              </SubMenuItem>
              <SubMenuItem 
                href="/penilaian/data-nilai" 
                isActive={currentPath === "/penilaian/data-nilai"}
              >
                Data Nilai
              </SubMenuItem>
            </div>
          </div>
        </div>

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
        <div className="pt-1">
          <DropdownToggle
            icon={Layers}
            isOpen={openReferensi}
            onClick={() => setOpenReferensi(!openReferensi)}
            isActive={isReferensiActive}
          >
            Referensi
          </DropdownToggle>
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${openReferensi ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}
            `}
          >
            <div className="ml-5 space-y-1 border-l-2 border-indigo-100 pl-1">
              <SubMenuItem 
                href="/referensi/KP" 
                isActive={currentPath === "/referensi/KP"}
              >
                Kurikulum Prodi
              </SubMenuItem>
              <SubMenuItem 
                href="/referensi/JP" 
                isActive={currentPath === "/referensi/JP"}
              >
                Jenis Penilaian
              </SubMenuItem>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Footer / Settings --- */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <MenuItem href="/settings" icon={Settings} isActive={currentPath === "/settings"}>
          Pengaturan
        </MenuItem>
        
        {/* Version Info */}
        <div className="mt-3 px-3 py-2 text-center">
          <p className="text-xs text-gray-400">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
