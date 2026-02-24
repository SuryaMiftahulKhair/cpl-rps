"use client";

import { useState, useEffect, Suspense } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MatriksCPLTable from "../components/MatriksCPLTable";
import { HiOutlineHome, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { Grid3x3, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

// ============================================================
// 1. KOMPONEN KONTEN UTAMA
// Memuat seluruh logika Dashboard, Sidebar, dan Header
// agar berada di bawah satu kontrol Suspense yang sama.
// ============================================================
function HomeContent() {
  const searchParams = useSearchParams();
  // Ambil prodiId dari URL secara dinamis (ngikutin Sidebar)
  const prodiId = searchParams.get("prodiId") || "1";

  // State untuk kurikulum
  const [kurikulumList, setKurikulumList] = useState<any[]>([]);
  const [selectedKurikulum, setSelectedKurikulum] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKurikulum = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching kurikulum for prodiId:", prodiId);

      const res = await fetch(`/api/kurikulum?prodiId=${prodiId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Kurikulum data received:", data);

      if (data.success && data.data?.length > 0) {
        setKurikulumList(data.data);
        setSelectedKurikulum(data.data[0].id);
        console.log("Selected kurikulum:", data.data[0].id);
      } else {
        console.log("No kurikulum data found");
        setKurikulumList([]);
        setSelectedKurikulum(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch kurikulum:", err);
      setError(err.message || "Gagal mengambil data kurikulum");
      setKurikulumList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKurikulum();
  }, [prodiId]); // Refresh otomatis jika prodi di URL berubah

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR dimasukkan ke sini agar aman dari error useSearchParams */}
      <Sidebar />

      <div className="flex flex-col flex-1 bg-white">
        {/* HEADER juga dimasukkan ke sini */}
        <Header />

        <main className="p-8 space-y-6 bg-white">
          {/* Dashboard Title */}
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3">
            <HiOutlineHome className="w-6 h-6 text-indigo-600" />
            Dashboard Utama
          </div>

          {/* ALERT PERINGATAN */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex gap-4 text-red-800 shadow-sm">
            <HiOutlineExclamationTriangle className="w-7 h-7 mt-1 text-red-600 shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-red-900 mb-1">
                Peringatan Penting
              </h4>
              <p className="text-sm leading-relaxed">
                Pastikan <strong>Semester</strong> pada Data Kelas telah
                disinkronkan sebelum melakukan permintaan kepada dosen untuk
                menginput nilai.
              </p>
            </div>
          </div>

          {/* ================= MATRIKS CPL SECTION ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
                  <Grid3x3 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Matriks CPL - Mata Kuliah
                  </h2>
                  <p className="text-sm text-gray-600">
                    Pemetaan Indikator Kinerja (IK) terhadap Mata Kuliah Prodi
                    ID: {prodiId}
                  </p>
                </div>
              </div>

              {/* Refresh Button */}
              {!loading && (
                <button
                  onClick={fetchKurikulum}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm font-semibold text-gray-700 shadow-sm">
                  <RefreshCw size={16} />
                  Refresh
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900 mb-1">
                    Terjadi Kesalahan
                  </h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={fetchKurikulum}
                  className="text-sm font-semibold text-red-700 hover:text-red-900 underline">
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2
                    className="animate-spin text-indigo-700"
                    size={40}
                    strokeWidth={2.5}
                  />
                  <p className="text-sm text-gray-600 font-medium">
                    Memuat kurikulum...
                  </p>
                </div>
              </div>
            )}

            {/* Kurikulum Selector */}
            {!loading && !error && kurikulumList.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pilih Kurikulum:
                </label>
                <select
                  value={selectedKurikulum || ""}
                  onChange={(e) => setSelectedKurikulum(Number(e.target.value))}
                  className="w-full md:w-auto px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-900 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white shadow-sm">
                  {kurikulumList.map((k) => (
                    <option
                      key={k.id}
                      value={k.id}
                      className="text-gray-900 font-semibold">
                      {k.nama} ({k.tahun})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Matriks CPL Table Component */}
            {!loading && !error && selectedKurikulum ? (
              <MatriksCPLTable
                kurikulumId={selectedKurikulum}
                prodiId={Number(prodiId)}
                compactMode={false}
                maxHeight="max-h-[500px]"
                showControls={true}
                onMappingChange={() => {
                  console.log("Mapping changed - refresh stats if needed");
                }}
              />
            ) : !loading && !error && kurikulumList.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Kurikulum
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md">
                    Silakan tambahkan kurikulum terlebih dahulu untuk dapat
                    melihat matriks CPL - Mata Kuliah
                  </p>
                  <a
                    href="/referensi/KP"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-sm hover:shadow-md">
                    <span>Kelola Kurikulum</span>
                  </a>
                </div>
              </div>
            ) : null}

            {/* Informasi / Tips */}
            {!loading && !error && selectedKurikulum && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm text-white font-bold">
                    💡
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900 mb-2 text-sm">
                      Tips Penggunaan
                    </h4>
                    <ul className="space-y-1.5 text-xs text-indigo-800">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold mt-0.5">
                          •
                        </span>
                        <span>
                          Setiap CPL memiliki <strong>warna unik</strong> untuk
                          identifikasi cepat
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold mt-0.5">
                          •
                        </span>
                        <span>
                          Gunakan tombol <strong>collapse/expand</strong> untuk
                          fokus pada CPL tertentu
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold mt-0.5">
                          •
                        </span>
                        <span>
                          <strong>Klik sel</strong> untuk toggle mapping IK ke
                          mata kuliah
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold mt-0.5">
                          •
                        </span>
                        <span>
                          Gunakan mode <strong>Fullscreen</strong> untuk view
                          yang lebih luas
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// 2. EXPORT DEFAULT (Wrapper)
// Menangani pembungkusan Suspense untuk seluruh halaman dashboard
// ============================================================
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2
              className="animate-spin text-indigo-600"
              size={56}
              strokeWidth={2.5}
            />
            <p className="text-gray-500 font-bold tracking-widest animate-pulse uppercase">
              Inisialisasi Sistem...
            </p>
          </div>
        </div>
      }>
      <HomeContent />
    </Suspense>
  );
}
