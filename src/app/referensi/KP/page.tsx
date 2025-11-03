"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { Eye, Layers, Plus, X, RefreshCw } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { KurikulumModal } from "@/app/components/KurikulumModal";

interface Kurikulum {
  id: string | number;
  nama: string;
  tahun?: number;
}

// === Helper untuk handle error response ===
async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* not json */
  }

  if (parsed?.error) {
    if (Array.isArray(parsed.error)) return parsed.error.join(", ");
    if (typeof parsed.error === "string") return parsed.error;
    return JSON.stringify(parsed.error);
  }

  return text || `HTTP ${res.status}`;
}

// === Komponen utama ===
export default function KurikulumProdiPage() {
  const [kurikulums, setKurikulums] = useState<Kurikulum[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch daftar kurikulum ---
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/kurikulum?page=1&limit=50");
        if (!res.ok) throw new Error(await parseApiError(res));

        const json = await res.json();
        const data = Array.isArray(json) ? json : json?.data ?? [];

        if (mounted)
          setKurikulums(
            data.map((d: any) => ({
              id: d.id,
              nama: d.nama,
              tahun: d.tahun,
            }))
          );
      } catch (err: any) {
        console.error("Fetch kurikulum error:", err);
        if (mounted)
          setError(err?.message || "Gagal memuat data kurikulum.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Handler tambah kurikulum baru ---
  const handleAddKurikulum = async (nama: string) => {
    setSubmitting(true);
    setError(null);

    const optimisticId = `temp-${Date.now()}`;
    const optimisticItem: Kurikulum = { id: optimisticId, nama };
    setKurikulums((prev) => [optimisticItem, ...prev]);
    setIsModalOpen(false);

    try {
      const payload = { nama };
      const res = await fetch("/api/kurikulum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await parseApiError(res));

      const created = await res.json();
      setKurikulums((prev) =>
        prev.map((p) =>
          p.id === optimisticId
            ? {
                id: created.id ?? createdId(created),
                nama: created.nama ?? nama,
                tahun: created.tahun,
              }
            : p
        )
      );
    } catch (err: any) {
      console.error("Create kurikulum error:", err);
      setError(err?.message || "Gagal menambahkan kurikulum. Coba lagi.");
      setKurikulums((prev) => prev.filter((p) => p.id !== optimisticId));
    } finally {
      setSubmitting(false);
    }
  };

  const createdId = (obj: any) =>
    obj?.id ? String(obj.id) : `id-${Date.now()}`;

  // --- Refresh data (Sinkronisasi) ---
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kurikulum?page=1&limit=50");
      if (!res.ok) throw new Error(await parseApiError(res));

      const json = await res.json();
      const data = Array.isArray(json) ? json : json?.data ?? [];
      setKurikulums(
        data.map((d: any) => ({ id: d.id, nama: d.nama, tahun: d.tahun }))
      );
    } catch (err: any) {
      console.error("Refresh kurikulum error:", err);
      setError(err?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header Halaman */}
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

          {/* Tombol Aksi */}
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
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

        {/* Pesan Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {/* Tabel Data Kurikulum */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Daftar Kurikulum
            </h2>
          </div>

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
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : kurikulums.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
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

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{kurikulums.length}</span>{" "}
                kurikulum ditemukan
              </p>
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
