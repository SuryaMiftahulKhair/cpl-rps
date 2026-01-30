"use client";

import { Matakuliah } from "./Matakuliah.types";

export interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matakuliah: Matakuliah | null;
}

export default function DetailModal({ isOpen, onClose, matakuliah }: DetailModalProps) {
  if (!isOpen || !matakuliah) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Detail Mata Kuliah</h2>
        
        <div className="space-y-2">
          <p><strong>ID:</strong> {matakuliah.id}</p>
          <p><strong>Kode MK:</strong> {matakuliah.kode_mk}</p>
          <p><strong>Nama:</strong> {matakuliah.nama}</p>
          <p><strong>SKS:</strong> {matakuliah.sks}</p>
          <p><strong>Semester:</strong> {matakuliah.semester ?? "-"}</p>
          <p><strong>Sifat:</strong> {matakuliah.sifat ?? "-"}</p>
          {/* Data ini mungkin tidak ada lagi, tapi logikanya aman */}
          <p><strong>CPL:</strong> {Array.isArray(matakuliah.cpl) ? matakuliah.cpl.map((item: any) => item.name || item.id).join(", ") : matakuliah.cpl ?? "-"}</p>
          <p><strong>PI Area:</strong> {matakuliah.pi_area ?? "-"}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}