"use client";

import { useEffect, useState } from "react";
// import DashboardLayout, { useAuth } from "@/app/components/DashboardLayout"; // <-- Dihapus
import DashboardLayout from "@/app/components/DashboardLayout"; // <-- Versi Polosan
import { Loader2, BookCopy, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";

// Tipe data untuk Kurikulum
type Kurikulum = {
  id: number;
  nama: string;
  tahun: number;
};

export default function RpsAdminDashboardPage() {
  // const { user, loading: authLoading } = useAuth(); // <-- Dihapus
  const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKurikulum = async () => {
      // if (authLoading || !user) return; // <-- Dihapus
      
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/kurikulum"); 
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal memuat data kurikulum");
        }
        
        // --- PERBAIKAN DI SINI ---
        const jsonResponse = await res.json(); 
        const data: Kurikulum[] = jsonResponse.data; // Ambil array 'data'
        
        setKurikulumList(data); // Set list dengan array
        // -------------------------
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadKurikulum();
  }, []); // <-- Dihapus dependency [user, authLoading]

  // const isLoading = authLoading || loading; // <-- Dihapus

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">RPS Matakuliah</h1>
          {/* Info user Dihapus */}
        </div>

        {loading && ( // <-- Diganti dari isLoading
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && ( // <-- Diganti dari isLoading
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilih Kurikulum</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {kurikulumList.length === 0 ? (
                <p className="text-gray-500">Belum ada kurikulum. Silakan tambahkan di halaman "Referensi".</p>
              ) : (
                kurikulumList.map(kur => ( // Ini sekarang akan aman
                  <Link 
                    key={kur.id} 
                    // --- PERBAIKAN: Arahkan ke folder 'list' kakak ---
                    href={`/rps/${kur.id}/list`} 
                    // ---------------------------------------------
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-lg">
                         <Layers size={24} className="text-indigo-600" />
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