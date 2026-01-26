"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation"; // TAMBAH useSearchParams
import { RefreshCw, ChevronLeft, Layers, Star, Eye, Plus, FileSpreadsheet, Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Matakuliah, MatakuliahModalData } from "@/app/components/Matakuliah.types";
import MatakuliahModal from "@/app/components/MatakuliahModal";
import { ExcelImportModal } from "@/app/components/ExcelImportModal";
import DetailModal from "@/app/components/DetailModal";

function parseKurikulumId(params: any): number {
  const idRaw = params?.id;
  if (typeof idRaw === 'string') return Number(idRaw);
  if (Array.isArray(idRaw) && typeof idRaw[0] === 'string') return Number(idRaw[0]);
  return NaN;
}

export default function MatakuliahListPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Ambil prodiId dari URL Sidebar
  const prodiId = searchParams.get("prodiId");
  const kurikulumId = parseKurikulumId(params);

  const [data, setData] = useState<Matakuliah[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMatakuliah, setSelectedMatakuliah] = useState<Matakuliah | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Gunakan useCallback agar bisa di-refresh setelah POST
  const loadData = useCallback(async () => {
    if (Number.isNaN(kurikulumId) || !prodiId) return;

    setLoading(true);
    try {
      // Pastikan kirim prodiId ke API agar Backend bisa validasi hak akses
      const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah?prodiId=${prodiId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data mata kuliah");

      const json = await res.json();
      const list = json?.data ?? [];

      const mapped: Matakuliah[] = list.map((r: any) => ({
        id: Number(r.id),
        kode_mk: r.kode_mk ?? "",
        nama: r.nama ?? "",
        sks: Number(r.sks ?? 0),
        kurikulum_id: Number(r.kurikulum_id ?? kurikulumId),
        semester: r.semester ?? null,
        sifat: r.sifat ?? null,
        cpl: r.cpl ?? []
      }));
      
      setData(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [kurikulumId, prodiId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddMatakuliah = async (payload: MatakuliahModalData) => {
    setSubmitting(true);
    try {
      const body = {
        ...payload,
        sks: Number(payload.sks ?? 0),
        prodiId: Number(prodiId) // Sertakan prodiId saat simpan data
      };

      const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Gagal simpan data");

      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Tombol Kembali harus bawa prodiId agar Sidebar tidak reset
  const handleBack = () => {
    router.push(`/referensi/KP?prodiId=${prodiId}`);
  };

  const parseApiError = async (res: Response) => {
    try {
      const j = await res.json().catch(() => null);
      // Cek apakah ada pesan error di dalam json response
      if (j && (j.error || j.detail || j.message)) {
        return j.error ?? j.detail ?? j.message;
      }
      // Jika tidak ada json, ambil sebagai teks biasa
      return await res.text().catch(() => `Error: ${res.status}`);
    } catch {
      return `Kesalahan Server (${res.status})`;
    }
  };


  const handleImportExcel = async (importedData: MatakuliahModalData[]) => {

    setSubmitting(true);

    setError(null);

    

    try {

      if (Number.isNaN(kurikulumId)) {

        throw new Error("kurikulum id tidak valid.");

      }



      let successCount = 0;

      let failCount = 0;

      const errors: string[] = [];

      // --- PERBAIKAN: Hapus 'newExtrasBatch' ---



      for (const item of importedData) {

        try {

          // --- PERBAIKAN: Kirim 'semester' dan 'sifat' ke API ---

          const body = {
    kode_mk: item.kode_mk,
    nama: item.nama,
    sks: Number(item.sks ?? 0),
    semester: item.semester ?? null,
    sifat: item.sifat ?? null,
    prodiId: Number(prodiId) // TAMBAHKAN INI agar data masuk ke prodi yang benar
};

const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah?prodiId=${prodiId}`, { // Tambahkan param di URL juga
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
});



          if (res.ok) {

            successCount++;

            // --- PERBAIKAN: Hapus logika 'newExtrasBatch' ---

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



      // --- PERBAIKAN: Hapus 'setExtras' ---

      

      // --- PERBAIKAN: Panggil loadData() biasa ---

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
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Layers size={24} className="text-indigo-600" />
                Mata Kuliah Kurikulum
            </h1>
            <p className="text-xs text-indigo-600 font-semibold mt-1">Context Prodi ID: {prodiId}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-green-600">
              <Plus size={18} /> <span className="text-sm font-medium">Manual</span>
            </button>
            <button onClick={() => setIsExcelModalOpen(true)} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-emerald-600">
              <FileSpreadsheet size={18} /> <span className="text-sm font-medium">Excel</span>
            </button>
            <button onClick={() => handleBack()} className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-gray-600">
              <ChevronLeft size={18} /> Kembali
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-4 p-3 text-sm rounded ${error.includes('Berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {error}
          </div>
        )}

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-4 py-4 text-left font-bold text-xs text-indigo-700 uppercase">KODE</th>
                  <th className="px-4 py-4 text-left font-bold text-xs text-indigo-700 uppercase">NAMA MATA KULIAH</th>
                  <th className="px-4 py-4 text-center font-bold text-xs text-indigo-700 uppercase">SEM</th>
                  <th className="px-4 py-4 text-center font-bold text-xs text-indigo-700 uppercase">SKS</th>
                  <th className="px-4 py-4 text-center font-bold text-xs text-indigo-700 uppercase">SIFAT</th>
                  <th className="px-4 py-4 text-center font-bold text-xs text-indigo-700 uppercase">AKSI</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">Belum ada mata kuliah di kurikulum ini.</td></tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-indigo-600">{item.kode_mk}</td>
                      <td className="px-4 py-4 font-semibold text-gray-800">
                        {item.nama}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.cpl?.map(c => (
                            <span key={c.id} className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100">
                              {c.kode_cpl}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium">{item.semester ?? "-"}</td>
                      <td className="px-4 py-4 text-center">{item.sks}</td>
                      <td className="px-4 py-4 text-center uppercase text-[10px] font-bold text-gray-500">{item.sifat ?? "-"}</td>
                      <td className="px-4 py-4 text-center space-x-2">
                        <button onClick={() => handleShowDetail(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Detail">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MatakuliahModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddMatakuliah} submitting={submitting} kurikulumId={kurikulumId} />
      <ExcelImportModal isOpen={isExcelModalOpen} onClose={() => setIsExcelModalOpen(false)} onImport={handleImportExcel} kurikulumId={kurikulumId} submitting={submitting} />
      <DetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} matakuliah={selectedMatakuliah} />
    </DashboardLayout>
  );
}