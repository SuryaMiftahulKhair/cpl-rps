"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Loader2,
  GraduationCap,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft, // Ditambahkan untuk tombol pagination
  FileSpreadsheet,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { MahasiswaModal } from "@/app/components/MahasiswaModal";

interface Mahasiswa {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
}

// --- KOMPONEN KONTEN UTAMA ---
function MasterMahasiswaContent() {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk Pencarian dan Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mengirim param limit=10 dan page sesuai state
      const res = await fetch(`/api/mahasiswa?q=${searchTerm}&page=${currentPage}&limit=10`);
      const json = await res.json();
      
      setMahasiswaList(json.data || []);
      
      // Mengambil metadata dari API Anda
      if (json.meta) {
        setTotalPages(json.meta.totalPages);
        setTotalData(json.meta.total);
      }
    } catch (err: any) {
      setError("Gagal memuat data mahasiswa.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler Pencarian (Reset ke halaman 1 saat mengetik)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">
            Data Master
          </span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Mahasiswa</span>
        </div>

        <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <Users size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Data Mahasiswa
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola data induk mahasiswa •
                  <span className="font-semibold text-indigo-700 ml-1">
                    {totalData} Mahasiswa Terdaftar
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/referensi/mahasiswa/import"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 px-5 py-3 rounded-xl shadow-sm hover:shadow transition-all font-semibold group">
                <FileSpreadsheet
                  size={20}
                  className="text-green-600 group-hover:scale-110 transition-transform"
                />
                <span>Import Excel</span>
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md font-semibold">
                <Plus size={20} strokeWidth={2.5} />
                <span>Tambah Mahasiswa</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari NIM atau Nama Mahasiswa..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none shadow-sm text-gray-700 font-medium"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase w-16">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    NIM
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Nama Mahasiswa
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-5">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : mahasiswaList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-20 text-center text-gray-500 font-medium">
                      Belum ada mahasiswa atau tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  mahasiswaList.map((mhs, index) => (
                    <tr
                      key={mhs.id}
                      className="group hover:bg-indigo-50/40 transition-all duration-150">
                      <td className="px-6 py-5 text-gray-500 font-medium text-sm">
                        {(currentPage - 1) * 10 + index + 1}
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                          {mhs.nim}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            {mhs.nama}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 font-medium mt-0.5">
                            <GraduationCap size={12} /> {mhs.prodi || "Teknik Informatika"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ========== PAGINATION UI ========== */}
          {!loading && totalPages > 1 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                Menampilkan <span className="font-bold text-gray-900">{(currentPage - 1) * 10 + 1}</span> - <span className="font-bold text-gray-900">{Math.min(currentPage * 10, totalData)}</span> dari <span className="font-bold text-gray-900">{totalData}</span> data
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <span className="text-sm font-bold text-gray-900 px-2">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <MahasiswaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}

// --- WRAPPER UTAMA ---
export default function MasterMahasiswaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-20 bg-gray-50">
          <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
        </div>
      }>
      <MasterMahasiswaContent />
    </Suspense>
  );
}