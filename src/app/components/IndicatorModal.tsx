"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

// Tipe data
type Cpl = { id: number; kode_cpl: string; deskripsi: string; };
type Indicator = { id: number; deskripsi: string; cpl_id: number; };
type PiGroup = { id: number; kode_grup: string; };

// Helper
async function parseApiError(res: Response) {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP Error ${res.status}`;
  } catch {
    return `HTTP Error ${res.status}`;
  }
}

export interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Refresh PI Group tabel
  kurikulumId: number;
  piGroup: PiGroup;
}

export default function IndicatorModal({ isOpen, onClose, onSuccess, kurikulumId, piGroup }: IndicatorModalProps) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [cplList, setCplList] = useState<Cpl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk form tambah baru
  const [newDeskripsi, setNewDeskripsi] = useState("");
  const [newCplId, setNewCplId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const piGroupId = piGroup.id;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [indRes, cplRes] = await Promise.all([
        fetch(`/api/kurikulum/${kurikulumId}/pi-group/${piGroupId}/indicator`),
        fetch(`/api/kurikulum/${kurikulumId}/cpl`)
      ]);
      if (!indRes.ok) throw new Error(await parseApiError(indRes));
      if (!cplRes.ok) throw new Error(await parseApiError(cplRes));
      
      setIndicators(await indRes.json());
      const cpls: Cpl[] = await cplRes.json();
      setCplList(cpls);
      
      if (cpls.length > 0) setNewCplId(String(cpls[0].id));
      else setNewCplId(""); // Pastikan CPL ada

    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setNewDeskripsi("");
    }
  }, [isOpen, kurikulumId, piGroupId]);

  const handleAddIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/pi-group/${piGroupId}/indicator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deskripsi: newDeskripsi, cpl_id: Number(newCplId) }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      setNewDeskripsi(""); // Reset form
      loadData(); // Refresh list
      onSuccess(); // Panggil onSuccess untuk refresh PI Group (update count)
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };
  
  const handleDeleteIndicator = async (indicatorId: number) => {
    if (!confirm("Yakin ingin menghapus indikator ini?")) return;
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/pi-group/${piGroupId}/indicator/${indicatorId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      loadData(); // Refresh list
      onSuccess(); // Panggil onSuccess untuk refresh PI Group (update count)
    } catch (err: any) { setError(err.message || "Gagal hapus"); }
  };

  if (!isOpen) return null;

  return (
    // Z-index harus lebih tinggi dari modal induknya
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Kelola Indikator untuk {piGroup.kode_grup}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        
        {loading ? <div className="text-center p-8">Memuat data...</div> : (
          <>
            <form onSubmit={handleAddIndicator} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3 text-gray-800">Tambah Indikator Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi Indikator</label>
                  <input type="text" value={newDeskripsi} onChange={(e) => setNewDeskripsi(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dipetakan ke CPL</label>
                  <select value={newCplId} onChange={(e) => setNewCplId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                    {cplList.length === 0 ? (
                       <option value="" disabled>Buat CPL dulu</option>
                    ) : (
                      cplList.map(cpl => (
                        <option key={cpl.id} value={cpl.id}>{cpl.kode_cpl} - {cpl.deskripsi.substring(0, 50)}...</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <div className="text-right mt-3">
                <button type="submit" disabled={submitting || cplList.length === 0} className="flex items-center gap-2 justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  <Plus size={16} /> {submitting ? "..." : "Tambah"}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Daftar Indikator</h3>
              {indicators.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada indikator.</p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CPL</th>
                        <th className="w-16 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {indicators.map(ind => (
                        <tr key={ind.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm text-gray-700">{ind.deskripsi}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                            {cplList.find(c => c.id === ind.cpl_id)?.kode_cpl ?? '...'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleDeleteIndicator(ind.id)} className="p-1.5 text-red-600 bg-red-50 rounded-full hover:bg-red-100" title="Hapus">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {error && <div className="mt-4 p-3 text-sm bg-red-50 text-red-700 rounded-md">{error}</div>}
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}