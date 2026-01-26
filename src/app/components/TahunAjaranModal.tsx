// file: src/app/components/TahunAjaranModal.tsx
"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

// === Tipe Data untuk Props ===
interface TahunAjaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { tahun: string; semester: "GANJIL" | "GENAP" ; }) => void;
  submitting: boolean;
}

// === Komponen Modal ===
export function TahunAjaranModal({ isOpen, onClose, onSubmit, submitting }: TahunAjaranModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tahun = formData.get("tahun") as string;
    const semester = formData.get("semester") as "GANJIL" | "GENAP";

    if (tahun.trim() && semester) {
      onSubmit({
        tahun: tahun.trim(),
        semester,
        
      });
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-slideUp">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Tambah Tahun Ajaran</h2>
          <button onClick={onClose} disabled={submitting} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="tahun" className="block text-sm font-semibold text-gray-700 mb-2">Tahun Ajaran <span className="text-red-500">*</span></label>
            <input type="text" id="tahun" name="tahun" required placeholder="Contoh: 2024/2025" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-500" />
          </div>
          <div>
            <label htmlFor="semester" className="block text-sm font-semibold text-gray-700 mb-2">Semester <span className="text-red-500">*</span></label>
            <select id="semester" name="semester" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-500">
              <option value="GANJIL">GANJIL</option>
              <option value="GENAP">GENAP</option>
            </select>
          </div>
          <div className="mb-4">       
       </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm disabled:opacity-50">
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TahunAjaranModal;