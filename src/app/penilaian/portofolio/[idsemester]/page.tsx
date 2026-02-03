//file: src/app/penilaian/portofolio/[idsemester]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Loader2, 
  Search, 
  FolderOpen,
  Calendar,
  BookOpen,
  FileText,
  ChevronRight,
  X
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
  idsemester: string;
}

interface KelasPortofolio {
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

// --- Main Component ---
export default function PortofolioKelasListPage({
  params
}: {
  params: Promise<PageParams>
}) {
  const resolvedParams = use(params);
  const { idsemester } = resolvedParams;
  
  const [kelasList, setKelasList] = useState<KelasPortofolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!idsemester) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/kelas?tahun_ajaran_id=${idsemester}`);
        
        if (!res.ok) {
          throw new Error(await parseApiError(res));
        }

        const json = await res.json();
        const rawData = Array.isArray(json) ? json : (json.data || []);

        const mappedData: KelasPortofolio[] = rawData.map((item: any) => ({
          id: item.id,
          namaKelas: item.nama_kelas,
          kodeMatakuliah: item.kode_mk,
          namaMatakuliah: item.nama_mk,
          sks: item.sks || 0
        }));

        setKelasList(mappedData);

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(`Gagal mengambil data kelas: ${err.message}`);
        setKelasList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idsemester]);

  // Filter kelas berdasarkan search
  const filteredKelas = kelasList.filter((kelas) => {
    const term = searchTerm.toLowerCase();
    return (
      (kelas.namaMatakuliah?.toLowerCase() || "").includes(term) || 
      (kelas.kodeMatakuliah?.toLowerCase() || "").includes(term) ||
      (kelas.namaKelas?.toLowerCase() || "").includes(term)
    );
  });

  // Calculate stats
  const totalSKS = kelasList.reduce((sum, kelas) => sum + kelas.sks, 0);
  const uniqueMK = new Set(kelasList.map(k => k.kodeMatakuliah)).size;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/penilaian/portofolio" className="hover:text-indigo-600 transition-colors">
            Portofolio
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Daftar Kelas</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <FolderOpen size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Portofolio Kelas
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola portofolio mahasiswa per kelas
                </p>
              </div>
            </div>

            {/* Right: Back Button */}
            <Link href="/penilaian/portofolio">
              <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>Kembali</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Kelas */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                <FolderOpen size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-0.5">
                  Total Kelas
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {kelasList.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Mata Kuliah */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500 rounded-xl shadow-md">
                <BookOpen size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-0.5">
                  Mata Kuliah
                </p>
                <p className="text-3xl font-bold text-pink-900">
                  {uniqueMK}
                </p>
              </div>
            </div>
          </div>

          {/* Total SKS */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-xl shadow-md">
                <Calendar size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
                  Total SKS
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {totalSKS}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== ERROR ALERT ========== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
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
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Daftar Kelas</h2>
                  <p className="text-sm text-gray-600">
                    {isLoading 
                      ? "Memuat data..." 
                      : `${filteredKelas.length} dari ${kelasList.length} kelas`
                    }
                  </p>
                </div>
              </div>
              
              {/* Right: Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari kode, nama, atau kelas..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    No
                  </th>
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
                        <td className="px-6 py-5 text-center">
                          <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                        </td>
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
                          <div className="h-9 bg-gray-200 rounded-lg w-32 ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredKelas.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan={6} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                          {kelasList.length === 0 ? (
                            <FolderOpen size={40} className="text-purple-500" />
                          ) : (
                            <Search size={40} className="text-purple-500" />
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {kelasList.length === 0 
                            ? "Belum Ada Kelas" 
                            : "Tidak Ditemukan"
                          }
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          {kelasList.length === 0 
                            ? "Belum ada kelas yang terdaftar di semester ini" 
                            : "Tidak ditemukan data yang cocok dengan pencarian Anda"
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Data Rows */
                  filteredKelas.map((kelas, index) => (
                    <tr 
                      key={kelas.id} 
                      className="group hover:bg-purple-50/40 transition-all duration-150"
                    >
                      {/* No */}
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-medium text-gray-600">
                          {index + 1}
                        </span>
                      </td>

                      {/* Kode MK */}
                      <td className="px-6 py-5">
                        <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                          {kelas.kodeMatakuliah}
                        </span>
                      </td>

                      {/* Nama Matakuliah */}
                      <td className="px-6 py-5">
                        <span className="font-bold text-gray-900 text-base">
                          {kelas.namaMatakuliah}
                        </span>
                      </td>

                      {/* Kelas */}
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 text-sm font-bold">
                          <FileText size={14} />
                          {kelas.namaKelas}
                        </span>
                      </td>

                      {/* SKS */}
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 rounded-xl font-bold text-base border border-indigo-200">
                          {kelas.sks}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Link href={`/penilaian/portofolio/${idsemester}/${kelas.id}`}>
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 group/btn">
                              <FolderOpen size={16} className="group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                              <span>Lihat Portofolio</span>
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
          {!isLoading && filteredKelas.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Menampilkan <span className="font-bold text-gray-900">{filteredKelas.length}</span> dari <span className="font-bold text-gray-900">{kelasList.length}</span> kelas
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
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
    </DashboardLayout>
  );
}