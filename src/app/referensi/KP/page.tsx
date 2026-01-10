"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Layers, Plus, Book, Calendar } from "lucide-react"; // Hapus RefreshCw
import DashboardLayout from "@/app/components/DashboardLayout";
import { KurikulumModal } from "@/app/components/KurikulumModal"; // Sesuaikan path import

interface Kurikulum {
  id: string | number;
  nama: string;
  tahun: number; // Tahun wajib ada
  _count?: {     // Tambahan untuk statistik (opsional)
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

  // --- Fetch Data ---
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kurikulum"); // Tidak perlu paging dulu utk awal
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
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handle Tambah (Updated) ---
  const handleAddKurikulum = async (nama: string, tahun: number) => {
    setSubmitting(true);
    setError(null);

    try {
      const payload = { nama, tahun };
      
      const res = await fetch("/api/kurikulum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan");
      }

      // Refresh data setelah simpan sukses
      await loadData();
      setIsModalOpen(false);

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
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Layers size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Kurikulum Program Studi
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Kelola data kurikulum secara mandiri
              </p>
            </div>
          </div>

          {/* Tombol Aksi (Sync Dihapus) */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-all duration-200 font-medium text-sm hover:shadow-md"
            >
              <Plus size={18} />
              <span>Tambah Kurikulum</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Tabel */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                <tr>
                  <th className="w-16 px-6 py-4 text-left font-semibold text-xs text-indigo-800 uppercase">No</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs text-indigo-800 uppercase">Tahun</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs text-indigo-800 uppercase">Nama Kurikulum</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs text-indigo-800 uppercase">Statistik</th>
                  <th className="px-6 py-4 text-center font-semibold text-xs text-indigo-800 uppercase">Aksi</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div> Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : kurikulums.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      Belum ada data kurikulum. Silakan tambah baru.
                    </td>
                  </tr>
                ) : (
                  kurikulums.map((item, index) => (
                    <tr key={String(item.id)} className={`hover:bg-indigo-50/30 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{index + 1}</td>
                      
                      {/* Kolom Tahun (Baru) */}
                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center gap-1 font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit">
                           <Calendar size={12}/> {item.tahun}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800">{item.nama}</span>
                      </td>
                        
                      {/* Kolom Statistik (Baru - Optional) */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                         {item._count ? (
                             <div className="flex gap-2">
                                 <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{item._count.cpl} CPL</span>
                                 <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">{item._count.mataKuliah} MK</span>
                             </div>
                         ) : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Link href={`/referensi/KP/${item.id}/VMCPL`} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700">
                            Visi, Misi, CPL
                          </Link>
                          <Link href={`/referensi/KP/${item.id}/matakuliah`} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700">
                            Matakuliah
                          </Link>
                          <Link href={`/referensi/KP/${item.id}/rubrik`} className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-cyan-700">
                            Rubrik
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <KurikulumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddKurikulum}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}