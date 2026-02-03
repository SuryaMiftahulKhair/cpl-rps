// file: src/app/penilaian/datakelas/[semesterid]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Loader2, 
  Search, 
  Plus, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  AlertCircle, 
  X,
  ChevronRight,
  Award
} from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";
import KelasModal from "@/app/components/KelasModal";

interface PageParams {
  semesterid: string;
}

interface MatakuliahKelas {
  id: number;
  namaKelas: string;
  kodeMatakuliah: string;
  namaMatakuliah: string;
  sks: number;
}

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (parsed?.error) return typeof parsed.error === "string" ? parsed.error : JSON.stringify(parsed.error);
  } catch {}
  return text || `HTTP ${res.status}`;
}

export default function SemesterMatakuliahListPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = use(params);
  const { semesterid } = resolvedParams;

  // State Data
  const [matakuliahList, setMatakuliahList] = useState<MatakuliahKelas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal Manual & Search
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 

  // Fetch Data dari DB Lokal
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/kelas?tahun_ajaran_id=${semesterid}`);
      if (!res.ok) throw new Error(await parseApiError(res));
      
      const json = await res.json();
      const rawData = Array.isArray(json) ? json : (json.data || []);
      
      const mappedData: MatakuliahKelas[] = rawData.map((item: any) => ({
        id: item.id,
        namaKelas: item.nama_kelas,
        kodeMatakuliah: item.kode_mk,
        namaMatakuliah: item.nama_mk,
        sks: item.sks,
      }));

      setMatakuliahList(mappedData);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(`Gagal mengambil data kelas: ${err.message || "Error tidak diketahui"}`);
      setMatakuliahList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (semesterid) fetchData();
  }, [semesterid]);

  // Handler Create Kelas Manual 
  const handleCreateKelas = async (data: { kode_mk: string; nama_mk: string; nama_kelas: string; sks: number; matakuliah_id?: number }) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        tahun_ajaran_id: parseInt(semesterid),
      };

      const res = await fetch("/api/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await parseApiError(res));

      setIsModalOpen(false);
      await fetchData();
      alert("Berhasil menambah kelas!");
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Logic
  const filteredMatakuliah = matakuliahList.filter((mk) => {
    const term = searchTerm.toLowerCase();
    return (
      mk.namaKelas.toLowerCase().includes(term) ||
      mk.kodeMatakuliah.toLowerCase().includes(term) ||
      mk.namaMatakuliah.toLowerCase().includes(term)
    );
  });

  // Calculate stats
  const totalSKS = matakuliahList.reduce((sum, mk) => sum + mk.sks, 0);
  const uniqueMK = new Set(matakuliahList.map(mk => mk.kodeMatakuliah)).size;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/penilaian/datanilai" className="hover:text-indigo-600 transition-colors">
            Data Nilai
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Data Kelas</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <BookOpen size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Data Kelas
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola data kelas mata kuliah per semester
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Link href="/penilaian/datanilai">
                <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                  <ArrowLeft size={18} />
                  <span>Kembali</span>
                </button>
              </Link>

              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading || submitting}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>Tambah Kelas</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Kelas */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-xl shadow-md">
                <GraduationCap size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
                  Total Kelas
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {matakuliahList.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Mata Kuliah */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                <BookOpen size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
                  Mata Kuliah
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {uniqueMK}
                </p>
              </div>
            </div>
          </div>

          {/* Total SKS */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl shadow-md">
                <Calendar size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                  Total SKS
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {totalSKS}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== ERROR ALERT ========== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X size={18} className="text-red-600" />
            </button>
          </div>
        )}

        {/* ========== MAIN CONTENT ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Left: Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <GraduationCap size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Daftar Kelas</h2>
                  <p className="text-sm text-gray-600">
                    {isLoading 
                      ? "Memuat data..." 
                      : `${filteredMatakuliah.length} dari ${matakuliahList.length} kelas`
                    }
                  </p>
                </div>
              </div>
              
              {/* Right: Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari kelas, kode, atau matakuliah..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kode MK
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Matakuliah
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKS
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {/* Loading State - Skeleton */}
                {isLoading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-6 bg-gray-200 rounded w-48"></div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="h-6 bg-gray-200 rounded-lg w-16 mx-auto"></div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="h-8 bg-gray-200 rounded-lg w-10 mx-auto"></div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="h-9 bg-gray-200 rounded-lg w-20 ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredMatakuliah.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan={5} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                          {matakuliahList.length === 0 ? (
                            <BookOpen size={40} className="text-indigo-500" />
                          ) : (
                            <Search size={40} className="text-indigo-500" />
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {matakuliahList.length === 0 
                            ? "Belum Ada Kelas" 
                            : "Tidak Ditemukan"
                          }
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mb-6">
                          {matakuliahList.length === 0 
                            ? "Tambahkan kelas pertama untuk mulai mengelola data kelas" 
                            : "Tidak ditemukan data yang cocok dengan pencarian Anda"
                          }
                        </p>
                        {matakuliahList.length === 0 && (
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <Plus size={20} strokeWidth={2.5} />
                            Tambah Kelas Pertama
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Data Rows */
                  filteredMatakuliah.map((mk) => (
                    <tr 
                      key={mk.id} 
                      className="group hover:bg-indigo-50/40 transition-all duration-150"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                          {mk.kodeMatakuliah}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-gray-900 text-base">
                          {mk.namaMatakuliah}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 text-sm font-bold">
                          <GraduationCap size={14} />
                          {mk.namaKelas}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 rounded-xl font-bold text-base border border-emerald-200">
                          {mk.sks}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Link href={`/penilaian/datakelas/${semesterid}/${mk.id}`}>
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 group/btn">
                              <BookOpen size={16} className="group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                              <span>Detail</span>
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          {!isLoading && filteredMatakuliah.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Menampilkan <span className="font-bold text-gray-900">{filteredMatakuliah.length}</span> dari <span className="font-bold text-gray-900">{matakuliahList.length}</span> kelas
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    <X size={14} />
                    Hapus Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== MODAL ========== */}
      <KelasModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateKelas}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}