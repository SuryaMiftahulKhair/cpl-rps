"use client";

import React, { useState, useEffect } from "react";
import { MatakuliahModalData, CPL } from "./Matakuliah.types";
import { Loader2 } from "lucide-react";

export interface MatakuliahModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Ganti 'onSubmit' menjadi 'onSave' agar sinkron dengan page.tsx
  onSave: (data: MatakuliahModalData) => Promise<void>;
  isSaving: boolean; // Sesuaikan nama dari 'submitting' menjadi 'isSaving'
  kurikulumId: number;
  initialData?: MatakuliahModalData | null;
}

export default function MatakuliahModal({
  isOpen,
  onClose,
  onSave, // Gunakan onSave
  isSaving, // Gunakan isSaving
  kurikulumId,
  initialData,
}: MatakuliahModalProps) {
  // State Form
  const [kodeMK, setKodeMK] = useState("");
  const [nama, setNama] = useState("");
  const [sks, setSks] = useState("0");
  const [semester, setSemester] = useState<string | number>("");
  const [sifat, setSifat] = useState("");

  // State CPL
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [selectedCplIds, setSelectedCplIds] = useState<number[]>([]);

  // 1. Fetch Daftar CPL saat Modal Dibuka
  useEffect(() => {
    if (isOpen && kurikulumId) {
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

  // 2. Setup Form Data (Reset atau Load Initial Data)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setKodeMK(initialData.kode_mk);
        setNama(initialData.nama);
        setSks(String(initialData.sks ?? 0));
        setSemester(initialData.semester ?? "");
        setSifat(initialData.sifat ?? "");
        setSelectedCplIds(initialData.cpl_ids ?? []);
      } else {
        setKodeMK("");
        setNama("");
        setSks("0");
        setSemester("");
        setSifat("");
        setSelectedCplIds([]);
      }
    }
  }, [isOpen, initialData]);

  const handleCplChange = (cplId: number) => {
    setSelectedCplIds((prev) =>
      prev.includes(cplId)
        ? prev.filter((id) => id !== cplId)
        : [...prev, cplId],
    );
  };

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: MatakuliahModalData = {
      kode_mk: kodeMK,
      nama: nama,
      sks: Number(sks),
      semester: semester ? Number(semester) : null,
      sifat: sifat || null,
      cpl_ids: selectedCplIds,
    };

    onSave(formData); // Panggil onSave yang diterima dari props
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-100 flex justify-center items-center overflow-y-auto py-10 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <h2 className="text-xl font-bold mb-4 text-slate-900">
          {initialData ? "Edit" : "Tambah"} Mata Kuliah
        </h2>

        <form onSubmit={handleSubmitInternal} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Kode MK
              </label>
              <input
                type="text"
                value={kodeMK}
                onChange={(e) => setKodeMK(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-black focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                SKS
              </label>
              <input
                type="number"
                min={1}
                max={4}
                value={sks}
                onChange={(e) => setSks(e.target.value)}
                // Tambahkan logika onInput di bawah ini
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value);
                  if (val > 4) e.target.value = "4"; // Jika lebih dari 4, paksa jadi 4
                  if (val < 1 && e.target.value !== "") e.target.value = "1"; // Jika kurang dari 1, paksa jadi 1
                }}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-black focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nama Mata Kuliah
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-black focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Semester
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                // Tambahkan logika onInput di bawah ini
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value);
                  if (val > 8) e.target.value = "8"; // Jika lebih dari 8, paksa jadi 8
                  if (val < 1 && e.target.value !== "") e.target.value = "1"; // Jika kurang dari 1, paksa jadi 1
                }}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-black"
                placeholder="1-8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Sifat
              </label>
              <select
                value={sifat}
                onChange={(e) => setSifat(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md text-black">
                <option value="">- Pilih -</option>
                <option value="Wajib">Wajib</option>
                <option value="Pilihan">Pilihan</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Dukung CPL (Pilih Minimal Satu)
            </label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-slate-50 space-y-2">
              {cplList.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center">
                  Memuat data CPL...
                </p>
              ) : (
                cplList.map((cpl) => (
                  <label
                    key={cpl.id}
                    className="flex items-start gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      className="mt-1 accent-indigo-600"
                      checked={selectedCplIds.includes(cpl.id)}
                      onChange={() => handleCplChange(cpl.id)}
                    />
                    <div>
                      <span className="block text-sm font-bold text-indigo-700">
                        {cpl.kode_cpl}
                      </span>
                      <span className="block text-[10px] text-slate-600 leading-tight">
                        {cpl.deskripsi}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {isSaving && <Loader2 className="animate-spin" size={16} />}
              {initialData ? "Simpan Perubahan" : "Simpan Mata Kuliah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
