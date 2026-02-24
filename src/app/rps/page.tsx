"use client";

import { useEffect, useState, Suspense } from "react"; // Tambah Suspense
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Loader2,
  ChevronRight,
  Layers,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Kurikulum = {
  id: number;
  nama: string;
  tahun: number;
};

// ============================================================
// 1. KOMPONEN KONTEN UTAMA
// Pindahkan seluruh logika filter kurikulum asli Kakak ke sini
// ============================================================
function RpsAdminDashboardContent() {
  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId"); // Ambil prodiId dari URL Sidebar

  const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKurikulum = async () => {
      // Step 1: Validasi prodiId wajib ada agar tidak salah prodi
      if (!prodiId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Step 2: Kirim prodiId ke API Kurikulum untuk filter data S1/S2
        const res = await fetch(`/api/kurikulum?prodiId=${prodiId}`, {
          cache: "no-store", // Pastikan selalu ambil data terbaru
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal memuat data kurikulum");
        }

        const jsonResponse = await res.json();
        const data: Kurikulum[] = jsonResponse.data;

        setKurikulumList(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadKurikulum();
  }, [prodiId]); // Re-fetch otomatis jika user ganti prodi di Sidebar

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">
            RPS
          </span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Pilih Kurikulum</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
              <BookOpen size={28} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                RPS Matakuliah
              </h1>
              <p className="text-sm text-gray-600">
                Kelola Rencana Pembelajaran Semester per kurikulum
              </p>
              {/* Indikator Konteks */}
              {prodiId && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white border-2 border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                  <Calendar size={14} />
                  <span>Prodi ID: {prodiId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== STATS CARD (if kurikulum loaded) ========== */}
        {!loading && !error && kurikulumList.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 mb-6 border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-xl shadow-md">
                <Layers size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
                  Total Kurikulum
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {kurikulumList.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========== ERROR STATE ========== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ========== MAIN CONTENT ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Layers size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Pilih Kurikulum
                </h2>
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Memuat data..."
                    : `${kurikulumList.length} kurikulum tersedia`}
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Loading State - Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : kurikulumList.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <BookOpen size={40} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Belum Ada Kurikulum
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  {prodiId
                    ? "Belum ada kurikulum terdaftar untuk prodi ini. Silakan tambahkan kurikulum terlebih dahulu."
                    : "Silakan pilih program studi dari sidebar untuk melihat kurikulum yang tersedia."}
                </p>
              </div>
            ) : (
              /* Kurikulum Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kurikulumList.map((kur) => (
                  <Link
                    key={kur.id}
                    href={`/rps/${kur.id}/list?prodiId=${prodiId}`}
                    className="group block">
                    <div className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 opacity-5">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle
                            cx="80"
                            cy="20"
                            r="40"
                            fill="currentColor"
                            className="text-indigo-600"
                          />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl group-hover:from-indigo-600 group-hover:to-blue-600 transition-all shadow-sm">
                            <Layers
                              size={24}
                              className="text-indigo-600 group-hover:text-white transition-colors"
                              strokeWidth={2.5}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                              {kur.nama}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-500" />
                              <p className="text-sm text-gray-600 font-medium">
                                Tahun {kur.tahun}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t-2 border-gray-100 pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                              <FileText size={14} />
                              Mata Kuliah
                            </span>
                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                              <span>Lihat</span>
                              <ChevronRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                              />
                            </div>
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

        {/* ========== INFO TIP ========== */}
        {!loading && !error && kurikulumList.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">💡</span>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-2 text-sm">
                  Informasi
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Pilih kurikulum untuk melihat dan mengelola RPS mata kuliah.
                  Setiap kurikulum memiliki daftar mata kuliah dengan RPS yang
                  dapat Anda edit dan kelola.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ============================================================
// 2. WRAPPER UTAMA (Penyedia Suspense Boundary)
// Memberikan keamanan agar proses Build Vercel Sukses
// ============================================================
export default function RpsAdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2
              className="animate-spin text-indigo-600"
              size={56}
              strokeWidth={2.5}
            />
            <p className="text-gray-500 font-bold tracking-widest animate-pulse uppercase">
              MENYIAPKAN DAFTAR KURIKULUM...
            </p>
          </div>
        </div>
      }>
      <RpsAdminDashboardContent />
    </Suspense>
  );
}
