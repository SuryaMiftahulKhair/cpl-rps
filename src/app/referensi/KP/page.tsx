"use client";

import { useState, FormEvent } from "react";
import { Eye, Layers, Plus, X } from "lucide-react";

// --- 1. Modal Component (Pop-up for Data Baru) ---
interface KurikulumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nama: string) => void;
}

function KurikulumModal({ isOpen, onClose, onSubmit }: KurikulumModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const namaKurikulum = formData.get("namaKurikulum");

    // Type guard to ensure it's a string
    if (typeof namaKurikulum === "string" && namaKurikulum.trim()) {
      onSubmit(namaKurikulum.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="namaKurikulum"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              NAMA KURIKULUM
            </label>
            <input
              type="text"
              id="namaKurikulum"
              name="namaKurikulum"
              required
              placeholder="Masukkan nama kurikulum"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex justify-start mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition shadow-md"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- END Modal Component ---

interface Kurikulum {
  id: number;
  nama: string;
}

export default function KurikulumProdiPage() {
  const [kurikulums, setKurikulums] = useState<Kurikulum[]>([
    { id: 1003, nama: "Kurikulum Sarjana K-23" },
    { id: 864, nama: "Kurikulum 2021" },
    { id: 118, nama: "Kurikulum 2018" },
    { id: 117, nama: "KPT 2016" },
    { id: 116, nama: "KBK 2011" },
    { id: 115, nama: "KURIKULUM 2008" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddKurikulum = (nama: string) => {
    const newId = Math.floor(Math.random() * 1000) + 2000;
    const newKurikulum = { id: newId, nama };
    setKurikulums((prev) => [newKurikulum, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 bg-gray-100 min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Layers size={24} className="text-indigo-600" />
          Kurikulum Program Studi
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-sky-700 transition duration-150 transform hover:scale-[1.01]">
            Sinkronisasi Neosia
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-500 text-white px-3 py-2.5 rounded-lg shadow-md hover:bg-green-600 transition duration-150 transform hover:scale-[1.01]"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl">
        <h2 className="text-lg font-bold p-6 pb-2 text-gray-800">Data</h2>

        <div className="overflow-x-auto border border-gray-200 rounded-b-xl">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-indigo-50">
              <tr>
                <th className="w-12 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">
                  #
                </th>
                <th className="w-24 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">
                  Nama Kurikulum
                </th>
                <th className="w-72 px-6 py-3 text-center font-bold text-xs text-indigo-700 uppercase tracking-wider">
                  Aksi Detail
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {kurikulums.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-indigo-50/50 transition duration-100"
                >
                  <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap font-mono text-gray-700">
                    {item.id}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-800">
                    {item.nama}
                    {index === 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-center space-x-2">
                    <button className="inline-flex items-center bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold transition">
                      Visi, Misi, CPL
                    </button>
                    <button className="inline-flex items-center bg-indigo-500 text-white px-2 py-1 rounded text-xs font-semibold transition">
                      Matakuliah
                    </button>
                    <button className="inline-flex items-center bg-cyan-500 text-white px-2 py-1 rounded text-xs font-semibold transition">
                      Rubrik Penilaian
                    </button>
                    <button
                      className="inline-flex items-center p-1.5 bg-red-500 text-white rounded-full transition"
                      title="Lihat Detail"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {kurikulums.length} Record ditemukan.
          </p>
        </div>
      </div>

      <KurikulumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddKurikulum}
      />
    </div>
  );
}
