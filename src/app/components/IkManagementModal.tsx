"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2 } from "lucide-react";

// Tipe Data
type CPL = { id: number; kode_cpl: string; deskripsi: string; };
type IK = { id: number; kode_ik: string; deskripsi: string; cpl_id: number; };

// Helper Error
async function parseApiError(res: Response) {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP Error ${res.status}`;
  } catch {
    return `HTTP Error ${res.status}`;
  }
}

export interface IkManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kurikulumId: number;
}

export default function IkManagementModal({ isOpen, onClose, onSuccess, kurikulumId }: IkManagementModalProps) {
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [ikList, setIkList] = useState<IK[]>([]); // Untuk menampilkan list sementara (opsional)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIk, setSelectedIk] = useState<IK | null>(null);
  
  const [formData, setFormData] = useState({ 
    kode_ik: "", 
    deskripsi: "", 
    cpl_id: "" 
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Load Data CPL untuk Dropdown
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Kita ambil VM Data yang sudah include CPL dan IK nya
      const res = await fetch(`/api/kurikulum/${kurikulumId}/VMCPL`);
      if (!res.ok) throw new Error(await parseApiError(res));
      const json = await res.json();
      
      if(json.success && json.data) {
          setCplList(json.data.cpl);
          
          // Ratakan IK dari semua CPL jadi satu list untuk ditampilkan di tabel manajemen
          const allIks: IK[] = [];
          json.data.cpl.forEach((c: any) => {
              if(c.iks) {
                  allIks.push(...c.iks);
              }
          });
          setIkList(allIks);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setIsFormOpen(false);
    }
  }, [isOpen, kurikulumId]);

  const openForm = (item: IK | null = null) => {
    setSelectedIk(item);
    setFormData({
      kode_ik: item?.kode_ik ?? "",
      deskripsi: item?.deskripsi ?? "",
      cpl_id: item?.cpl_id ? String(item.cpl_id) : (cplList[0]?.id ? String(cplList[0].id) : "")
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedIk(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Endpoint API IK
    // Create: POST /api/ik
    // Update: PUT /api/ik/[id] (Anda perlu membuat route dynamic ini jika belum ada, atau pakai POST update logic)
    // Asumsi kita pakai API /api/ik untuk Create dan Logic Update sederhana
    
    // Namun untuk kerapihan, biasanya API IK itu: /api/ik (POST) dan /api/ik/[id] (PUT/DELETE)
    // Mari kita gunakan endpoint yang sudah kita siapkan logicnya sebelumnya

    const apiUrl = selectedIk 
        ? `/api/kurikulum/${kurikulumId}/ik/${selectedIk.id}`  // Pastikan route.ts ini ada
        : `/api/kurikulum/${kurikulumId}/ik`; 
    
    const method = selectedIk ? "PUT" : "POST";
    
    // Sesuaikan body dengan schema Prisma
    const body = {
        kode_ik: formData.kode_ik,
        deskripsi: formData.deskripsi,
        cpl_id: Number(formData.cpl_id)
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
      onSuccess(); // Refresh halaman utama
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus Indikator Kinerja ini?")) return;
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/ik/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await parseApiError(res));
      loadData();
      onSuccess();
    } catch (err: any) { alert("Gagal menghapus: " + err.message); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-4xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Kelola Indikator Kinerja (IK)</h2>
          <button title="Tutup" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {/* --- FORM INPUT --- */}
        {isFormOpen ? (
          <form onSubmit={handleSubmit} className="mb-6 p-5 border border-indigo-100 rounded-xl bg-indigo-50/30 space-y-4">
            <h3 className="font-semibold text-indigo-900">{selectedIk ? "Edit" : "Tambah"} Indikator</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Dropdown Pilih CPL */}
               <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Milik CPL (Induk)</label>
                <select 
                    value={formData.cpl_id} 
                    onChange={(e) => setFormData(p => ({ ...p, cpl_id: e.target.value }))} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                    required
                >
                    {cplList.length === 0 && <option value="" disabled>Belum ada CPL</option>}
                    {cplList.map(cpl => (
                        <option key={cpl.id} value={cpl.id}>
                            {cpl.kode_cpl} - {cpl.deskripsi.substring(0, 80)}...
                        </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Kode IK (Contoh: IK-1.1)</label>
                <input 
                    type="text" 
                    value={formData.kode_ik} 
                    onChange={(e) => setFormData(p => ({ ...p, kode_ik: e.target.value }))} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" 
                    required 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Deskripsi Indikator</label>
                <textarea 
                    value={formData.deskripsi} 
                    onChange={(e) => setFormData(p => ({ ...p, deskripsi: e.target.value }))} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm h-20" 
                    required 
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded">{error}</div>}
            
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeForm} disabled={submitting} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">Batal</button>
              <button type="submit" disabled={submitting || cplList.length === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                {submitting ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => openForm(null)} className="mb-6 flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 shadow-sm transition-all">
            <Plus size={18} /> <span>Tambah Indikator Baru</span>
          </button>
        )}

        {/* --- TABEL LIST IK --- */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-xs text-gray-600 uppercase">Kode IK</th>
                <th className="px-5 py-3 text-left font-semibold text-xs text-gray-600 uppercase">Induk CPL</th>
                <th className="px-5 py-3 text-left font-semibold text-xs text-gray-600 uppercase">Deskripsi</th>
                <th className="w-24 px-5 py-3 text-center font-semibold text-xs text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : ikList.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-500">Belum ada data Indikator.</td></tr>
              ) : (
                ikList.map(item => {
                    // Cari Kode CPL induknya untuk ditampilkan
                    const parentCpl = cplList.find(c => c.id === item.cpl_id);
                    return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3 font-bold text-teal-700">{item.kode_ik}</td>
                            <td className="px-5 py-3 text-xs">
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-medium">
                                    {parentCpl?.kode_cpl ?? "-"}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-gray-700 text-sm">{item.deskripsi}</td>
                            <td className="px-5 py-3">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openForm(item)} className="p-1.5 text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors" title="Edit"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors" title="Hapus"><Trash2 size={16} /></button>
                            </div>
                            </td>
                        </tr>
                    )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}