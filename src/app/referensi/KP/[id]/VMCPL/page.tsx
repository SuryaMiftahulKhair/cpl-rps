// VisiMisiCPLPage.tsx
"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, ChevronLeft, Plus, Layers } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useParams } from "next/navigation";

// ====== Types (sesuai schema sekarang) ======
type CPLItem = {
  id: string;
  kode: string;
  deskripsi: string;
  level: string | null; // aku isi dari piGroup.nama_grup kalau ada
};

type KurikulumDetailFromAPI = {
  id: number;
  nama: string;
  tahun: number;
  // dari include API: gunakan nama relasi yang cocok dengan schema kamu
  cpl?: Array<{
    id: number;
    kode_cpl: string;
    deskripsi: string;
    piGroup?: { id: number; nama_grup: string | null; kode_grup: string | null } | null;
  }>;
  // kalau kamu include mataKuliah juga, bisa tambahkan di sini, tapi CPL di schema ada di level kurikulum
};

export default function VisiMisiCPLPage() {
  const params = useParams();
  const kurikulumId =
    (params as any)?.id ??
    (params as any)?.kpId ??
    null; // fallback nama param

  // state UI
  const [visiText, setVisiText] = useState<string>(""); // placeholder: schema tidak punya Visi/Misi
  const [misiList, setMisiList] = useState<Array<{ id: string; teks: string; urutan?: number | null }>>([]); // placeholder
  const [cplList, setCplList] = useState<CPLItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"visi_misi" | "cpl_data">("visi_misi");

  useEffect(() => {
    let mounted = true;
    if (!kurikulumId) {
      setError("ID kurikulum tidak ditemukan di URL");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/kurikulum/${kurikulumId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data: KurikulumDetailFromAPI = await res.json();

        // --- VISI/MISI: schema tidak punya modelnya -> tampilkan placeholder agar desain tetap sama
        const visi = ""; // bisa diisi nanti jika kamu tambahkan tabel/kolom di schema
        const misi: Array<{ id: string; teks: string; urutan?: number | null }> = [];

        // --- CPL: mapping dari Kurikulum.cpl (sesuai schema kamu)
        const cpls: CPLItem[] =
          (data.cpl ?? []).map((c) => ({
            id: String(c.id),
            kode: c.kode_cpl,
            deskripsi: c.deskripsi,
            level: c.piGroup?.nama_grup ?? null, // tampilkan nama grup sebagai "Kelompok"
          })) ?? [];

        if (!mounted) return;
        setVisiText(visi);
        setMisiList(misi);
        setCplList(cpls);
      } catch (err: any) {
        console.error("Failed fetch kurikulum:", err);
        if (!mounted) return;
        setError(
          err?.message || "Gagal memuat data Visi/Misi/CPL. Cek koneksi atau konfigurasi API."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [kurikulumId]);

  return (
    <DashboardLayout>
      {/* Main Title Area */}
      <div className="px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Layers size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Kurikulum Program Studi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola visi, misi, dan target CPL program studi
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 lg:px-8">
        <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
          <div className="flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab("visi_misi")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium ${
                activeTab === "visi_misi"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Visi, Misi, Profil Lulusan
            </button>
            <button
              onClick={() => setActiveTab("cpl_data")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium ${
                activeTab === "cpl_data"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Target CPL Prodi
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="bg-gray-50 rounded-b-xl shadow-sm border-x border-b border-gray-200">
          {loading && (
            <div className="p-4 text-sm text-gray-600">Memuat data Visi/Misi & CPL...</div>
          )}
          {error && <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>}

          {activeTab === "visi_misi" && (
            <div className="p-6 lg:p-8">
              {/* Header dan Aksi */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                  Visi, Misi, dan Profil Lulusan
                </h2>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    <Edit size={18} />
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    <ChevronLeft size={18} />
                    <span>Kembali</span>
                  </button>
                </div>
              </div>

              {/* Konten Visi Misi */}
              <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
                {/* Visi */}
                <div className="space-y-3 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded"></div>
                    Visi
                  </h3>
                  <p className="text-gray-700 leading-relaxed pl-3">
                    {visiText || "Belum ada visi yang diisikan untuk kurikulum ini."}
                  </p>
                </div>

                {/* Misi */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded"></div>
                    Misi
                  </h3>
                  <ol className="space-y-4 pl-3">
                    {misiList.length === 0 ? (
                      <li className="text-gray-600">Belum ada misi yang diisikan.</li>
                    ) : (
                      misiList.map((m, idx) => (
                        <li
                          key={m.id ?? String(idx)}
                          className="flex gap-3 text-gray-700 leading-relaxed"
                        >
                          <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {m.urutan ?? idx + 1}
                          </span>
                          <span className="pt-0.5">{m.teks}</span>
                        </li>
                      ))
                    )}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === "cpl_data" && (
            <div className="p-6 lg:p-8">
              {/* Header dan Aksi */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                    Data Target CPL Prodi
                  </h2>
                  <span className="bg-indigo-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-sm">
                    {cplList.length}
                  </span>
                </div>

                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                  <Plus size={18} />
                  <span>Tambah Baru</span>
                </button>
              </div>

              {/* Tabel CPL */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                      <tr>
                        <th className="w-20 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                          No
                        </th>
                        <th className="w-36 px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                          Kelompok
                        </th>
                        <th className="w-24 px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                          Kode
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                          CPL (Capaian Pembelajaran Lulusan)
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                          LO (Learning Outcome)
                        </th>
                        <th className="w-28 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {cplList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                            Tidak ada data CPL untuk kurikulum ini.
                          </td>
                        </tr>
                      ) : (
                        cplList.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`hover:bg-indigo-50/30 transition-colors duration-150 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-4 py-4 text-center text-gray-600 font-medium">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {item.level ?? "Umum"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-bold text-indigo-700">{item.kode}</span>
                            </td>
                            <td className="px-4 py-4 text-gray-700 max-w-md leading-relaxed text-sm">
                              {item.deskripsi}
                            </td>
                            <td className="px-4 py-4 text-gray-600 max-w-md leading-relaxed text-sm">
                              {/* Schema belum punya LO per CPL -> tampilkan '-' */}
                              -
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-150 group"
                                  title="Edit"
                                >
                                  <Edit size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                  className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150 group"
                                  title="Hapus"
                                >
                                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer/Pagination dummy */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Menampilkan {cplList.length} dari {cplList.length} data
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Sebelumnya
                  </button>
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
