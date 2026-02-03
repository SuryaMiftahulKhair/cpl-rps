"use client";

import { useEffect, useState, use } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Loader2, 
  Book, 
  ChevronLeft, 
  ArrowRight, 
  Layers, 
  FileText,
  ChevronRight,
  Calendar,
  AlertCircle,
  Award
} from "lucide-react";
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
    rps: number; 
  }
};

type Kurikulum = {
  id: number;
  nama: string;
  tahun: number;
}

export default function MataKuliahListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const prodiId = searchParams.get("prodiId");

  // State
  const [kurikulum, setKurikulum] = useState<Kurikulum | null>(null);
  const [matkulList, setMatkulList] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!prodiId) return;

      setLoading(true);
      setError(null);
      try {
        const kurRes = await fetch(`/api/kurikulum/${id}?prodiId=${prodiId}`);
        if (kurRes.ok) {
          const kurJson = await kurRes.json();
          setKurikulum(kurJson.data || kurJson); 
        }

        const mkRes = await fetch(`/api/kurikulum/${id}/matakuliah?prodiId=${prodiId}`);
        if (mkRes.ok) {
          const json = await mkRes.json();
          
          if (json.success && Array.isArray(json.data)) {
            setMatkulList(json.data);
          } else if (Array.isArray(json)) {
            setMatkulList(json);
          } else {
            setMatkulList([]); 
          }
        }
      } catch (err: any) {
        console.error("Gagal memuat data:", err);
        setError(err.message || "Gagal memuat data");
        setMatkulList([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, prodiId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen flex-col gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={2.5} />
          <p className="text-gray-600 font-semibold text-lg">Memuat Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href={`/rps?prodiId=${prodiId}`} className="hover:text-indigo-600 transition-colors">
            RPS
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Daftar Mata Kuliah</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <Book size={28} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {kurikulum?.nama || "Kurikulum"}
                </h1>
                <p className="text-sm text-gray-600 mb-3">
                  Pilih mata kuliah untuk mengelola dokumen RPS
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {kurikulum?.tahun && (
                    <div className="inline-flex items-center gap-1.5 bg-white border-2 border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold">
                      <Calendar size={14} />
                      <span>Tahun {kurikulum.tahun}</span>
                    </div>
                  )}
                  {prodiId && (
                    <div className="inline-flex items-center gap-1.5 bg-white border-2 border-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold">
                      <Layers size={14} />
                      <span>Prodi: {prodiId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link href={`/rps?prodiId=${prodiId}`}>
              <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold group">
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                <span>Kembali</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ========== STATS CARD ========== */}
        {matkulList.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 mb-6 border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-xl shadow-md">
                <FileText size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
                  Total Mata Kuliah
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {matkulList.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========== ERROR ========== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ========== CONTENT ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Book size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Daftar Mata Kuliah</h2>
                <p className="text-sm text-gray-600">
                  {matkulList.length} mata kuliah tersedia
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {matkulList.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Book size={40} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Tidak Ada Mata Kuliah
                </h3>
                <p className="text-sm text-gray-500">
                  Belum ada mata kuliah terdaftar
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {matkulList.map((mk) => (
                  <Link 
                    key={mk.id} 
                    href={`list/${mk.id}?prodiId=${prodiId}`} 
                    className="group block"
                  >
                    <div className="relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 h-full flex flex-col">
                      
                      <div className="absolute top-0 right-0 opacity-5">
                        <svg width="80" height="80" viewBox="0 0 80 80">
                          <circle cx="60" cy="20" r="30" fill="currentColor" className="text-indigo-600" />
                        </svg>
                      </div>

                      <div className="relative flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg shadow-sm">
                            {mk.kode_mk}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-2 border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                            <Award size={12} />
                            {mk.sks} SKS
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3 text-base leading-tight min-h-[40px]">
                          {mk.nama}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                          <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                            <Layers size={12} />
                            <span>Sem. {mk.semester || "-"}</span>
                          </div>
                          <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                            <span>{mk.sifat || "Wajib"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t-2 border-gray-100 pt-4 mt-auto">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText size={14} />
                            RPS
                          </span>
                          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                            <span>Kelola</span>
                            <ArrowRight 
                              size={16} 
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}