// src/app/components/CplIkTab.tsx
"use client";

import { useEffect, useState } from "react";
import { Database, Target, Layers, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import CplManagementModal from "@/app/components/CplManagementModal";
import AreaManagementModal from "@/app/components/AreaManagementModal";
import IkManagementModal from "@/app/components/IkManagementModal";

// --- TIPE DATA ---
type IK = {
  id: number;
  kode_ik: string;
  deskripsi: string;
};

type CPL = {
  id: number;
  kode_cpl: string;
  deskripsi: string;
  iks: IK[];
};

type VMData = {
  cpl: CPL[];
  AssasmentArea: any[];
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
  prodiId: string | null;
}

export default function CplIkTab({ kurikulumId, prodiId }: CplIkTabProps) {
  const router = useRouter();
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
      if (!kurikulumId || !prodiId) return;

      const res = await fetch(`/api/kurikulum/${kurikulumId}/VMCPL?prodiId=${prodiId}`); 
      
      if (!res.ok) throw new Error(await parseApiError(res));
      
      const json = await res.json();
      if (json.success) {
         setData(json.data);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [kurikulumId, prodiId]);

  const handleRefresh = () => {
    setIsCplModalOpen(false);
    setIsAreaModalOpen(false);
    setIsIkModalOpen(false);
    loadData();
  };

  // Navigasi ke halaman Matriks CPL
  const handleViewMatriks = () => {
    router.push(`/referensi/KP/${kurikulumId}/matriks-cpl?prodiId=${prodiId}`);
  };

  // Hitung total IK
  const totalIK = data?.cpl.reduce((sum, cpl) => sum + (cpl.iks?.length || 0), 0) || 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
          Capaian Pembelajaran (CPL) & Indikator
        </h2>
        
        {/* Tombol Lihat Matriks */}
        <button 
          onClick={handleViewMatriks}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md transition-all"
        >
          <Eye size={18} />
          <span>Lihat Matriks CPL - Mata Kuliah</span>
        </button>
      </div>

      {/* --- STATISTIK RINGKAS --- */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg p-4 border-2 border-indigo-300 shadow-md">
          <div className="text-xs text-indigo-700 font-semibold">Total CPL</div>
          <div className="text-2xl font-extrabold text-indigo-900 mt-1">
            {data?.cpl.length || 0}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-300 shadow-md">
          <div className="text-xs text-purple-700 font-semibold">Total IK</div>
          <div className="text-2xl font-extrabold text-purple-900 mt-1">
            {totalIK}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-300 shadow-md">
          <div className="text-xs text-green-700 font-semibold">Assessment Area</div>
          <div className="text-2xl font-extrabold text-green-900 mt-1">
            {data?.AssasmentArea.length || 0}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg p-4 border-2 border-amber-300 shadow-md">
          <div className="text-xs text-amber-700 font-semibold">Rata-rata IK per CPL</div>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">
            {data?.cpl.length ? (totalIK / data.cpl.length).toFixed(1) : 0}
          </div>
        </div>
      </div>

      {/* --- TOMBOL MANAJEMEN --- */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-3">
          Manajemen Data Referensi
        </h3>
        <div className="flex flex-wrap gap-3">
          
          <button 
            onClick={() => setIsCplModalOpen(true)} 
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Database size={18} /> <span>Kelola CPL</span>
          </button>
          
          <button 
            onClick={() => setIsIkModalOpen(true)} 
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 shadow-sm transition-all"
          >
            <Target size={18} /> <span>Kelola Indikator Kinerja (IK)</span>
          </button>

          <div className="border-l border-gray-300 mx-1"></div>

          <button 
            onClick={() => setIsAreaModalOpen(true)} 
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm transition-all"
          >
            <Layers size={18} /> <span>Kelola Assessment Area</span>
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded border border-red-200">
          {err}
        </div>
      )}

      {/* --- TABEL CPL & IK --- */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
              <tr>
                <th className="w-32 px-6 py-4 text-left font-bold text-xs text-indigo-800 uppercase tracking-wider">
                  Kode CPL
                </th>
                <th className="px-6 py-4 text-left font-bold text-xs text-indigo-800 uppercase tracking-wider">
                  Deskripsi CPL
                </th>
                <th className="w-1/2 px-6 py-4 text-left font-bold text-xs text-indigo-800 uppercase tracking-wider">
                  Indikator Kinerja (IK)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Memuat data...
                  </td>
                </tr>
              ) : !data || data.cpl.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Belum ada data CPL. Silakan tambahkan melalui tombol "Kelola CPL".
                  </td>
                </tr>
              ) : (
                data.cpl.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-indigo-50/30 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4 align-top">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {item.kode_cpl}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-gray-700 text-sm leading-relaxed">
                      {item.deskripsi}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {!item.iks || item.iks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-4">
                          <span className="text-xs text-gray-400 italic">
                            Belum ada indikator kinerja
                          </span>
                          <button
                            onClick={() => setIsIkModalOpen(true)}
                            className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            + Tambah IK
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {item.iks.map((ik) => (
                            <li 
                              key={ik.id} 
                              className="flex gap-2 text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded h-fit whitespace-nowrap">
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

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Informasi:</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Setiap CPL harus memiliki minimal 1 Indikator Kinerja (IK)</li>
          <li>Gunakan tombol "Kelola IK" untuk menambah, edit, atau hapus indikator kinerja</li>
          <li>Klik tombol "Lihat Matriks CPL - Mata Kuliah" untuk melihat pemetaan IK ke mata kuliah</li>
          <li>IK yang sudah dibuat dapat dipetakan ke mata kuliah melalui halaman Matriks</li>
        </ul>
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