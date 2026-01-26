"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Layers, Plus, Calendar, Loader2 } from "lucide-react"; 
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

  // --- Fungsi Fetch Data (Dibuat useCallback agar bisa dipanggil ulang setelah POST) ---
  const loadData = useCallback(async () => {
    if (!prodiId) return; 

    setLoading(true);
    setError(null);
    try {
      // PERBAIKAN: Gunakan Backtick ( ` ) bukan kutip biasa ( " )
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

  // Load data setiap kali prodiId berubah
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
        prodiId: Number(prodiId) // Pastikan prodiId ikut dikirim saat simpan
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

      setIsModalOpen(false); // Tutup modal jika sukses
      loadData(); // Refresh data tabel

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
                Menampilkan data untuk Prodi ID: <span className="font-bold text-indigo-600">{prodiId || "Memuat..."}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!prodiId}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-all duration-200 font-medium text-sm disabled:bg-gray-400"
            >
              <Plus size={18} />
              <span>Tambah Kurikulum</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
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
                         <Loader2 className="animate-spin text-indigo-600" size={20} /> Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : kurikulums.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      Belum ada data kurikulum untuk prodi ini.
                    </td>
                  </tr>
                ) : (
                  kurikulums.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center gap-1 font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit">
                           <Calendar size={12}/> {item.tahun}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{item.nama}</td>
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
                          <Link href={`/referensi/KP/${item.id}/VMCPL?prodiId=${prodiId}`} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700">
                            Visi, Misi, CPL
                          </Link>
                          <Link href={`/referensi/KP/${item.id}/matakuliah?prodiId=${prodiId}`} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700">
                            Matakuliah
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