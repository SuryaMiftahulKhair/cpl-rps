"use client";

import { useState, useEffect, Suspense } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MatriksCPLTable from "../components/MatriksCPLTable";
import { HiOutlineHome, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { Grid3x3, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

// --- 1. KOMPONEN KONTEN (Isi Dashboard Kakak) ---
function HomeContent() {
  // Ambil prodiId dari URL secara dinamis sesuai Zustand Sidebar
  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId") || "1";

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
      const res = await fetch(`/api/kurikulum?prodiId=${prodiId}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setKurikulumList(data.data);
        setSelectedKurikulum(data.data[0].id);
      } else {
        setKurikulumList([]);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data kurikulum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKurikulum();
  }, [prodiId]);

  return (
    <main className="p-8 space-y-6 bg-white">
      {/* Title */}
      <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3">
        <HiOutlineHome className="w-6 h-6 text-indigo-600" />
        Dashboard Utama
      </div>

      {/* ALERT */}
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

      {/* MATRIKS CPL SECTION */}
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
                Pemetaan Indikator Kinerja (IK) terhadap Mata Kuliah Prodi ID:{" "}
                {prodiId}
              </p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={fetchKurikulum}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm font-semibold text-gray-700 shadow-sm">
              <RefreshCw size={16} /> Refresh
            </button>
          )}
        </div>

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

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center gap-3">
            <Loader2
              className="animate-spin text-indigo-700"
              size={40}
              strokeWidth={2.5}
            />
            <p className="text-sm text-gray-600 font-medium">
              Memuat kurikulum...
            </p>
          </div>
        ) : selectedKurikulum ? (
          <MatriksCPLTable
            kurikulumId={selectedKurikulum}
            prodiId={Number(prodiId)}
            compactMode={false}
            maxHeight="max-h-[500px]"
            showControls={true}
          />
        ) : (
          !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Kurikulum
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                Silakan tambahkan kurikulum terlebih dahulu.
              </p>
              <a
                href="/referensi/KP"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 font-semibold shadow-sm">
                Kelola Kurikulum
              </a>
            </div>
          )
        )}

        {/* TIPS SECTION */}
        {!loading && selectedKurikulum && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3 text-sm text-indigo-800">
              <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm text-white font-bold">
                💡
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 mb-1">
                  Tips Penggunaan
                </h4>
                <ul className="list-disc ml-4 space-y-1 text-xs">
                  <li>
                    Warna unik untuk tiap CPL membantu identifikasi cepat.
                  </li>
                  <li>
                    Gunakan <strong>collapse</strong> untuk fokus pada CPL
                    tertentu.
                  </li>
                  <li>Klik sel untuk menambah atau menghapus mapping.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// --- 2. WRAPPER UTAMA (Penyedia Suspense Boundary) ---
export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-white">
        <Header />
        {/* Suspense membungkus konten yang menggunakan useSearchParams */}
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center p-20 bg-white">
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-gray-500 font-medium animate-pulse">
                  Menyiapkan Dashboard...
                </p>
              </div>
            </div>
          }>
          <HomeContent />
        </Suspense>
      </div>
    </div>
  );
}
