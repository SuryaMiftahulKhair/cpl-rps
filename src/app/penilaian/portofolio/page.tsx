"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Plus, RefreshCw, Loader2 } from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";
import  { TahunAjaranModal } from "@/app/components/TahunAjaranModal";

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

interface TahunAjaran {
  id: number;
  tahun: string;
  semester: "GANJIL" | "GENAP";
}

// --- Komponen Halaman Utama ---
export default function DataKelasPage() {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tahunAjaran?page=1&limit=50"); 
      if (!res.ok) throw new Error(await parseApiError(res));

      const json = await res.json();
      const data = Array.isArray(json) ? json : json?.data ?? [];

      setSemesterList(data);
    } catch (err: any) {
      console.error("Fetch Tahun Ajaran error:", err);
      setError(err?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTahunAjaran = async (data: { tahun: string; semester: "GANJIL" | "GENAP" }) => {
    setSubmitting(true);
    setError(null);

    const optimisticId = -Date.now();
    const optimisticItem: TahunAjaran = { id: optimisticId, ...data };
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

    } catch (err: any) {
      console.error("Create Tahun Ajaran error:", err);
      setError(err?.message || "Gagal menambahkan. Coba lagi.");
      setSemesterList((prev) => prev.filter((p) => p.id !== optimisticId));
    } finally {
      setSubmitting(false);
    }
  };
  
 
  const formatNamaSemester = (tahun: string, semester: "GANJIL" | "GENAP") => {
    const semesterFormatted = semester.toUpperCase();
    return `${semesterFormatted} ${tahun}`;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Data Kelas</h1>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilih Semester</h2>
            <div className="flex items-center justify-end mb-4 gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading || submitting}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-all font-medium text-sm disabled:opacity-50"
              >
                <Plus size={18} />
                <span>Tambah</span>
              </button>
              <button 
                onClick={fetchData} 
                disabled={loading || submitting}
                className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-md disabled:opacity-50"
               >
                 {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                <span>{loading ? "Memuat..." : "Refresh Data"}</span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center p-10 text-gray-500">
                <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                Memuat data semester...
              </div>
            ) : semesterList.length === 0 ? (
              <div className="col-span-full text-center p-10 text-gray-500">
                Tidak ada data tahun ajaran.
              </div>
            ) : (
              semesterList.map((semester) => (
                <Link
                  key={semester.id} 
                  href={`/penilaian/portofolio/${semester.id}`}
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