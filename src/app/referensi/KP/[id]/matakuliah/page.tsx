"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ChevronLeft, Layers, Star, Eye, Plus, FileSpreadsheet } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Matakuliah, MatakuliahModalData } from "@/app/components/Matakuliah.types";
import MatakuliahModal from "@/app/components/MatakuliahModal";
import { ExcelImportModal } from "@/app/components/ExcelImportModal";
import DetailModal from "@/app/components/DetailModal";

// Tipe 'extras' disederhanakan
type ExtrasData = Omit<MatakuliahModalData, 'kode_mk' | 'nama' | 'sks'>;

export default function MatakuliahListPage() {
  const params = useParams();
  const router = useRouter();
  const kurikulumIdRaw = (params as any)?.id;
  const kurikulumId = kurikulumIdRaw ? Number(kurikulumIdRaw) : NaN;

  const [data, setData] = useState<Matakuliah[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMatakuliah, setSelectedMatakuliah] = useState<Matakuliah | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [extras, setExtras] = useState<Record<string, ExtrasData>>({});

  const parseApiError = async (res: Response) => {
    // ... (Fungsi ini tidak berubah, biarkan apa adanya) ...
    try {
      const j = await res.json().catch(() => null);
      if (j && (j.error || j.detail || j.message)) return j.error ?? j.detail ?? j.message;
      return await res.text().catch(() => `${res.status}`);
    } catch {
      return `${res.status}`;
    }
  };

  const loadData = async () => {
    // ... (Fungsi ini tidak berubah, logikanya masih valid) ...
    setLoading(true);
    setError(null);
    try {
      if (!kurikulumId || Number.isNaN(kurikulumId)) {
        setData([]);
        setError("kurikulum id tidak tersedia atau tidak valid.");
        return;
      }

      const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));

      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data ?? [];

      const mapped: Matakuliah[] = list.map((r: any) => {
        const kode = r.kode_mk ?? r.kode ?? "";
        const extra = extras[kode] || {};
        return {
          id: Number(r.id),
          kode_mk: kode,
          nama: r.nama ?? "",
          sks: Number(r.sks ?? 0),
          kurikulum_id: Number(r.kurikulum_id ?? r.kurikulumId ?? kurikulumId),
          semester: extra.semester ?? (r.semester != null ? Number(r.semester) : null),
          sifat: extra.sifat ?? (r.sifat ?? null),
          area: (extra as any).area ?? (r.area ?? null), // 'area' tidak ada di tipe ExtrasData, tapi kita jaga
          pi_area: (extra as any).pi_area ?? (r.pi_area ?? null),
          cpl: (extra as any).cpl ?? (r.cpl ?? null),
          performance_indicator: (extra as any).performance_indicator ?? (r.performance_indicator ?? null),
        };
      });
      setData(mapped);
    } catch (err: any) {
      console.error("GET matakuliah error:", err);
      setError(err?.message ?? "Terjadi kesalahan saat memuat data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [kurikulumIdRaw]);

  const handleAddMatakuliah = async (payload: MatakuliahModalData) => {
    setSubmitting(true);
    setError(null);
    try {
      if (!kurikulumId || Number.isNaN(kurikulumId)) throw new Error("kurikulum id tidak valid.");
      
      // --- PENYESUAIAN ---
      // Validasi pi_group_id dan cpl_id dihapus
      // ---------------------

      const body = {
        kode_mk: payload.kode_mk,
        nama: payload.nama,
        sks: Number(payload.sks ?? 0),
        // --- PENYESUAIAN ---
        // pi_group_id dan cpl_id dihapus dari body
        // ---------------------
      };

      const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await parseApiError(res);
        throw new Error(txt || `HTTP ${res.status}`);
      }

      // Simpan data FE-only ke state 'extras'
      setExtras(prev => ({
        ...prev,
        [payload.kode_mk]: {
          semester: payload.semester ?? null,
          sifat: payload.sifat ?? null,
          assesment_area_id: payload.assesment_area_id ?? null,
          performance_indicator_ids: payload.performance_indicator_ids ?? [],
          // --- PENYESUAIAN ---
          // pi_group_id dan cpl_id dihapus dari 'extras'
          // ---------------------
        },
      }));

      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("POST matakuliah error:", err);
      setError(err?.message ?? "Gagal menambahkan mata kuliah.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportExcel = async (importedData: MatakuliahModalData[]) => {
    setSubmitting(true);
    setError(null);
    
    try {
      if (!kurikulumId || Number.isNaN(kurikulumId)) {
        throw new Error("kurikulum id tidak valid.");
      }

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];
      const newExtras: typeof extras = {};

      for (const item of importedData) {
        try {
          // --- PENYESUAIAN ---
          // Validasi pi_group_id dan cpl_id dihapus
          // ---------------------

          const body = {
            kode_mk: item.kode_mk,
            nama: item.nama,
            sks: Number(item.sks ?? 0),
            // --- PENYESUAIAN ---
            // pi_group_id dan cpl_id dihapus dari body
            // ---------------------
          };

          const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            successCount++;
            newExtras[item.kode_mk] = {
              semester: item.semester,
              sifat: item.sifat,
              assesment_area_id: item.assesment_area_id,
              performance_indicator_ids: item.performance_indicator_ids,
              // --- PENYESUAIAN ---
              // pi_group_id dan cpl_id dihapus
              // ---------------------
            };
          } else {
            failCount++;
            const errText = await parseApiError(res);
            errors.push(`${item.kode_mk}: ${errText}`);
          }
        } catch (err: any) {
          failCount++;
          errors.push(`${item.kode_mk}: ${err.message}`);
        }
      }

      if (successCount > 0) {
        setExtras(prev => ({ ...prev, ...newExtras }));
      }
      
      await loadData();
      
      if (successCount > 0) {
        setError(`Berhasil import ${successCount} mata kuliah${failCount > 0 ? `, gagal ${failCount}` : ''}`);
      } else {
        setError(`Gagal import semua data: ${errors.join(', ')}`);
      }
      
      setIsExcelModalOpen(false);
    } catch (err: any) {
      console.error("Import Excel error:", err);
      setError(err?.message ?? "Gagal import data dari Excel.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowDetail = (matakuliah: Matakuliah) => {
    setSelectedMatakuliah(matakuliah);
    setIsDetailModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* --- (Bagian Header/Tombol tidak berubah) --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers size={24} className="text-indigo-600" />
            Kurikulum Program Studi
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-green-600"
              title="Tambah Manual"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Manual</span>
            </button>
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-emerald-600"
              title="Import dari Excel"
            >
              <FileSpreadsheet size={18} />
              <span className="text-sm font-medium">Import Excel</span>
            </button>
            <button
              onClick={() => void loadData()}
              className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-sky-700"
            >
              <RefreshCw size={18} /> Refresh
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-gray-600"
            >
              <ChevronLeft size={18} /> Kembali
            </button>
          </div>
        </div>

        {/* --- (Bagian Error tidak berubah) --- */}
        {error && (
          <div className={`mb-4 p-3 text-sm rounded ${error.includes('Berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* --- (Bagian Tabel tidak berubah) --- */}
        <div className="bg-white shadow-xl rounded-xl">
          <h2 className="text-lg font-bold p-6 pb-2 text-gray-800">Data</h2>
          {/* Filter inputs... */}
          <div className="p-4 border-b border-gray-100 grid grid-cols-7 gap-4">
             {/* ... input ... */}
          </div>
          <div className="overflow-x-auto border-t border-gray-200 rounded-b-xl">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-indigo-50">
                {/* ... th ... */}
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">Tidak ada mata kuliah</td></tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-indigo-50/50 transition">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{item.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-700">{item.kode_mk}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.nama}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.semester ?? "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.sks}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.sifat ?? "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                        <button 
                          className="p-1.5 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition" 
                          title="Set RPS Utama"
                        >
                          <Star size={16} />
                        </button>
                        <button 
                          onClick={() => handleShowDetail(item)}
                          className="p-1.5 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 transition" 
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* ... (Footer tabel tidak berubah) ... */}
        </div>

        {/* --- Komponen Modal --- */}

        <MatakuliahModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddMatakuliah}
          submitting={submitting}
          kurikulumId={kurikulumId}
        />

        <ExcelImportModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          onImport={handleImportExcel}
          kurikulumId={kurikulumId}
          submitting={submitting}
        />

        <DetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          matakuliah={selectedMatakuliah}
        />
      </div>
    </DashboardLayout>
  );
}