"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Eye, 
  Plus, 
  RefreshCw, 
  Loader2, 
  Calendar,
  BarChart3,
  ChevronRight,
  BookOpen,
  TrendingUp
} from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";
import TahunAjaranModal from "@/app/components/TahunAjaranModal";

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {}
  
  if (parsed?.error) {
    if (Array.isArray(parsed.error)) return parsed.error.join(", ");
    if (typeof parsed.error === "string") return parsed.error;
    if (Array.isArray(parsed.error.issues)) { 
      return parsed.error.issues.map((i: any) => `${i.path[0]}: ${i.message}`).join(", ");
    }
    return JSON.stringify(parsed.error);
  }
  return text || `HTTP ${res.status}`;
}

interface TahunAjaran {
  id: number;
  tahun: string;
  semester: "GANJIL" | "GENAP";
}

export default function DataKelasPage() {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tahunAjaran?page=1&limit=50"); 
      if (!res.ok) throw new Error(await parseApiError(res));

      const json = await res.json();
      const data = Array.isArray(json) ? json : json?.data ?? [];

      setSemesterList(data);
    } catch (err: any) {
      console.error("Fetch Tahun Ajaran error:", err);
      setError(err?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTahunAjaran = async (data: { tahun: string; semester: "GANJIL" | "GENAP" }) => {
    setSubmitting(true);
    setError(null);

    const optimisticId = -Date.now(); 
    const optimisticItem: TahunAjaran = { id: optimisticId, ...data };
    setSemesterList((prev) => [optimisticItem, ...prev].sort((a, b) => 
      b.tahun.localeCompare(a.tahun) || b.semester.localeCompare(a.semester)
    ));
    setIsModalOpen(false);

    try {
      const res = await fetch("/api/tahunAjaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await parseApiError(res));

      const created = await res.json();

      setSemesterList((prev) =>
        prev.map((item) =>
          item.id === optimisticId ? created : item
        )
      );

    } catch (err: any) {
      console.error("Create Tahun Ajaran error:", err);
      setError(err?.message || "Gagal menambahkan. Coba lagi.");
      setSemesterList((prev) => prev.filter((p) => p.id !== optimisticId));
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatNamaSemester = (tahun: string, semester: "GANJIL" | "GENAP") => {
    return `${semester} ${tahun}`;
  };

  const getSemesterIcon = (semester: "GANJIL" | "GENAP") => {
    return semester === "GANJIL" 
      ? { bg: "from-blue-50 to-indigo-50", border: "border-blue-200", text: "text-blue-700", icon: "bg-blue-500" }
      : { bg: "from-orange-50 to-amber-50", border: "border-orange-200", text: "text-orange-700", icon: "bg-orange-500" };
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Laporan</span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Rekap Kuisioner Pembelajaran</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <BarChart3 size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Rekap Kuisioner Pembelajaran
                </h1>
                <p className="text-sm text-gray-600">
                  Lihat hasil kuisioner pembelajaran per semester
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading || submitting}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <RefreshCw 
                  size={18} 
                  className={loading ? "animate-spin" : ""} 
                />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading || submitting}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>Tambah Semester</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========== ERROR ALERT ========== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ========== MAIN CONTENT ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6">
          
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Pilih Semester</h2>
              <p className="text-sm text-gray-600">
                {loading 
                  ? "Memuat..." 
                  : `${semesterList.length} semester tersedia`
                }
              </p>
            </div>
          </div>

          {/* ========== SEMESTER GRID ========== */}
          {loading ? (
            /* Loading State - Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 rounded-2xl h-32"></div>
                </div>
              ))}
            </div>
          ) : semesterList.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Calendar size={40} className="text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Belum Ada Data Semester
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Tambahkan semester pertama untuk mulai melihat rekap kuisioner pembelajaran.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus size={20} strokeWidth={2.5} />
                Tambah Semester Pertama
              </button>
            </div>
          ) : (
            /* Semester Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {semesterList.map((semester) => {
                const colors = getSemesterIcon(semester.semester);
                
                return (
                  <Link
                    key={semester.id} 
                    href={`/laporan/rekap-metode/${semester.id}`}
                    className="group block"
                  >
                    <div className={`
                      relative bg-gradient-to-br ${colors.bg} 
                      border-2 ${colors.border} rounded-2xl p-6 
                      hover:shadow-xl hover:scale-[1.02] 
                      transition-all duration-200 cursor-pointer
                      overflow-hidden
                    `}>
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 opacity-10">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="80" cy="20" r="40" fill="currentColor" className={colors.text} />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="relative">
                        {/* Semester Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`
                            inline-flex items-center gap-2 px-3 py-1.5 
                            ${colors.icon} text-white rounded-lg 
                            text-xs font-bold uppercase tracking-wide shadow-sm
                          `}>
                            <Calendar size={14} />
                            <span>{semester.semester}</span>
                          </div>
                          
                          {/* View Icon */}
                          <div className="p-2 bg-white/50 backdrop-blur-sm rounded-lg group-hover:bg-white transition-all">
                            <Eye 
                              size={20} 
                              className={`${colors.text} group-hover:scale-110 transition-transform`}
                            />
                          </div>
                        </div>

                        {/* Tahun */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {semester.tahun}
                        </h3>
                        
                        {/* Subtitle */}
                        <p className="text-sm text-gray-600 font-medium mb-4">
                          Tahun Ajaran {semester.tahun}
                        </p>

                        {/* Action Hint */}
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
                          <span>Lihat Rekap</span>
                          <ChevronRight 
                            size={16} 
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>

                      {/* Hover Border Glow */}
                      <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ========== OPTIONAL: QUICK STATS ========== */}
        {/* Uncomment if you want to show statistics */}
        {/*
        {semesterList.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Semester</p>
                  <p className="text-2xl font-bold text-blue-900">{semesterList.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Kuisioner Aktif</p>
                  <p className="text-2xl font-bold text-indigo-900">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Response Rate</p>
                  <p className="text-2xl font-bold text-green-900">0%</p>
                </div>
              </div>
            </div>
          </div>
        )}
        */}
      </div>
      
      {/* ========== MODAL ========== */}
      <TahunAjaranModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTahunAjaran}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}