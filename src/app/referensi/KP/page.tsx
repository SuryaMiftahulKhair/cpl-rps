"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Layers, 
  Plus, 
  Calendar, 
  Loader2, 
  Target, 
  BookOpen,
  ChevronRight
} from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";
import { KurikulumModal } from "@/app/components/KurikulumModal"; 
import { useSearchParams } from "next/navigation";

interface Kurikulum {
  id: string | number;
  nama: string;
  tahun: number; 
  _count?: {
    cpl: number;
    mataKuliah: number;
  }
}

export default function KurikulumProdiPage() {
  const [kurikulums, setKurikulums] = useState<Kurikulum[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId"); 

  // --- Fungsi Fetch Data ---
  const loadData = useCallback(async () => {
    if (!prodiId) return; 

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/kurikulum?prodiId=${prodiId}`); 
      const json = await res.json();

      if (json.success) {
        setKurikulums(json.data);
      } else {
        throw new Error(json.error || "Gagal memuat data");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err?.message || "Gagal koneksi ke server");
    } finally {
      setLoading(false);
    }
  }, [prodiId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Handle Tambah ---
  const handleAddKurikulum = async (nama: string, tahun: number) => {
    setSubmitting(true);
    setError(null);

    try {
      const payload = { 
        nama, 
        tahun, 
        prodiId: Number(prodiId)
      };
      
      const res = await fetch("/api/kurikulum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan");
      }

      setIsModalOpen(false);
      loadData();

      // TODO: Add toast notification here
      // toast.success('Kurikulum berhasil ditambahkan!');

    } catch (err: any) {
      console.error("Create error:", err);
      setError(err?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Referensi</span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Kurikulum Prodi</span>
        </div>

        {/* ========== HEADER - Enhanced with Gradient Background ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            
            {/* Left: Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <Layers size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Kurikulum Program Studi
                </h1>
                <p className="text-sm text-gray-600">
                  S1 Teknik Informatika • 
                  <span className="font-semibold text-indigo-700 ml-1">
                    {kurikulums.length} Kurikulum Aktif
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Primary CTA */}
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!prodiId}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Tambah Kurikulum</span>
            </button>
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

        {/* ========== TABLE - Modern Design ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              
              {/* Table Header */}
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tahun
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Kurikulum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statistik
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                
                {/* ========== LOADING STATE - Skeleton ========== */}
                {loading ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5">
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-14 bg-gray-200 rounded-xl w-24"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-48"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-3">
                            <div className="h-9 bg-gray-200 rounded-lg w-20"></div>
                            <div className="h-9 bg-gray-200 rounded-lg w-20"></div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2 justify-end">
                            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) 
                
                : kurikulums.length === 0 ? (
                  /* ========== EMPTY STATE ========== */
                  <tr>
                    <td colSpan={5} className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                          <Layers size={40} className="text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Belum Ada Kurikulum
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-md">
                          Mulai dengan menambahkan kurikulum pertama untuk program studi ini. 
                          Anda dapat mengelola Visi, Misi, CPL, dan Mata Kuliah setelahnya.
                        </p>
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <Plus size={20} strokeWidth={2.5} />
                          Tambah Kurikulum Pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* ========== DATA ROWS ========== */
                  kurikulums.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="group hover:bg-indigo-50/40 transition-all duration-150"
                    >
                      {/* No */}
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-gray-500">
                          {index + 1}
                        </span>
                      </td>

                      {/* Tahun - Enhanced with Gradient */}
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white px-5 py-3 rounded-xl shadow-sm font-bold hover:shadow-md transition-shadow">
                          <Calendar size={18} strokeWidth={2.5} />
                          <span className="text-lg tracking-tight">{item.tahun}</span>
                        </div>
                      </td>

                      {/* Nama Kurikulum */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-base group-hover:text-indigo-700 transition-colors">
                            {item.nama}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            ID: {item.id}
                          </span>
                        </div>
                      </td>

                      {/* Statistik - Enhanced Badges with Icons & Gradient */}
                      <td className="px-6 py-5">
                        {item._count ? (
                          <div className="flex items-center gap-3">
                            {/* CPL Badge */}
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 rounded-lg border border-blue-200 shadow-sm hover:shadow transition-shadow">
                              <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-sm font-bold text-blue-700">
                                {item._count.cpl}
                              </span>
                              <span className="text-xs text-blue-600 font-medium">
                                CPL
                              </span>
                            </div>
                            
                            {/* MK Badge */}
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-100 px-3 py-2 rounded-lg border border-orange-200 shadow-sm hover:shadow transition-shadow">
                              <BookOpen className="w-4 h-4 text-orange-600 flex-shrink-0" />
                              <span className="text-sm font-bold text-orange-700">
                                {item._count.mataKuliah}
                              </span>
                              <span className="text-xs text-orange-600 font-medium">
                                MK
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Actions - Refined with Better Hierarchy */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          
                          {/* CPL Button - Primary Action */}
                          <Link 
                            href={`/referensi/KP/${item.id}/VMCPL?prodiId=${prodiId}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 group/btn"
                          >
                            <Target size={16} className="group-hover/btn:scale-110 transition-transform" />
                            <span>Visi, Misi, CPL</span>
                          </Link>
                          
                          {/* Matakuliah Button - Secondary Action */}
                          <Link 
                            href={`/referensi/KP/${item.id}/matakuliah?prodiId=${prodiId}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group/btn"
                          >
                            <BookOpen size={16} className="group-hover/btn:scale-110 transition-transform" />
                            <span>Matakuliah</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ========== TABLE FOOTER (Optional: Pagination) ========== */}
          {kurikulums.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <p>
                  Menampilkan <span className="font-semibold text-gray-900">{kurikulums.length}</span> kurikulum
                </p>
                {/* Add pagination here if needed */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== MODAL ========== */}
      <KurikulumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddKurikulum}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}