'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Eye } from 'lucide-react';
import DashboardLayout from "@/app/components/DashboardLayout";

// Type definitions
interface Curriculum {
  id: number;
  name: string;
}

// Data kurikulum - nanti bisa diganti dengan fetch dari API
const curriculumData: Curriculum[] = [
  { id: 1003, name: 'Kurikulum Sarjana K-23' },
  { id: 864, name: 'Kurikulum 2021' },
  { id: 118, name: 'Kurikulum 2018' },
  { id: 117, name: 'KPT 2016' },
  { id: 116, name: 'KBK 2011' },
  { id: 115, name: 'KURIKULUM 2008' }
];

export default function CPLProdiPage() {
  const router = useRouter();
  const [data, setData] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulasi fetch data - nanti bisa diganti dengan API call
      // const res = await fetch('/api/kurikulum');
      // const json = await res.json();
      
      // Untuk sementara pakai data statis
      setTimeout(() => {
        setData(curriculumData);
        setLoading(false);
      }, 500);
    } catch (err: any) {
      console.error('Load data error:', err);
      setError(err?.message ?? 'Terjadi kesalahan saat memuat data.');
      setData([]);
      setLoading(false);
    }
  };

  const handleOpenGrafik = (curriculum: Curriculum) => {
    // Navigate ke halaman grafik dengan ID kurikulum
    router.push(`/laporan/cpl-prodi/grafik/${curriculum.id}`);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Laporan CPL Prodi</h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-sky-700"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-xl">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-700">CPL Matakuliah</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-500 mt-3">Memuat data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">NAMA KURIKULUM</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((curriculum, index) => (
                      <tr key={curriculum.id} className="border-b border-gray-100 hover:bg-indigo-50/50 transition">
                        <td className="py-3 px-4 text-sm text-gray-700">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{curriculum.id}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{curriculum.name}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenGrafik(curriculum)}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                          >
                            <Eye size={16} />
                            Buka
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Menampilkan total <span className="font-semibold">{data.length}</span> kurikulum.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}