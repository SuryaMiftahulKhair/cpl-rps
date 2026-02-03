"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Home, FileText, Book, Monitor, Settings, Layers, ChevronDown,
    LayoutPanelTop, ScrollText, BarChart3, UsersIcon, LucideIcon, ChevronRight,
} from "lucide-react";
import LogoutButton from "./LogOutButton";
import { useProdiStore } from "@/store/useProdiStore";

// --- Style Helpers (Enhanced) ---
const activeBg = "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold shadow-md";
const primaryBgHover = "hover:bg-indigo-50/80";
const subItemActive = "bg-indigo-100 text-indigo-700 font-semibold border-l-4 border-indigo-600";

// --- Komponen MenuItem (Enhanced with Icon Animation) ---
const MenuItem: React.FC<{ 
    href: string; 
    icon: LucideIcon; 
    children: React.ReactNode; 
    isActive: boolean;
    badge?: number; // Optional badge untuk notifikasi
}> = ({ href, icon: Icon, children, isActive, badge }) => {
    const { activeProdiId } = useProdiStore();
    const finalHref = activeProdiId ? `${href}?prodiId=${activeProdiId}` : href;

    return (
        <Link 
            href={finalHref} 
            className={`
                group flex items-center justify-between p-3 rounded-xl transition-all duration-200 
                ${isActive 
                    ? activeBg 
                    : `text-gray-700 ${primaryBgHover} hover:shadow-sm`
                }
            `}
        >
            <div className="flex items-center gap-3">
                <Icon 
                    size={20} 
                    className={`
                        transition-transform duration-200 
                        ${isActive 
                            ? "text-white" 
                            : "text-gray-500 group-hover:text-indigo-600 group-hover:scale-110"
                        }
                    `} 
                />
                <span className={isActive ? "text-white" : ""}>{children}</span>
            </div>
            
            {/* Optional Badge */}
            {badge && badge > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </Link>
    );
};

// --- Komponen SubMenuItem (Enhanced) ---
const SubMenuItem: React.FC<{ 
    href: string; 
    children: React.ReactNode; 
    isActive: boolean;
}> = ({ href, children, isActive }) => {
    const { activeProdiId } = useProdiStore();
    const finalHref = activeProdiId ? `${href}?prodiId=${activeProdiId}` : href;

    return (
        <Link 
            href={finalHref} 
            className={`
                group flex items-center gap-2 py-2.5 px-3 rounded-lg transition-all duration-200
                ${isActive 
                    ? subItemActive
                    : `text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 border-l-4 border-transparent hover:border-indigo-200`
                }
            `}
        >
            <ChevronRight 
                size={14} 
                className={`
                    transition-transform duration-200
                    ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:translate-x-0.5"}
                `}
            />
            <span className="text-sm font-medium">{children}</span>
        </Link>
    );
};

// --- Komponen CollapsibleMenu ---
const CollapsibleMenu: React.FC<{
    title: string;
    icon: LucideIcon;
    isOpen: boolean;
    onToggle: () => void;
    isPathActive: boolean;
    children: React.ReactNode;
}> = ({ title, icon: Icon, isOpen, onToggle, isPathActive, children }) => {
    return (
        <div className="space-y-1">
            <button 
                onClick={onToggle}
                className={`
                    w-full flex items-center justify-between p-3 rounded-xl 
                    transition-all duration-200 font-medium
                    ${isPathActive 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "text-gray-700 hover:bg-indigo-50/80 hover:text-indigo-700"
                    }
                `}
            >
                <div className="flex items-center gap-3">
                    <Icon 
                        size={20} 
                        className={isPathActive ? "text-indigo-600" : "text-gray-500"}
                    />
                    <span>{title}</span>
                </div>
                <ChevronRight 
                    size={16} 
                    className={`
                        transition-transform duration-300 
                        ${isOpen ? "rotate-90" : ""}
                        ${isPathActive ? "text-indigo-600" : "text-gray-400"}
                    `}
                />
            </button>
            
            {/* Animated Dropdown */}
            <div 
                className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
            >
                <div className="ml-4 mt-1 space-y-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function Sidebar() {
    const { activeProdiId, setActiveProdi, activeProdiName } = useProdiStore();
    const [openPenilaian, setOpenPenilaian] = useState(false);
    const [openLaporan, setOpenLaporan] = useState(false);
    const [openReferensi, setOpenReferensi] = useState(false);
    const [listProgram, setListProgram] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPath = pathname || "/";

    const handleProdiChange = (id: string) => {
        const found = listProgram.find(p => p.id === parseInt(id));
        if (found) {
            setActiveProdi(found.id, found.nama);
            router.push(`${pathname}?prodiId=${found.id}`);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/auth/profile');
                const result = await res.json();
                if (result.success) {
                    const prodies = result.user.programStudis;
                    setListProgram(prodies);
                    
                    const urlId = searchParams.get("prodiId");
                    if (urlId) {
                        const found = prodies.find((p: any) => p.id === parseInt(urlId));
                        if (found) setActiveProdi(found.id, found.nama);
                    } else if (!activeProdiId && prodies.length > 0) {
                        setActiveProdi(prodies[0].id, prodies[0].nama);
                    }
                }
            } catch (err) { 
                console.error(err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchProfile();
    }, []);

    // Auto-expand menu based on current path
    useEffect(() => {
        if (currentPath.startsWith("/penilaian")) setOpenPenilaian(true);
        if (currentPath.startsWith("/laporan")) setOpenLaporan(true);
        if (currentPath.startsWith("/referensi")) setOpenReferensi(true);
    }, [currentPath]);

    return (
        <div className="w-72 h-screen sticky top-0 bg-white shadow-2xl flex flex-col border-r border-gray-100">
            
            {/* ========== HEADER SECTION - Enhanced ========== */}
            <div className="p-6 border-b border-indigo-100 bg-linear-to-br from-indigo-500 via-indigo-600 to-blue-600">
                {/* Logo & Title */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/30">
                        <LayoutPanelTop size={26} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-2xl text-white tracking-tight">
                            APP-CPL
                        </h1>
                        <p className="text-xs text-indigo-100 font-medium">
                            Sistem Penilaian CPL
                        </p>
                    </div>
                </div>
                
                {/* Program Studi Selector - Enhanced */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-indigo-100 uppercase tracking-wide">
                        Program Studi
                    </label>
                    <div className="relative">
                        <select 
                            value={activeProdiId || ""} 
                            onChange={(e) => handleProdiChange(e.target.value)}
                            disabled={loading}
                            className="
                                w-full bg-white/95 backdrop-blur-sm
                                border-2 border-white/30 rounded-xl 
                                p-3 pr-10
                                text-sm font-bold text-indigo-900 
                                focus:ring-2 focus:ring-white/50 focus:border-white
                                outline-none transition-all duration-200
                                shadow-lg hover:shadow-xl
                                disabled:opacity-50 disabled:cursor-not-allowed
                                appearance-none cursor-pointer
                            "
                        >
                            {loading ? (
                                <option>Memuat...</option>
                            ) : listProgram.length === 0 ? (
                                <option>Tidak ada prodi</option>
                            ) : (
                                listProgram.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama}
                                    </option>
                                ))
                            )}
                        </select>
                        
                        {/* Custom Dropdown Arrow */}
                        <ChevronDown 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" 
                            size={18}
                        />
                    </div>
                    
                    {/* Active Prodi Info */}
                    {activeProdiName && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-white font-medium truncate">
                                Aktif: {activeProdiName}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== NAVIGATION MENU ========== */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                
                {/* Home */}
                <MenuItem 
                    href="/home" 
                    icon={Home} 
                    isActive={currentPath === "/home"}
                >
                    Home
                </MenuItem>

                {/* Penilaian - Collapsible */}
                <CollapsibleMenu
                    title="Penilaian"
                    icon={FileText}
                    isOpen={openPenilaian}
                    onToggle={() => setOpenPenilaian(!openPenilaian)}
                    isPathActive={currentPath.startsWith("/penilaian")}
                >
                    <SubMenuItem 
                        href="/penilaian/datakelas" 
                        isActive={currentPath === "/penilaian/datakelas"}
                    >
                        Data Kelas
                    </SubMenuItem>
                    <SubMenuItem 
                        href="/penilaian/portofolio" 
                        isActive={currentPath === "/penilaian/portofolio"}
                    >
                        Portofolio
                    </SubMenuItem>
                </CollapsibleMenu>

                {/* Dokumen Akreditasi */}
                <MenuItem 
                    href="/dokumen" 
                    icon={Book} 
                    isActive={currentPath === "/dokumen"}
                >
                    Dokumen Akreditasi
                </MenuItem>

                {/* RPS Matakuliah */}
                <MenuItem 
                    href="/rps" 
                    icon={ScrollText} 
                    isActive={currentPath === "/rps"}
                >
                    RPS Matakuliah
                </MenuItem>

                {/* Laporan - Collapsible */}
                <CollapsibleMenu
                    title="Laporan"
                    icon={BarChart3}
                    isOpen={openLaporan}
                    onToggle={() => setOpenLaporan(!openLaporan)}
                    isPathActive={currentPath.startsWith("/laporan")}
                >
                    <SubMenuItem 
                        href="/laporan/cpl-prodi" 
                        isActive={currentPath === "/laporan/cpl-prodi"}
                    >
                        CPL Prodi
                    </SubMenuItem>
                    <SubMenuItem 
                        href="/laporan/cpl-mhswa" 
                        isActive={currentPath === "/laporan/cpl-mhswa"}
                    >
                        CPL Mahasiswa
                    </SubMenuItem>
                    <SubMenuItem 
                        href="/laporan/rekap-metode" 
                        isActive={currentPath.startsWith("/laporan/rekap-metode")}
                    >
                        Rekap Metode
                    </SubMenuItem>
                </CollapsibleMenu>

                {/* Monitoring Universitas */}
                <MenuItem 
                    href="/monitoring" 
                    icon={Monitor} 
                    isActive={currentPath === "/monitoring"}
                >
                    Monitoring Univ
                </MenuItem>

                {/* Referensi - Collapsible */}
                <CollapsibleMenu
                    title="Referensi"
                    icon={Layers}
                    isOpen={openReferensi}
                    onToggle={() => setOpenReferensi(!openReferensi)}
                    isPathActive={currentPath.startsWith("/referensi")}
                >
                    <SubMenuItem 
                        href="/referensi/KP" 
                        isActive={currentPath.startsWith("/referensi/KP")}
                    >
                        Kurikulum Prodi
                    </SubMenuItem>
                    <SubMenuItem 
                        href="/referensi/JP" 
                        isActive={currentPath === "/referensi/JP"}
                    >
                        Jenis Penilaian
                    </SubMenuItem>
                    <SubMenuItem 
                        href="/referensi/mahasiswa" 
                        isActive={currentPath === "/referensi/mahasiswa"}
                    >
                        Mahasiswa
                    </SubMenuItem>
                </CollapsibleMenu>

                {/* Manajemen User */}
                <MenuItem 
                    href="/manajemenuser" 
                    icon={UsersIcon} 
                    isActive={currentPath === "/manajemenuser"}
                >
                    Manajemen User
                </MenuItem>
            </nav>

            {/* ========== FOOTER SECTION ========== */}
            <div className="p-4 border-t border-gray-100 bg-linear-to-r from-gray-50 to-gray-100 space-y-2">
                {/* Settings */}
                <MenuItem 
                    href="/pengaturan" 
                    icon={Settings} 
                    isActive={currentPath === "/pengaturan"}
                >
                    Pengaturan
                </MenuItem>
                
                {/* Logout Button (if needed) */}
                {/* <LogoutButton /> */}
            </div>
        </div>
    );
}