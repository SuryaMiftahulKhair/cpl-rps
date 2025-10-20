"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";

export default function JenisPenilaianPage() {
  const [data] = useState([
    { id: 1, nama: "Tugas", basis: "Tugas", dipilih: true },
    { id: 2, nama: "Quiz", basis: "Quiz", dipilih: true },
    { id: 3, nama: "Mid Tes", basis: "Ujian Tengah Semester", dipilih: true },
    { id: 4, nama: "Final Tes", basis: "Ujian Akhir Semester", dipilih: true },
    { id: 5, nama: "Partisipasi", basis: "Aktifitas Partisipatif", dipilih: true },
    { id: 6, nama: "Observasi", basis: "Aktifitas Partisipatif", dipilih: true },
    { id: 7, nama: "Tes Tertulis", basis: "Quiz", dipilih: true },
    { id: 8, nama: "Praktikum", basis: "Tugas", dipilih: true },
  ]);

  return (
    // Base container is consistent with HomePage
    <div className="p-8 bg-gray-100 min-h-screen">
      
      {/* Page Header and Controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jenis Penilaian</h1>
        <button 
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.01]"
        >
          <Plus size={18} />
          Data Baru
        </button>
      </div>

      {/* Main Card Container */}
      <div className="bg-white shadow-xl rounded-xl p-6">
        
        {/* Search and Filter Row */}
        <div className="flex justify-end items-center mb-5">
            <div className="relative w-72">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari penilaian..."
                    className="w-full py-2 pl-10 pr-4 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            
            {/* Table Head */}
            <thead className="bg-indigo-50">
              <tr>
                <th className="w-12 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">Nama Penilaian</th>
                <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">Basis Penilaian</th>
                <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">Dapat Dipilih</th>
                <th className="w-24 px-6 py-3 text-center font-bold text-xs text-indigo-700 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/50 transition duration-100">
                  <td className="px-6 py-3 whitespace-nowrap text-gray-500">{item.id}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-700">{item.nama}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-600">{item.basis}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {/* Badge for "Dapat Dipilih" status */}
                    <span 
                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                            item.dipilih 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {item.dipilih ? 'Ya' : 'Tidak'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-center space-x-2">
                    {/* Edit Button */}
                    <button 
                        className="p-1.5 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition duration-150"
                        title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    {/* Delete Button */}
                    <button 
                        className="p-1.5 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition duration-150"
                        title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}