"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout"; 
import { Loader2, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; 

type Kurikulum = {
  id: number;
  nama: string;
  tahun: number;
};

export default function RpsAdminDashboardPage() {
  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId"); // Ambil prodiId dari URL Sidebar

  const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKurikulum = async () => {
      // Step 1: Validasi prodiId wajib ada agar tidak salah prodi
      if (!prodiId) {
        setLoading(false);
        return;
      } 

      setLoading(true);
      setError(null);
      try {
        // Step 2: Kirim prodiId ke API Kurikulum untuk filter data S1/S2
        const res = await fetch(`/api/kurikulum?prodiId=${prodiId}`, {
           cache: 'no-store' // Pastikan selalu ambil data terbaru
        }); 
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal memuat data kurikulum");
        }
        
        const jsonResponse = await res.json(); 
        const data: Kurikulum[] = jsonResponse.data; 
        
        setKurikulumList(data); 
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadKurikulum();
  }, [prodiId]); // Re-fetch otomatis jika user ganti prodi di Sidebar

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">RPS Matakuliah</h1>
            {/* Indikator Konteks agar user tahu sedang mengelola prodi mana */}
            <p className="text-sm text-indigo-600 font-medium">Konteks Prodi ID: {prodiId || "Memuat..."}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Content Section */}
        {!loading && !error && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilih Kurikulum</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {kurikulumList.length === 0 ? (
                <div className="col-span-full p-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                   <p className="text-gray-500 italic">Belum ada data kurikulum untuk prodi ini.</p>
                </div>
              ) : (
                kurikulumList.map(kur => (
                  <Link 
                    key={kur.id} 
                    // Step 3: Navigasi ke List MK dengan membawa kurikulumId DAN prodiId
                    href={`/rps/${kur.id}/list?prodiId=${prodiId}`} 
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors duration-300">
                         <Layers size={24} className="text-indigo-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{kur.nama}</h3>
                        <p className="text-sm text-gray-500">Tahun {kur.tahun}</p>
                      </div>
                    </div>
                    <div className="flex justify-end items-center mt-4">
                       <span className="text-sm font-medium text-indigo-600 group-hover:underline flex items-center gap-1">
                         Lihat Mata Kuliah
                         <ChevronRight size={16} />
                       </span>
                    </div>
                  </Link>
                ))
              )}

            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}