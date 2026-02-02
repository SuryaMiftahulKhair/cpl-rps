// file: src/app/penilaian/datakelas/[semesterid]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, Plus, BookOpen, Calendar, GraduationCap, AlertCircle, X } from "lucide-react"; 
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
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        
        {/* ================= HEADER WITH GRADIENT ================= */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Data Kelas</h1>
                <p className="text-sm text-gray-600">
                  Kelola data kelas mata kuliah per semester
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= STATS SUMMARY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Kelas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Total Kelas
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {matakuliahList.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Mata Kuliah */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Mata Kuliah
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {uniqueMK}
                </p>
              </div>
            </div>
          </div>

          {/* Total SKS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Total SKS
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalSKS}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ERROR MESSAGE ================= */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 mb-1">Terjadi Kesalahan</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Left Side - Title & Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Daftar Kelas
                </h2>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    disabled={isLoading || submitting}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    Tambah Kelas
                  </button>

                  <Link href="/penilaian/datanilai">
                    <button className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                      <ArrowLeft size={16} strokeWidth={2.5} />
                      Kembali
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Right Side - Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari kelas, kode, atau nama matakuliah..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 text-gray-900 rounded-lg text-sm hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                    Kode MK
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                    Nama Matakuliah
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                    Kelas
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                    SKS
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
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
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="h-8 bg-gray-200 rounded w-20 mx-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredMatakuliah.length === 0 ? (
                  /* Empty State - Enhanced */
                  <tr>
                    <td colSpan={5} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          {matakuliahList.length === 0 ? (
                            <BookOpen size={36} className="text-gray-400" />
                          ) : (
                            <Search size={36} className="text-gray-400" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {matakuliahList.length === 0 
                            ? "Belum Ada Kelas" 
                            : "Tidak Ditemukan"
                          }
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm mb-6">
                          {matakuliahList.length === 0 
                            ? "Belum ada kelas yang terdaftar di semester ini. Tambahkan kelas pertama untuk memulai." 
                            : "Tidak ditemukan data yang cocok dengan pencarian Anda."
                          }
                        </p>
                        {matakuliahList.length === 0 && (
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-md"
                          >
                            <Plus size={18} strokeWidth={2.5} />
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
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {mk.kodeMatakuliah}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 text-sm">
                          {mk.namaMatakuliah}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-bold">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {mk.namaKelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm">
                          {mk.sks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/penilaian/datakelas/${semesterid}/${mk.id}`}>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <BookOpen size={16} strokeWidth={2.5} />
                            Detail
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          {!isLoading && filteredMatakuliah.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
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

      {/* ================= MODAL ================= */}
      <KelasModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateKelas}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}