// file: src/app/components/KelasModal.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { X, Loader2 } from "lucide-react";

interface MataKuliahOption {
  id: number;
  kode_mk: string;
  nama: string;
}

interface KelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { mata_kuliah_id: number; nama_kelas: string }) => void;
  submitting: boolean;
}

export default function KelasModal({ isOpen, onClose, onSubmit, submitting }: KelasModalProps) {
  const [mkOptions, setMkOptions] = useState<MataKuliahOption[]>([]);
  const [loadingMk, setLoadingMk] = useState(false);
  
  // Load data Matakuliah saat modal dibuka
  useEffect(() => {
    if (isOpen && mkOptions.length === 0) {
      setLoadingMk(true);
      fetch('/api/listMatkul')
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) setMkOptions(data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingMk(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mkId = formData.get("mata_kuliah_id");
    const namaKelas = formData.get("nama_kelas");

    if (mkId && namaKelas) {
      onSubmit({
        mata_kuliah_id: Number(mkId),
        nama_kelas: String(namaKelas).trim()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-slideUp">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Tambah Kelas Baru</h2>
          <button onClick={onClose} disabled={submitting} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dropdown Mata Kuliah */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mata Kuliah <span className="text-red-500">*</span>
            </label>
            <select 
              name="mata_kuliah_id" 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
              disabled={loadingMk || submitting}
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {mkOptions.map((mk) => (
                <option key={mk.id} value={mk.id}>
                  {mk.kode_mk} - {mk.nama}
                </option>
              ))}
            </select>
            {loadingMk && <p className="text-xs text-indigo-500 mt-1">Memuat data mata kuliah...</p>}
          </div>

          {/* Input Nama Kelas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Kelas <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="nama_kelas" 
              required 
              placeholder="Contoh: Kelas A, Kelas B, International Class" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 outline-none"
              disabled={submitting}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 shadow-sm disabled:opacity-50 flex justify-center items-center gap-2">
              {submitting && <Loader2 size={16} className="animate-spin"/>}
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}