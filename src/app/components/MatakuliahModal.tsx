"use client";

import React, { useState, useEffect } from "react";
import { MatakuliahModalData } from "./Matakuliah.types";

export interface MatakuliahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MatakuliahModalData) => Promise<void>;
  submitting: boolean;
  kurikulumId: number;
  initialData?: MatakuliahModalData | null;
}

export default function MatakuliahModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  kurikulumId,
  initialData,
}: MatakuliahModalProps) {
  
  // State untuk form
  const [kodeMK, setKodeMK] = useState("");
  const [nama, setNama] = useState("");
  const [sks, setSks] = useState("0");
  const [semester, setSemester] = useState<string | number>(""); // FE-only
  const [sifat, setSifat] = useState(""); // FE-only

  // --- PENYESUAIAN ---
  // State dan useEffect untuk fetch CPL/PI Group dihapus
  // ---------------------

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Mode Edit
        setKodeMK(initialData.kode_mk);
        setNama(initialData.nama);
        setSks(String(initialData.sks ?? 0));
        setSemester(initialData.semester ?? "");
        setSifat(initialData.sifat ?? "");
      } else {
        // Mode Add: Reset form
        setKodeMK("");
        setNama("");
        setSks("");
        setSemester("");
        setSifat("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: MatakuliahModalData = {
      kode_mk: kodeMK,
      nama: nama,
      sks: Number(sks),
      semester: semester ? Number(semester) : null,
      sifat: sifat || null,
      // --- PENYESUAIAN ---
      // cpl_id dan pi_group_id tidak lagi dikirim
      // ---------------------
    };
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit" : "Tambah"} Mata Kuliah
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kode MK</label>
              <input
                type="text"
                value={kodeMK}
                onChange={(e) => setKodeMK(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Mata Kuliah</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SKS</label>
              <input
                type="number"
                value={sks}
                onChange={(e) => setSks(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <input
                type="number"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="cth: 1"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Sifat</label>
              <input
                type="text"
                value={sifat}
                onChange={(e) => setSifat(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="cth: Wajib"
              />
            </div>
            
            {/* --- PENYESUAIAN ---
              Select untuk CPL dan PI Group dihapus 
            --------------------- */}

          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded">
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}