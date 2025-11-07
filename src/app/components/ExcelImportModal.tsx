"use client";

import React, { useState } from "react";
import * as XLSX from 'xlsx';
import { MatakuliahModalData } from "./Matakuliah.types";

export interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: MatakuliahModalData[]) => Promise<void>;
  kurikulumId: number;
  submitting: boolean;
}

export function ExcelImportModal({ isOpen, onClose, onImport, kurikulumId, submitting }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<MatakuliahModalData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);

    try {
      const data = await f.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];

      const mappedData: MatakuliahModalData[] = json.map(row => ({
        // --- PENYESUAIAN ---
        // Sesuaikan nama kolom di file Excel kakak
        kode_mk: row["Kode MK"] || row["kode_mk"],
        nama: row["Nama MK"] || row["nama"],
        sks: row["SKS"] || row["sks"],
        semester: row["Semester"] || row["semester"],
        sifat: row["Sifat"] || row["sifat"],
        // cpl_id dan pi_group_id tidak lagi dibaca dari Excel
        // ---------------------
      }));

      // Filter data yang tidak valid
      const validData = mappedData.filter(d => d.kode_mk && d.nama && d.sks != null);
      setParsedData(validData);

      if (validData.length === 0 && json.length > 0) {
        throw new Error("Kolom Excel tidak sesuai. Pastikan ada 'Kode MK', 'Nama MK', 'SKS'.");
      }

    } catch (err: any) {
      setError("Gagal membaca file: " + err.message);
      setParsedData([]);
    }
  };

  const handleImportClick = () => {
    if (parsedData.length > 0) {
      onImport(parsedData);
    } else {
      setError("Tidak ada data valid untuk diimpor.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Import Mata Kuliah dari Excel</h2>
        
        <p className="text-sm text-gray-600 mb-2">
          Upload file Excel (.xlsx) dengan kolom: <br/>
          <strong className="text-gray-800">Kode MK</strong>, 
          <strong className="text-gray-800">Nama MK</strong>, 
          <strong className="text-gray-800">SKS</strong>, 
          (Opsional: <strong className="text-gray-800">Semester</strong>, <strong className="text-gray-800">Sifat</strong>)
        </p>
        
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        
        {parsedData.length > 0 && (
          <p className="text-green-600 text-sm mt-2">
            Berhasil memuat {parsedData.length} data. Klik Import untuk melanjutkan.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Batal
          </button>
          <button 
            type="button" 
            onClick={handleImportClick} 
            disabled={submitting || parsedData.length === 0} 
            className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? "Mengimpor..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}