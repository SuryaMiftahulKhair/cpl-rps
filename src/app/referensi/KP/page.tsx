"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Calendar,
  Loader2,
  Target,
  BookOpen,
  ChevronRight,
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
  };
}

// --- KOMPONEN KONTEN ---
function KurikulumProdiContent() {
  const [kurikulums, setKurikulums] = useState<Kurikulum[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId");

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
      setError(err?.message || "Gagal koneksi ke server");
    } finally {
      setLoading(false);
    }
  }, [prodiId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddKurikulum = async (nama: string, tahun: number) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = { nama, tahun, prodiId: Number(prodiId) };
      const res = await fetch("/api/kurikulum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "Gagal menyimpan");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">
            Referensi
          </span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Kurikulum Prodi</span>
        </div>

        <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <Layers size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Kurikulum Program Studi
                </h1>
                <p className="text-sm text-gray-600">
                  S1 Teknik Informatika •{" "}
                  <span className="font-semibold text-indigo-700 ml-1">
                    {kurikulums.length} Kurikulum Aktif
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!prodiId}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">
              <Plus size={20} strokeWidth={2.5} />
              <span>Tambah Kurikulum</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <Layers size={20} />
            <div>
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Tahun
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Nama Kurikulum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Statistik
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-10">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : kurikulums.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Layers
                        size={40}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <h3 className="text-xl font-bold text-gray-900">
                        Belum Ada Kurikulum
                      </h3>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 text-indigo-600 font-bold hover:underline">
                        Tambah Sekarang
                      </button>
                    </td>
                  </tr>
                ) : (
                  kurikulums.map((item, index) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-indigo-50/40 transition-all duration-150">
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">
                          {item.tahun}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900">
                          {item.nama}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {item.id}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                            {item._count?.cpl} CPL
                          </span>
                          <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-bold">
                            {item._count?.mataKuliah} MK
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/referensi/KP/${item.id}/VMCPL?prodiId=${prodiId}`}
                            className="p-2 border rounded-lg hover:bg-indigo-50 text-indigo-600 font-semibold text-sm">
                            Detail
                          </Link>
                          <Link
                            href={`/referensi/KP/${item.id}/matakuliah?prodiId=${prodiId}`}
                            className="p-2 border rounded-lg hover:bg-orange-50 text-orange-600 font-semibold text-sm">
                            MK
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

// --- WRAPPER UTAMA ---
export default function KurikulumProdiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center">
          <Loader2 className="animate-spin inline text-indigo-600" size={48} />
          <p>Memuat Referensi Kurikulum...</p>
        </div>
      }>
      <KurikulumProdiContent />
    </Suspense>
  );
}
