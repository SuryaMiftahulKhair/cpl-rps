"use client";

import React, { useState, useEffect } from "react";
import { MatakuliahModalData, CPL } from "./Matakuliah.types"; // Pastikan import CPL

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
  
  // State Form
  const [kodeMK, setKodeMK] = useState("");
  const [nama, setNama] = useState("");
  const [sks, setSks] = useState("0");
  const [semester, setSemester] = useState<string | number>("");
  const [sifat, setSifat] = useState("");
  
  // State CPL (BARU)
  const [cplList, setCplList] = useState<CPL[]>([]); // Daftar semua CPL yg tersedia
  const [selectedCplIds, setSelectedCplIds] = useState<number[]>([]); // ID yang dipilih user

  // 1. Fetch Daftar CPL saat Modal Dibuka
  useEffect(() => {
    if (isOpen && kurikulumId) {
      // Ambil data CPL agar user bisa memilih
      fetch(`/api/kurikulum/${kurikulumId}/cpl`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setCplList(json.data);
          }
        })
        .catch((err) => console.error("Gagal load CPL:", err));
    }
  }, [isOpen, kurikulumId]);

  // 2. Setup Form Data (Edit vs New)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setKodeMK(initialData.kode_mk);
        setNama(initialData.nama);
        setSks(String(initialData.sks ?? 0));
        setSemester(initialData.semester ?? "");
        setSifat(initialData.sifat ?? "");
        // Jika mode edit, set selectedCplIds dari data yang ada (jika tersedia)
        setSelectedCplIds(initialData.cpl_ids ?? []);
      } else {
        // Reset Form
        setKodeMK("");
        setNama("");
        setSks("");
        setSemester("");
        setSifat("");
        setSelectedCplIds([]);
      }
    }
  }, [isOpen, initialData]);

  // 3. Handle Checkbox CPL
  const handleCplChange = (cplId: number) => {
    setSelectedCplIds((prev) => {
      if (prev.includes(cplId)) {
        return prev.filter((id) => id !== cplId); // Uncheck
      } else {
        return [...prev, cplId]; // Check
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: MatakuliahModalData = {
      kode_mk: kodeMK,
      nama: nama,
      sks: Number(sks),
      semester: semester ? Number(semester) : null,
      sifat: sifat || null,
      cpl_ids: selectedCplIds, // KIRIM ARRAY ID KE SINI
    };
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto py-10">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <h2 className="text-xl font-bold mb-4 text-slate-900">
          {initialData ? "Edit" : "Tambah"} Mata Kuliah
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-900">Kode MK</label>
              <input type="text" value={kodeMK} onChange={(e) => setKodeMK(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-black" required />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-900">SKS</label>
              <input type="number" value={sks} onChange={(e) => setSks(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-black" required min="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Nama Mata Kuliah</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-black" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900">Semester</label>
              <input type="number" value={semester} onChange={(e) => setSemester(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-black" placeholder="1-8" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900">Sifat</label>
              <select value={sifat} onChange={(e) => setSifat(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-black">
                <option value="">- Pilih -</option>
                <option value="Wajib">Wajib</option>
                <option value="Pilihan">Pilihan</option>
              </select>
            </div>
          </div>

          {/* BAGIAN CHECKBOX CPL (BARU) */}
          <div className="border-t pt-4 mt-2">
            <label className="block text-sm font-bold text-slate-900 mb-2">Dukung CPL (Pilih Minimal Satu)</label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 grid gap-2">
                {cplList.length === 0 ? (
                <p className="text-xs text-slate-900 italic text-center">Belum ada data CPL di kurikulum ini.</p>
                ) : (
                    cplList.map((cpl) => (
                  <label key={cpl.id} className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                            <input 
                                type="checkbox" 
                                className="mt-1"
                                checked={selectedCplIds.includes(cpl.id)}
                                onChange={() => handleCplChange(cpl.id)}
                            />
                            <div>
                      <span className="block text-sm font-bold text-indigo-700">{cpl.kode_cpl}</span>
                      <span className="block text-xs text-slate-900 leading-tight">{cpl.deskripsi}</span>
                            </div>
                        </label>
                    ))
                )}
            </div>
            <p className="text-xs text-slate-900 mt-1">Checklist CPL yang dibebankan pada mata kuliah ini.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-slate-900 rounded hover:bg-gray-300">Batal</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}