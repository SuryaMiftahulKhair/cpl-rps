"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X, Save, BookOpen } from "lucide-react";

export interface MatakuliahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
  kurikulumId: number;
}

export default function MatakuliahModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: MatakuliahModalProps) {
  const [kodeMK, setKodeMK] = useState("");
  const [nama, setNama] = useState("");
  const [sks, setSks] = useState("2");
  const [semester, setSemester] = useState("1");
  const [sifat, setSifat] = useState("WAJIB");

  useEffect(() => {
    if (isOpen) {
      setKodeMK("");
      setNama("");
      setSks("2");
      setSemester("1");
      setSifat("WAJIB");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      kode_mk: kodeMK,
      nama: nama,
      sks: Number(sks),
      semester: Number(semester),
      sifat: sifat,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-100 flex justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <BookOpen size={20} />
            <h2 className="font-bold">Tambah Mata Kuliah</h2>
          </div>
          <button
            title="Tutup"
            onClick={onClose}
            className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Kode MK
              </label>
              <input
                type="text"
                value={kodeMK}
                onChange={(e) => setKodeMK(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                SKS
              </label>
              <input
                type="number"
                value={sks}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSks(val > 6 ? "6" : val < 1 ? "1" : e.target.value);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Nama Mata Kuliah
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Semester
              </label>
              <input
                type="number"
                value={semester}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSemester(val > 8 ? "8" : val < 1 ? "1" : e.target.value);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Sifat
              </label>
              <select
                value={sifat}
                onChange={(e) => setSifat(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black">
                <option value="WAJIB">WAJIB</option>
                <option value="PILIHAN">PILIHAN</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-semibold">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
