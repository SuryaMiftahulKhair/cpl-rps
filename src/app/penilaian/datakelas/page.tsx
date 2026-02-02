"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Loader2, RefreshCw, Plus, Calendar, BookOpen, GraduationCap, AlertCircle, X } from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";
import TahunAjaranModal from "@/app/components/TahunAjaranModal";

export enum Semester {
  GANJIL = 'GANJIL',
  GENAP = 'GENAP',
}

export interface TahunAjaran {
  id: number | string; 
  tahun: string;
  semester: Semester;
}

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

export default function DataNilaiPage() {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tahunAjaran?page=1&limit=50");
      if (!res.ok) throw new Error(await parseApiError(res));
      const json = await res.json();
      const data = Array.isArray(json) ? json : json?.data ?? [];
      setSemesterList(data);
    } catch (err: any) {
      setError(`Gagal mengambil data semester: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTahunAjaran = async (data: { tahun: string; semester: "GANJIL" | "GENAP"; }) => {
    setSubmitting(true);
    setError(null);
    const optimisticId = -Date.now();
    const optimisticItem: TahunAjaran = { 
      id: optimisticId, 
      tahun: data.tahun, 
      semester: data.semester as Semester,
    };
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
        prev.map((item) => item.id === optimisticId ? created : item)
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
    return `${semester.toUpperCase()} ${tahun}`;
  };

  // Count semesters by type
  const ganjilCount = semesterList.filter(s => s.semester === 'GANJIL').length;
  const genapCount = semesterList.filter(s => s.semester === 'GENAP').length;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        
        {/* ================= HEADER WITH GRADIENT ================= */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Data Nilai</h1>
                <p className="text-sm text-gray-600">
                  Kelola data nilai mahasiswa per semester dan tahun ajaran
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= STATS SUMMARY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Semester */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Total Semester
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {semesterList.length}
                </p>
              </div>
            </div>
          </div>

          {/* Semester Ganjil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Semester Ganjil
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {ganjilCount}
                </p>
              </div>
            </div>
          </div>

          {/* Semester Genap */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Semester Genap
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {genapCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ERROR MESSAGE ================= */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 mb-1">Terjadi Kesalahan</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ================= CONTENT SECTION ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">Daftar Semester</h2>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isLoading || submitting}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Tambah Semester</span>
                </button>
                
                <button 
                  onClick={fetchData}
                  disabled={isLoading || submitting} 
                  className="inline-flex items-center gap-2 bg-white border-2 border-indigo-200 text-indigo-700 px-5 py-2.5 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
                  ) : (
                    <RefreshCw size={18} strokeWidth={2.5} />
                  )}
                  <span>{isLoading ? "Memuat..." : "Refresh"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Loading State - Skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : semesterList.length === 0 && !error ? (
              /* Empty State - Enhanced */
              <div className="py-20">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={36} className="text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Semester
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm">
                    Mulai dengan menambahkan semester pertama untuk mengelola data nilai mahasiswa
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-md"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    Tambah Semester Pertama
                  </button>
                </div>
              </div>
            ) : (
              /* Grid Cards - Enhanced */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesterList.map((semester) => (
                  <Link
                    key={semester.id}
                    href={`/penilaian/datakelas/${semester.id}`}
                    className="block group"
                  >
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {/* Semester Badge */}
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mb-3 ${
                            semester.semester === 'GANJIL'
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {semester.semester}
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                            {semester.tahun}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">
                            Tahun Ajaran {semester.tahun}
                          </p>
                        </div>
                        
                        {/* Icon */}
                        <div className="w-12 h-12 bg-gray-100 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-all duration-200">
                          <Eye
                            size={24}
                            className="text-gray-400 group-hover:text-indigo-600 transition-colors"
                            strokeWidth={2}
                          />
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Lihat Detail
                        </span>
                        <div className="flex items-center gap-1 text-indigo-600 group-hover:gap-2 transition-all">
                          <span className="text-xs font-bold">Buka</span>
                          <Eye size={14} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <TahunAjaranModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTahunAjaran}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}