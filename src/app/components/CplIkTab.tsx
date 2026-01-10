"use client";

import { useEffect, useState } from "react";
import { Database, Target, Layers, Edit, Trash2 } from "lucide-react";
// Pastikan import modal kakak sudah benar path-nya
import CplManagementModal from "@/app/components/CplManagementModal";
import AreaManagementModal from "@/app/components/AreaManagementModal";
import IkManagementModal from "@/app/components/IkManagementModal";

// --- TIPE DATA (SESUAI SCHEMA KAKAK) ---
type IK = {
  id: number;
  kode_ik: string;
  deskripsi: string;
};

type CPL = {
  id: number;
  kode_cpl: string;
  deskripsi: string;
  iks: IK[]; // <--- UBAH JADI 'iks' (bukan indikatorKinerja)
};

type VMData = {
  cpl: CPL[];
  AssasmentArea: any[]; // <--- SESUAIKAN CASE (Huruf Besar Awal)
};

// Helper Error
const parseApiError = async (res: Response) => {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP Error ${res.status}`;
  } catch {
    return `HTTP Error ${res.status}`;
  }
};

interface CplIkTabProps {
  kurikulumId: number;
}

export default function CplIkTab({ kurikulumId }: CplIkTabProps) {
  const [data, setData] = useState<VMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // State Modal
  const [isCplModalOpen, setIsCplModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isIkModalOpen, setIsIkModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErr(null);
    try {
      if (!kurikulumId || Number.isNaN(kurikulumId)) return;

      const res = await fetch(`/api/kurikulum/${kurikulumId}/VMCPL`); // Pastikan route file-nya nama kecil (vmcpl)
      if (!res.ok) throw new Error(await parseApiError(res));
      
      const json = await res.json();
      if (json.success) {
         setData(json.data);
      }
    } catch (e: any) {
      console.error("Fetch Error:", e);
      setErr(e?.message ?? "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kurikulumId) loadData();
  }, [kurikulumId]);

  const handleRefresh = () => {
    setIsCplModalOpen(false);
    setIsAreaModalOpen(false);
    setIsIkModalOpen(false);
    loadData();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Capaian Pembelajaran (CPL) & Indikator</h2>
      </div>

      {/* --- TOMBOL MANAJEMEN --- */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-3">Manajemen Data Referensi</h3>
        <div className="flex flex-wrap gap-3">
          
          <button onClick={() => setIsCplModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all">
            <Database size={18} /> <span>Kelola CPL</span>
          </button>
          
          <button onClick={() => setIsIkModalOpen(true)} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 shadow-sm transition-all">
            <Target size={18} /> <span>Kelola Indikator Kinerja (IK)</span>
          </button>

          <div className="border-l border-gray-300 mx-1"></div>

          <button onClick={() => setIsAreaModalOpen(true)} className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm transition-all">
            <Layers size={18} /> <span>Kelola Assessment Area</span>
          </button>
        </div>
      </div>

      {err && <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded border border-red-200">{err}</div>}

      {/* --- TABEL CPL & IK --- */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
              <tr>
                <th className="w-24 px-6 py-4 text-left font-bold text-xs text-indigo-800 uppercase tracking-wider">Kode CPL</th>
                <th className="px-6 py-4 text-left font-bold text-xs text-indigo-800 uppercase tracking-wider">Deskripsi CPL</th>
                <th className="w-1/2 px-6 py-4 text-left font-bold text-xs text-indigo-800 uppercase tracking-wider">Indikator Kinerja (IK)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">Memuat data...</td></tr>
              ) : !data || data.cpl.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">Belum ada data CPL. Silakan tambahkan.</td></tr>
              ) : (
                data.cpl.map((item, idx) => (
                  <tr key={item.id} className={`hover:bg-indigo-50/10 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-6 py-4 align-top">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {item.kode_cpl}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-gray-700 text-sm leading-relaxed">
                      {item.deskripsi}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {/* PERBAIKAN DI SINI: Ganti 'indikatorKinerja' jadi 'iks' */}
                      {!item.iks || item.iks.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Belum ada indikator</span>
                      ) : (
                        <ul className="space-y-2">
                          {item.iks.map((ik) => (
                            <li key={ik.id} className="flex gap-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm">
                              <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded h-fit">
                                {ik.kode_ik}
                              </span>
                              <span className="leading-snug">{ik.deskripsi}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {!Number.isNaN(kurikulumId) && (
        <>
          <CplManagementModal
            isOpen={isCplModalOpen}
            onClose={() => setIsCplModalOpen(false)}
            onSuccess={handleRefresh} 
            kurikulumId={kurikulumId}
          />
          <AreaManagementModal
            isOpen={isAreaModalOpen}
            onClose={() => setIsAreaModalOpen(false)}
            onSuccess={handleRefresh}
            kurikulumId={kurikulumId}
          />
          <IkManagementModal
            isOpen={isIkModalOpen}
            onClose={() => setIsIkModalOpen(false)}
            onSuccess={handleRefresh}
            kurikulumId={kurikulumId}
          />
        </>
      )}
    </div>
  );
}