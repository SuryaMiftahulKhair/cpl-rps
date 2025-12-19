"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Loader2, RefreshCw, Plus } from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";

import {TahunAjaranModal} from "@/app/components/TahunAjaranModal"; 

export enum Semester {
  GANJIL = 'GANJIL',
  GENAP = 'GENAP',
}
export interface TahunAjaran {
  id: number | string; 
  tahun: string;
  semester: Semester;
  kode_neosia: string;
}

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
  }
  if (parsed?.error) {
    if (Array.isArray(parsed.error)) return parsed.error.join(", ");
    if (typeof parsed.error === "string") return parsed.error;
    if (Array.isArray(parsed.error.issues)) {
      return parsed.error.issues.map((i: any) => `${i.path[0]}: ${i.message}`).join(", ");
    }
    return JSON.stringify(parsed.error);
  }
  return text || `HTTP ${res.status}`;
}

// --- Komponen Halaman Utama ---
export default function DataNilaiPage() {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tahunAjaran?page=1&limit=50");
      if (!res.ok) throw new Error(await parseApiError(res));
      const json = await res.json();
      const data = Array.isArray(json) ? json : json?.data ?? [];
      setSemesterList(data);
    } catch (err: any) {
      setError(`Gagal mengambil data semester: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTahunAjaran = async (data: { tahun: string; semester: "GANJIL" | "GENAP" ; kode_neosia : string}) => {
    setSubmitting(true);
    setError(null);
    const optimisticId = -Date.now();
    const optimisticItem: TahunAjaran = { id: optimisticId, tahun: data.tahun, semester: data.semester as Semester, kode_neosia: data.kode_neosia };
    setSemesterList((prev) => [optimisticItem, ...prev].sort((a, b) => b.tahun.localeCompare(a.tahun) || b.semester.localeCompare(a.semester)));
    setIsModalOpen(false);

    try {
      const res = await fetch("/api/tahunAjaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await parseApiError(res));

      const created = await res.json();
      
      setSemesterList((prev) =>
        prev.map((item) =>
          item.id === optimisticId ? created : item
        )
      );
    } catch (err: any)
{
      console.error("Create Tahun Ajaran error:", err);
      setError(err?.message || "Gagal menambahkan. Coba lagi.");
      setSemesterList((prev) => prev.filter((p) => p.id !== optimisticId));
    } finally {
      setSubmitting(false);
    }
  };

  const formatNamaSemester = (tahun: string, semester: "GANJIL" | "GENAP") => {
    return `${semester.toUpperCase()} ${tahun}`;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Data Nilai</h1>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilih Semester</h2>
            <div className="flex items-center justify-end mb-4 gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading || submitting}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-all font-medium text-sm disabled:opacity-50"
              >
                <Plus size={18} />
                <span>Tambah</span>
              </button>
              <button 
                onClick={fetchData}
                disabled={isLoading || submitting} 
                className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-md disabled:opacity-50"
               >
                 {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                <span>{isLoading ? "Memuat..." : "Refresh Data"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full text-center p-10 text-gray-500">
                <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                Memuat data semester...
              </div>
            ) : semesterList.length === 0 && !error ? (
              <div className="col-span-full text-center p-10 text-gray-500">
                Tidak ada data tahun ajaran.
              </div>
            ) : (
              semesterList.map((semester) => (
                <Link
                  key={semester.id}
                  href={`/penilaian/datanilai/${semester.id}`} 
                  className="block"
                >
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-indigo-600 group-hover:text-indigo-700 mb-1">
                          {formatNamaSemester(semester.tahun, semester.semester)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Tahun Ajaran {semester.tahun}
                        </p>
                        {semester.kode_neosia ? (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium border border-green-200">
                          Terhubung Neosia: {semester.kode_neosia}
                          </span>
                        ) : (
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md font-medium border border-yellow-200">
                            Belum Link Neosia
                          </span>
    )}
                      </div>
                      <Eye
                        size={24}
                        className="text-gray-400 group-hover:text-indigo-600 transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      <TahunAjaranModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTahunAjaran}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}