"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Gunakan hooks untuk Client Component
import { ChevronLeft, Layers, Plus, Save, Edit, Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// 1. REVISI INTERFACE: Next.js mengharuskan params dibungkus Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RubrikPenilaianPage({ params }: PageProps) {
  const router = useRouter();
  // 2. AMBIL ID: Gunakan React.use() atau simpan di state setelah di-unwrap
  const [kurikulumId, setKurikulumId] = useState<string | null>(null);
  const [rubriks, setRubriks] = useState<any[]>([]);
  const [activeRubrik, setActiveRubrik] = useState<number | "new">(1);
  const [loading, setLoading] = useState(true);

  // Efek untuk mengambil params ID secara asinkron (Next.js 15)
  useEffect(() => {
    params.then((resolvedParams) => {
      setKurikulumId(resolvedParams.id);
      setLoading(false);
    });
  }, [params]);

  const isNewFormActive = activeRubrik === "new";

  const handleSave = () => {
    console.log(`Menyimpan rubrik untuk Kurikulum ID: ${kurikulumId}`);
    if (isNewFormActive) {
      setActiveRubrik(1);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Tombol Kembali yang fungsional */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
          <ChevronLeft size={20} /> Kembali ke Kurikulum
        </button>

        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <Layers size={24} className="text-indigo-600" />
          Rubrik Penilaian - ID: {kurikulumId}
        </h1>

        <div className="bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
            Daftar Rubrik
          </h2>

          <div className="flex gap-6">
            {/* KIRI: Daftar Rubrik */}
            <div className="w-72 border-r border-gray-200 pr-4 space-y-1 text-sm">
              {/* Di sini nanti ganti map dari data API */}
              <p className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-widest">
                Pilih Rubrik
              </p>
              {/* ... sisa map rubrik ... */}
            </div>

            {/* KANAN: Form/Detail */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700">Detail Konten</h3>
                <button
                  onClick={() => setActiveRubrik("new")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700">
                  <Plus size={16} /> Rubrik Baru
                </button>
              </div>

              {/* Konten detail atau form */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 min-h-[400px]">
                {isNewFormActive ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500 italic">
                      Form rubrik baru untuk Kurikulum {kurikulumId} akan tampil
                      di sini.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Pilih rubrik di sebelah kiri untuk melihat detail.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
