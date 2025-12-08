"use client";

import React from "react";

export default function DataModal({ kode, nama, onClose }: { kode: string; nama: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-auto" style={{ maxHeight: '90vh' }}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Data</h3>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm px-3 py-1 bg-gray-100 rounded">Tutup</button>
            <button className="text-sm px-3 py-1 bg-cyan-600 text-white rounded">Unduh</button>
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-sm text-gray-600 mb-3">Grafik Kuisioner Pembelajaran - {kode} / {nama}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded border border-gray-100">
              <div className="h-48 bg-white rounded shadow-inner flex items-end gap-1 px-2">
                {/* simple placeholder bars */}
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="flex-1 mx-0.5 bg-blue-500" style={{ height: `${40 + (i % 6) * 6}px` }} />
                ))}
              </div>
            </div>

            <div>
              <div className="bg-white p-4 rounded border mb-4">
                <h5 className="text-sm font-medium">Keterangan Nilai</h5>
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  <li>4 : Sangat Setuju / Sangat Baik</li>
                  <li>3 : Setuju / Baik</li>
                  <li>2 : Ragu-ragu / Cukup</li>
                  <li>1 : Tidak Setuju / Kurang</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded border text-sm text-gray-700">
                <h5 className="font-medium mb-2">Informasi Pertanyaan Kuisioner</h5>
                <ol className="list-decimal pl-4 text-xs text-gray-600 space-y-1">
                  <li>Dosen Menyampaikan RPS dan Kontrak Perkuliahan</li>
                  <li>Dosen Menjalankan Proses Pembelajaran yang berpusat pada mahasiswa</li>
                  <li>Dosen Menyiapkan materi pembelajaran dan sumber belajar</li>
                  <li>Dosen memberikan penilaian sesuai kontrak perkuliahan</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
