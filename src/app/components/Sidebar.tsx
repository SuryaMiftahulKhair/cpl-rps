"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Home, FileText, Book, Monitor, Settings, Layers, ChevronDown,
    LayoutPanelTop, ScrollText, BarChart3, UsersIcon, LucideIcon,
} from "lucide-react";
import LogoutButton from "./LogOutButton";
import { useProdiStore } from "@/store/useProdiStore";

// --- Style Helpers ---
const activeBg = "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 font-semibold shadow-sm";
const primaryBgHover = "hover:bg-indigo-50";

// --- Komponen MenuItem (Otomatis Handle prodiId tanpa dobel tanda tanya) ---
const MenuItem: React.FC<{ href: string; icon: LucideIcon; children: React.ReactNode; isActive: boolean }> = ({ href, icon: Icon, children, isActive }) => {
    const { activeProdiId } = useProdiStore();
    // PERBAIKAN: Gunakan prodiId (I BESAR) dan hindari double tanda tanya
    const finalHref = activeProdiId ? `${href}?prodiId=${activeProdiId}` : href;

    return (
        <Link href={finalHref} className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive ? activeBg : `text-gray-700 ${primaryBgHover}`} hover:translate-x-1`}>
            <Icon size={20} className={isActive ? "text-indigo-600" : "text-gray-500"} />
            <span>{children}</span>
        </Link>
    );
};

// --- Komponen SubMenuItem ---
const SubMenuItem: React.FC<{ href: string; children: React.ReactNode; isActive: boolean }> = ({ href, children, isActive }) => {
    const { activeProdiId } = useProdiStore();
    const finalHref = activeProdiId ? `${href}?prodiId=${activeProdiId}` : href;

    return (
        <Link href={finalHref} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${isActive ? activeBg : `text-gray-600 ${primaryBgHover}`} hover:translate-x-1 ml-2`}>
            <span className="text-xs">{children}</span>
        </Link>
    );
};

export default function Sidebar() {
    const { activeProdiId, setActiveProdi } = useProdiStore();
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
            // Push URL bersih: path + ?prodiId=...
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
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (currentPath.startsWith("/penilaian")) setOpenPenilaian(true);
        if (currentPath.startsWith("/laporan")) setOpenLaporan(true);
        if (currentPath.startsWith("/referensi")) setOpenReferensi(true);
    }, [currentPath]);

    return (
        <div className="w-64 h-screen sticky top-0 bg-white shadow-xl flex flex-col border-r border-gray-200">
            <div className="p-5 border-b border-indigo-100 bg-indigo-50/30">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-md"><LayoutPanelTop size={24} className="text-white" /></div>
                    <div><h1 className="font-extrabold text-xl text-indigo-700 tracking-tight uppercase">APP-CPL</h1></div>
                </div>
                
                <select 
                    value={activeProdiId || ""} 
                    onChange={(e) => handleProdiChange(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-xs font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    {listProgram.map(p => <option key={p.id} value={p.id}> {p.nama}</option>)}
                </select>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {/* Cukup tulis path saja, prodiId akan nempel otomatis lewat komponen MenuItem */}
                <MenuItem href="/home" icon={Home} isActive={currentPath === "/home"}>Home</MenuItem>

                <div className="pt-1">
                    <button onClick={() => setOpenPenilaian(!openPenilaian)} className={`w-full flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-indigo-50 ${currentPath.startsWith("/penilaian") ? "bg-indigo-50" : ""}`}>
                        <div className="flex items-center gap-3"><FileText size={20} /><span className="font-medium">Penilaian</span></div>
                        <ChevronDown size={16} className={`transition-transform ${openPenilaian ? "rotate-180" : ""}`} />
                    </button>
                    {openPenilaian && (
                        <div className="ml-4 mt-1 border-l-2 border-indigo-100 pl-2 space-y-1">
                            <SubMenuItem href="/penilaian/datakelas" isActive={currentPath === "/penilaian/datakelas"}>Data Kelas</SubMenuItem>
                            <SubMenuItem href="/penilaian/portofolio" isActive={currentPath === "/penilaian/portofolio"}>Portofolio</SubMenuItem>
                        </div>
                    )}
                </div>

                <MenuItem href="/dokumen" icon={Book} isActive={currentPath === "/dokumen"}>Dokumen Akreditasi</MenuItem>
                <MenuItem href="/rps" icon={ScrollText} isActive={currentPath === "/rps"}>RPS Matakuliah</MenuItem>

                <div className="pt-1">
                    <button onClick={() => setOpenLaporan(!openLaporan)} className={`w-full flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-indigo-50 ${currentPath.startsWith("/laporan") ? "bg-indigo-50" : ""}`}>
                        <div className="flex items-center gap-3"><BarChart3 size={20} /><span className="font-medium">Laporan</span></div>
                        <ChevronDown size={16} className={`transition-transform ${openLaporan ? "rotate-180" : ""}`} />
                    </button>
                    {openLaporan && (
                        <div className="ml-4 mt-1 border-l-2 border-indigo-100 pl-2 space-y-1">
                            <SubMenuItem href="/laporan/cpl-prodi" isActive={currentPath === "/laporan/cpl-prodi"}>CPL Prodi</SubMenuItem>
                            <SubMenuItem href="/laporan/cpl-mhswa" isActive={currentPath === "/laporan/cpl-mhswa"}>CPL Mahasiswa</SubMenuItem>
                            <SubMenuItem href="/laporan/rekap-metode" isActive={currentPath.startsWith("/laporan/rekap-metode")}>Rekap Metode</SubMenuItem>
                        </div>
                    )}
                </div>

                <MenuItem href="/monitoring" icon={Monitor} isActive={currentPath === "/monitoring"}>Monitoring Univ</MenuItem>

                <div className="pt-1">
                    <button onClick={() => setOpenReferensi(!openReferensi)} className={`w-full flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-indigo-50 ${currentPath.startsWith("/referensi") ? "bg-indigo-50" : ""}`}>
                        <div className="flex items-center gap-3"><Layers size={20} /><span className="font-medium">Referensi</span></div>
                        <ChevronDown size={16} className={`transition-transform ${openReferensi ? "rotate-180" : ""}`} />
                    </button>
                    {openReferensi && (
                        <div className="ml-4 mt-1 border-l-2 border-indigo-100 pl-2 space-y-1">
                            <SubMenuItem href="/referensi/KP" isActive={currentPath.startsWith("/referensi/KP")}>Kurikulum Prodi</SubMenuItem>
                            <SubMenuItem href="/referensi/JP" isActive={currentPath === "/referensi/JP"}>Jenis Penilaian</SubMenuItem>
                        </div>
                    )}
                </div>

                <MenuItem href="/manajemenuser" icon={UsersIcon} isActive={currentPath === "/manajemenuser"}>Manajemen User</MenuItem>
            </nav>

            <div className="p-3 border-t border-gray-100 bg-gray-50/50 mt-auto">
                <MenuItem href="/pengaturan" icon={Settings} isActive={currentPath === "/pengaturan"}>Pengaturan</MenuItem>
            </div>
        </div>
    );
}