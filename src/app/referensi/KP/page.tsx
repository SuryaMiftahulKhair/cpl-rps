// src/app/referensi/kp/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { Eye, Layers, Plus, X, RefreshCw } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Kurikulum {
  id: string | number;
  nama: string;
  tahun?: number;
}

// --- KurikulumModal ---
interface KurikulumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nama: string) => Promise<void>;
  submitting?: boolean;
}

function KurikulumModal({ isOpen, onClose, onSubmit, submitting }: KurikulumModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const namaKurikulum = formData.get("namaKurikulum");

    if (typeof namaKurikulum === "string" && namaKurikulum.trim()) {
      await onSubmit(namaKurikulum.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-slideUp">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Layers size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Tambah Kurikulum</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />{/* desain tetap */}
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="namaKurikulum"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nama Kurikulum <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="namaKurikulum"
              name="namaKurikulum"
              required
              placeholder="e.g., Kurikulum Sarjana K-24"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Masukkan nama kurikulum yang akan ditambahkan
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function KurikulumProdiPage() {
  const [kurikulums, setKurikulums] = useState<Kurikulum[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch list dari API saat mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/kurikulum?page=1&limit=50");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // handle jika backend mengembalikan { data: [...] } atau array langsung
        const data = Array.isArray(json) ? json : json?.data ?? [];
        if (mounted) setKurikulums(data.map((d: any) => ({ id: d.id, nama: d.nama, tahun: d.tahun })));
      } catch (err: any) {
        console.error("Fetch kurikulum error:", err);
        if (mounted) setError("Gagal memuat data kurikulum");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // handler add -> POST ke API. frontend cuma kirim nama; backend akan isi defaults.
  const handleAddKurikulum = async (nama: string) => {
    setSubmitting(true);
    setError(null);

    // buat optimistic item (sementara) agar UX terasa responsif — ID akan digantikan oleh response
    const optimisticId = `temp-${Date.now()}`;
    const optimisticItem: Kurikulum = { id: optimisticId, nama };
    setKurikulums((prev) => [optimisticItem, ...prev]);
    setIsModalOpen(false);

    try {
      const payload = { nama }; // backend toleran: akan isi tahun & programStudi jika perlu
      const res = await fetch("/api/kurikulum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `HTTP ${res.status}`);
      }

      const created = await res.json();
      // replace optimistic item dengan response yang valid (cari index)
      setKurikulums((prev) => prev.map((p) => (p.id === optimisticId ? { id: created.id ?? createdId(created), nama: created.nama ?? nama, tahun: created.tahun } : p)));
    } catch (err) {
      console.error("Create kurikulum error:", err);
      setError("Gagal menambahkan kurikulum. Coba lagi.");
      // rollback optimistic update
      setKurikulums((prev) => prev.filter((p) => p.id !== optimisticId));
    } finally {
      setSubmitting(false);
    }
  };

  // helper: some backends return { id: { toString: () => ... } etc
  const createdId = (obj: any) => (obj?.id ? String(obj.id) : `id-${Date.now()}`);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Page Header */}
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
                Kelola data kurikulum program studi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // simple refresh daftar
                setLoading(true);
                setError(null);
                fetch("/api/kurikulum?page=1&limit=50")
                  .then((r) => r.ok ? r.json() : Promise.reject(r.status))
                  .then((j) => {
                    const data = Array.isArray(j) ? j : j?.data ?? [];
                    setKurikulums(data.map((d: any) => ({ id: d.id, nama: d.nama, tahun: d.tahun })));
                  })
                  .catch((e) => {
                    console.error(e);
                    setError("Gagal memuat data");
                  })
                  .finally(() => setLoading(false));
              }}
              className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-sky-700 transition-all duration-200 font-medium text-sm hover:shadow-md"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Sinkronisasi Neosia</span>
              <span className="sm:hidden">Sync</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-all duration-200 font-medium text-sm hover:shadow-md"
            >
              <Plus size={18} />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* show error / loading */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
        )}

        {/* Data Table Card */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Daftar Kurikulum
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                <tr>
                  <th className="w-16 px-6 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                    No
                  </th>
                  <th className="w-28 px-6 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                    Nama Kurikulum
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : kurikulums.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      Tidak ada kurikulum
                    </td>
                  </tr>
                ) : (
                  kurikulums.map((item, index) => (
                    <tr
                      key={String(item.id)}
                      className={`hover:bg-indigo-50/30 transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {item.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {item.nama}
                          </span>
                          {index === 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                              Aktif
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Link
                            href={`/referensi/KP/${item.id}/VMCPL`}
                            className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-green-700 hover:shadow-md"
                          >
                            Visi, Misi, CPL
                          </Link>

                          <Link
                            href={`/referensi/KP/${item.id}/matakuliah`}
                            className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-indigo-700 hover:shadow-md"
                          >
                            Matakuliah
                          </Link>

                          <Link
                            href={`/referensi/KP/${item.id}/rubrik`}
                            className="inline-flex items-center gap-1 bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-cyan-700 hover:shadow-md"
                          >
                            Rubrik Penilaian
                          </Link>

                          <button
                            className="inline-flex items-center justify-center p-2 bg-red-600 text-white rounded-lg transition-all hover:bg-red-700 hover:shadow-md"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{kurikulums.length}</span> kurikulum ditemukan
              </p>
              
              {/* Pagination (UI only) */}
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                  Sebelumnya
                </button>
                <button className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  1
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <KurikulumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddKurikulum}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}
