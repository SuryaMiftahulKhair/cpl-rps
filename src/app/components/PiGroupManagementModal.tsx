"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2, ChevronsRight } from "lucide-react";
import IndicatorModal from "./IndicatorModal"; // Modal di dalam modal

type Area = { id: number; nama: string; };
type PiGroup = {
  id: number;
  kode_grup: string;
  assasment: Area;
  _count: { indicators: number };
};

async function parseApiError(res: Response) {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP Error ${res.status}`;
  } catch {
    return `HTTP Error ${res.status}`;
  }
}

export interface PiGroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kurikulumId: number;
}

export default function PiGroupManagementModal({ isOpen, onClose, onSuccess, kurikulumId }: PiGroupManagementModalProps) {
  const [data, setData] = useState<PiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPi, setSelectedPi] = useState<PiGroup | null>(null);
  const [formData, setFormData] = useState({ kodeGrup: "", selectedAreaId: "" });
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [selectedPiForIndicator, setSelectedPiForIndicator] = useState<PiGroup | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [piRes, areaRes] = await Promise.all([
        fetch(`/api/kurikulum/${kurikulumId}/pi-group`),
        fetch(`/api/kurikulum/${kurikulumId}/assasment-area`)
      ]);
      if (!piRes.ok) throw new Error(await parseApiError(piRes));
      if (!areaRes.ok) throw new Error(await parseApiError(areaRes));
      setData(await piRes.json());
      setAreaList(await areaRes.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setIsFormOpen(false);
      setIsIndicatorModalOpen(false);
    }
  }, [isOpen, kurikulumId]);

  const openForm = (item: PiGroup | null = null) => {
    setSelectedPi(item);
    setFormData({
      kodeGrup: item?.kode_grup ?? "",
      selectedAreaId: item?.assasment?.id ? String(item.assasment.id) : (areaList[0]?.id ? String(areaList[0].id) : "")
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedPi(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const apiUrl = selectedPi
      ? `/api/kurikulum/${kurikulumId}/pi-group/${selectedPi.id}`
      : `/api/kurikulum/${kurikulumId}/pi-group`;
    const method = selectedPi ? "PUT" : "POST";
    const body = { 
      kode_grup: formData.kodeGrup, 
      assesment_id: Number(formData.selectedAreaId) 
    };

    try {
      const res = await fetch(apiUrl, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      closeForm();
      loadData();
      onSuccess();
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("YAKIN? Ini akan menghapus PI Group DAN SEMUA Indikator di dalamnya.")) return;
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/pi-group/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await parseApiError(res));
      loadData();
      onSuccess();
    } catch (err: any) { alert("Gagal menghapus: " + err.message); }
  };
  
  const openIndicatorModal = (item: PiGroup) => {
    setSelectedPiForIndicator(item);
    setIsIndicatorModalOpen(true);
  };
  
  const handleIndicatorSuccess = () => {
    setIsIndicatorModalOpen(false);
    loadData(); // Refresh tabel PI Group (untuk update _count)
    onSuccess(); // Refresh tabel ringkasan
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-4xl my-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Kelola PI Group & Indikator</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>

          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3">
              <h3 className="font-semibold">{selectedPi ? "Edit" : "Tambah"} PI Group</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Kode PI Group</label>
                  <input type="text" value={formData.kodeGrup} onChange={(e) => setFormData(p => ({ ...p, kodeGrup: e.target.value }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                 <div>
                  <label className="text-sm font-medium">Assasment Area</label>
                  <select value={formData.selectedAreaId} onChange={(e) => setFormData(p => ({ ...p, selectedAreaId: e.target.value }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                    {areaList.length === 0 ? (
                      <option value="" disabled>Buat Area dulu</option>
                    ) : (
                      areaList.map(area => (
                        <option key={area.id} value={area.id}>{area.nama}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeForm} disabled={submitting} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Batal</button>
                <button type="submit" disabled={submitting || areaList.length === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">{submitting ? "..." : "Simpan"}</button>
              </div>
            </form>
          ) : (
            <button onClick={() => openForm(null)} className="mb-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm">
              <Plus size={18} /> <span>Tambah PI Group</span>
            </button>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-gray-600 uppercase">Kode PI</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-gray-600 uppercase">Assasment Area</th>
                  <th className="w-32 px-4 py-3 text-center font-semibold text-xs text-gray-600 uppercase">Jml Indikator</th>
                  <th className="w-48 px-4 py-3 text-center font-semibold text-xs text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Belum ada data PI Group.</td></tr>
                ) : (
                  data.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-indigo-700">{item.kode_grup}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{item.assasment?.nama ?? "-"}</td>
      
                      {/* --- PERBAIKAN DI SINI --- */}
                      <td className="px-4 py-3 text-gray-700 text-sm text-center">{item._count?.indicators ?? 0}</td>
                      {/* ----------------------- */}
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openIndicatorModal(item)} className="p-2 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100" title="Kelola Indikator">
                            <ChevronsRight size={16} />
                          </button>
                          <button onClick={() => openForm(item)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100" title="Edit"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Hapus"><Trash2 size={16} /></button>
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

      {/* Modal Indikator (Modal di dalam Modal) */}
      {selectedPiForIndicator && (
        <IndicatorModal 
          isOpen={isIndicatorModalOpen} 
          onClose={() => setIsIndicatorModalOpen(false)} 
          onSuccess={handleIndicatorSuccess} 
          kurikulumId={kurikulumId} 
          piGroup={selectedPiForIndicator} 
        />
      )}
    </>
  );
}