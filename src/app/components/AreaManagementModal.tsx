"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2 } from "lucide-react";

type Area = { id: number; nama: string; };

async function parseApiError(res: Response) {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP Error ${res.status}`;
  } catch {
    return `HTTP Error ${res.status}`;
  }
}

export interface AreaManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kurikulumId: number;
}

export default function AreaManagementModal({ isOpen, onClose, onSuccess, kurikulumId }: AreaManagementModalProps) {
  const [data, setData] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [nama, setNama] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/assasment-area`);
      if (!res.ok) throw new Error(await parseApiError(res));
      setData(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setIsFormOpen(false);
    }
  }, [isOpen, kurikulumId]);

  const openForm = (item: Area | null = null) => {
    setSelectedArea(item);
    setNama(item?.nama ?? "");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedArea(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const apiUrl = selectedArea
      ? `/api/kurikulum/${kurikulumId}/assasment-area/${selectedArea.id}`
      : `/api/kurikulum/${kurikulumId}/assasment-area`;
    const method = selectedArea ? "PUT" : "POST";
    const body = { nama: nama };

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
    if (!confirm("Yakin ingin menghapus Area ini?")) return;
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/assasment-area/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await parseApiError(res));
      loadData();
      onSuccess();
    } catch (err: any) { alert("Gagal menghapus: " + err.message); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Kelola Assasment Area</h2>
          <button title="Tutup" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {isFormOpen ? (
          <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3">
            <h3 className="font-semibold">{selectedArea ? "Edit" : "Tambah"} Area</h3>
            <div>
              <label className="text-sm font-medium">Nama Area</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeForm} disabled={submitting} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Batal</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">{submitting ? "..." : "Simpan"}</button>
            </div>
          </form>
        ) : (
          <button onClick={() => openForm(null)} className="mb-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm">
            <Plus size={18} /> <span>Tambah Area</span>
          </button>
        )}

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-xs text-gray-600 uppercase">Nama Area</th>
                <th className="w-28 px-4 py-3 text-center font-semibold text-xs text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-500">Belum ada data Area.</td></tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.nama}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
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
  );
}