"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  Upload, 
  Search,
  Filter,
  Loader2, 
  GraduationCap,
  MoreHorizontal,
  ChevronRight,
  FileSpreadsheet
} from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";
import {MahasiswaModal} from "@/app/components/MahasiswaModal";
import { json } from "stream/consumers";


interface Mahasiswa {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
}

export default function MasterMahasiswaPage() {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk Search & Filter
  const [searchTerm, setSearchTerm] = useState("");  
  // State Modal (Untuk Tambah Manual)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Mock Data Fetching (Ganti dengan API Call nanti) ---
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
  
      const res = await fetch(`/api/mahasiswa?q=${searchTerm}`); 
      const json = await res.json();
      
      
      setMahasiswaList(json.data || []);

    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Gagal memuat data mahasiswa.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Data Master</span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Mahasiswa</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            
            {/* Left: Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <Users size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Data Mahasiswa
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola data induk mahasiswa • 
                  <span className="font-semibold text-indigo-700 ml-1">
                    {mahasiswaList.length} Mahasiswa Terdaftar
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap gap-3">
              {/* Tombol Import Excel */}
              <Link 
                href="/referensi/mahasiswa/import" 
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 px-5 py-3 rounded-xl shadow-sm hover:shadow transition-all font-semibold group"
              >
                <FileSpreadsheet size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                <span>Import Excel</span>
              </Link>

              {/* Tombol Tambah Manual */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>Tambah Mahasiswa</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========== SEARCH & FILTER BAR ========== */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Cari NIM atau Nama Mahasiswa..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none shadow-sm text-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="w-full md:w-48 relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                
            </div>
        </div>

        {/* ========== ERROR ALERT ========== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <Loader2 className="animate-spin" /> {/* Placeholder icon */}
            <div>
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ========== TABLE ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Mahasiswa</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  /* Loading Skeleton */
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                      <td className="px-6 py-5"><div className="h-5 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-5">
                          <div className="space-y-2">
                              <div className="h-5 bg-gray-200 rounded w-48"></div>
                              <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                      </td>
                      <td className="px-6 py-5"><div className="h-5 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-5"><div className="h-8 bg-gray-200 rounded-lg w-20"></div></td>
                      <td className="px-6 py-5"><div className="h-8 bg-gray-200 rounded-lg w-10 ml-auto"></div></td>
                    </tr>
                  ))
                ) : mahasiswaList.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan={6} className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-5 shadow-inner">
                          <Users size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Mahasiswa</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-md">
                          Gunakan tombol "Import Excel" untuk menambahkan data mahasiswa secara massal atau "Tambah Mahasiswa" untuk input manual.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Data Rows */
                  mahasiswaList.map((mhs, index) => (
                    <tr key={mhs.id} className="group hover:bg-indigo-50/40 transition-all duration-150">
                      <td className="px-6 py-5 text-gray-500 font-medium text-sm">
                        {index + 1}
                      </td>
                      
                      <td className="px-6 py-5">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded text-sm border border-indigo-100">
                            {mhs.nim}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-base group-hover:text-indigo-700 transition-colors">
                            {mhs.nama}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <GraduationCap size={12} /> {mhs.prodi}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white bg-transparent border border-transparent hover:border-gray-200 rounded-lg transition-all">
                                <span className="text-xs font-semibold">Edit</span>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Pagination */}
          {mahasiswaList.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-600">Menampilkan <strong>{mahasiswaList.length}</strong> mahasiswa</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded bg-white disabled:opacity-50" disabled>Prev</button>
                    <button className="px-3 py-1 border rounded bg-white hover:bg-indigo-500">Next</button>
                </div>
            </div>
          )}
        </div>
      </div>
       <MahasiswaModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={loadData}
       />
    </DashboardLayout>
  );
}