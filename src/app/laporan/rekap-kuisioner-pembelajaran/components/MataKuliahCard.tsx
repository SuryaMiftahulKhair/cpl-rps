"use client";

import React, { useState } from "react";
import DataModal from "./DataModal";

export default function MataKuliahCard({ kode, nama }: { kode: string; nama: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-gray-100 p-4 bg-white shadow-sm">
      <div className="text-xs text-gray-500">{kode} - <span className="font-medium text-gray-700">{nama}</span></div>

      <div className="mt-3 flex gap-2">
        <span className="px-2 py-0.5 text-xs bg-cyan-100 text-cyan-700 rounded-full">Mahasiswa</span>
        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Dosen-Mhs</span>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
        >
          Data
        </button>
      </div>

      {open && <DataModal kode={kode} nama={nama} onClose={() => setOpen(false)} />}
    </div>
  );
}
