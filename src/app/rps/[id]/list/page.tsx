// src/app/rps/[id]/list/page.tsx

"use client";

import { useEffect, useState, use } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Book, ChevronLeft, ArrowRight, Layers, FileText } from "lucide-react";
import Link from "next/link";

// --- Tipe Data ---
type MataKuliah = {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number | null;
  sifat: string | null;
  _count?: {
    rps: number; // Jumlah RPS yang sudah dibuat (opsional jika API dukung)
  }
};

type Kurikulum = {
  id: number;
  nama: string;
  tahun: number;
}

export default function MataKuliahListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ID Kurikulum
  const router = useRouter();
  
  // State
  const [kurikulum, setKurikulum] = useState<Kurikulum | null>(null);
  const [matkulList, setMatkulList] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Ambil Info Kurikulum
        const kurRes = await fetch(`/api/kurikulum/${id}`);
        if (kurRes.ok) {
            const kurJson = await kurRes.json();
            // Pastikan ambil .data jika API kurikulum juga dibungkus
            setKurikulum(kurJson.data || kurJson); 
        }

        // 2. Ambil Daftar Mata Kuliah
        const mkRes = await fetch(`/api/kurikulum/${id}/matakuliah`);
        if (mkRes.ok) {
            const json = await mkRes.json();
            
            // --- PERBAIKAN DI SINI ---
            // Ambil json.data, jangan json mentah-mentah
            if (json.success && Array.isArray(json.data)) {
                setMatkulList(json.data);
            } else if (Array.isArray(json)) {
                // Jaga-jaga kalau API mengembalikan array langsung
                setMatkulList(json);
            } else {
                setMatkulList([]); // Fallback biar gak error .map
            }
            // -------------------------
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setMatkulList([]); // Safety agar tidak null
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        
        {/* Header Section */}
        <div className="mb-8">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Link href="/rps" className="hover:text-indigo-600 flex items-center">
                    <ChevronLeft size={16} /> Pilih Kurikulum
                </Link>
                <span>/</span>
                <span>Daftar Mata Kuliah</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Book size={28} className="text-indigo-600" />
                        {kurikulum?.nama || "Kurikulum"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Pilih mata kuliah untuk mengelola dokumen RPS.
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                    Tahun: {kurikulum?.tahun}
                </div>
            </div>
        </div>

        {/* Content: Grid Mata Kuliah */}
        {matkulList.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Tidak ada mata kuliah pada kurikulum ini.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {matkulList.map((mk) => (
                    <Link 
                        key={mk.id} 
                        href={`list/${mk.id}`} // Link ke Page Riwayat RPS yang baru
                        className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-indigo-50 text-indigo-700 text-xs font-mono px-2 py-1 rounded">
                                    {mk.kode_mk}
                                </span>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {mk.sks} SKS
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                                {mk.nama}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                                <span className="flex items-center gap-1">
                                    <Layers size={14}/> Sem. {mk.semester}
                                </span>
                                <span>•</span>
                                <span>{mk.sifat || "Wajib"}</span>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-medium text-indigo-600">
                            <span>Kelola RPS</span>
                            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}