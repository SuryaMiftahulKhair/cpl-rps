"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation"; // TAMBAH useSearchParams
import { BookOpen, ChevronLeft } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// Import Komponen Baru
import VisiMisiTab from "@/app/components/VisiMisiTab";
import CplIkTab from "@/app/components/CplIkTab";

export default function VisiMisiCPLPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // Inisialisasi searchParams
  
  // 1. Ambil prodiId dari URL
  const prodiId = searchParams.get("prodiId");
  const kurikulumId = Number((params as any)?.id);
  
  const [activeTab, setActiveTab] = useState<"visi_misi" | "cpl_ik">("cpl_ik");

  return (
    <DashboardLayout>
       {/* HEADER */}
       <div className="px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <BookOpen size={24} className="text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Detail Kurikulum</h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Prodi ID: <span className="font-bold text-indigo-600">{prodiId}</span> | Kelola data referensi Visi Misi, CPL dan Indikator
                    </p>
                </div>
            </div>
            {/* 2. PERBAIKAN: Tombol kembali membawa prodiId */}
            <Link 
              href={`/referensi/KP?prodiId=${prodiId}`} 
              className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all"
            >
                <ChevronLeft size={16}/> Kembali ke List
            </Link>
        </div>
      </div>

      {/* TAB NAVIGATION (Tetap Sama) */}
      <div className="px-6 lg:px-8">
        <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
          <div className="flex space-x-8 px-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("visi_misi")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeTab === "visi_misi" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Visi, Misi, Profil
            </button>
            <button
              onClick={() => setActiveTab("cpl_ik")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeTab === "cpl_ik" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
               CPL & Indikator Kinerja 
            </button>
          </div>
        </div>
      </div>

      {/* KONTEN TAB */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="bg-gray-50 rounded-b-xl shadow-sm border-x border-b border-gray-200">
          
          {/* 3. PERBAIKAN: Kirim prodiId ke komponen agar Fetching di dalam tab tidak salah data */}
          {activeTab === "visi_misi" && <VisiMisiTab prodiId={prodiId} kurikulumId={kurikulumId} />}
          
          {activeTab === "cpl_ik" && <CplIkTab prodiId={prodiId} kurikulumId={kurikulumId} />}
          
        </div>
      </div>
    </DashboardLayout>
  );
}