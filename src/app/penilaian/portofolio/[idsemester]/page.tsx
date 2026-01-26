//file: src/app/penilaian/portofolio/[idsemester]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
  idsemester: string;
}

interface KelasPortofolio {
  id: number; // Tambahkan ID untuk key
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
        // PERBAIKAN 1: Sesuaikan query param dengan API backend (biasanya tahun_ajaran_id)
        const res = await fetch(`/api/kelas?tahun_ajaran_id=${idsemester}`);
        
        if (!res.ok) {
          throw new Error(await parseApiError(res));
        }

        const json = await res.json();

        // PERBAIKAN 2: Ambil array dari property .data & Handle jika null
        const rawData = Array.isArray(json) ? json : (json.data || []);

        // PERBAIKAN 3: Mapping data dari Backend (snake_case) ke Frontend (camelCase)
        const mappedData: KelasPortofolio[] = rawData.map((item: any) => ({
            id: item.id,
            namaKelas: item.nama_kelas,       // dari DB: nama_kelas
            kodeMatakuliah: item.kode_mk,     // dari DB: kode_mk
            namaMatakuliah: item.nama_mk,     // dari DB: nama_mk
            sks: item.sks || 0
        }));

        setKelasList(mappedData);

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(`Gagal mengambil data kelas: ${err.message}`);
        setKelasList([]); // Reset ke array kosong agar tidak error filter
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idsemester]);

  // Filter kelas berdasarkan search
  // PERBAIKAN 4: Tambahkan Optional Chaining (?.) untuk keamanan
  const filteredKelas = kelasList.filter((kelas) => {
    const term = searchTerm.toLowerCase();
    return (
        (kelas.namaMatakuliah?.toLowerCase() || "").includes(term) || 
        (kelas.kodeMatakuliah?.toLowerCase() || "").includes(term) ||
        (kelas.namaKelas?.toLowerCase() || "").includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Portofolio</h1>
          <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-gray-600">ID Semester: {idsemester}</span>
        </div>

        {/* Page Title and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Daftar Kelas</h2>
            <Link href="/penilaian/portofolio">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow flex items-center gap-2">
                <ArrowLeft size={16} />
                Kembali
              </button>
            </Link>
          </div>

          {/* Search Filters */}
              <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>

                <input
                  type="text"
                  placeholder="Cari Kode, Nama MK, atau Kelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full
                    pl-10 pr-4 py-2.5
                    border border-gray-300
                    rounded-lg
                    text-sm
                    text-gray-900
                    placeholder:text-gray-400
                    focus:ring-2 focus:ring-indigo-500
                    focus:border-indigo-500
                    outline-none
                    transition-all
                  "
                />
              </div>
        </div>

        {error && (
          <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Kelas Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">NO.</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">KODE MK</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">NAMA MATAKULIAH</th>
                    <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">KELAS</th>
                    <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">SKS</th>
                    <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                     <tr>
                        <td colSpan={6} className="text-center p-10 text-gray-500">
                           <div className="flex flex-col items-center justify-center">
                              <Loader2 size={32} className="animate-spin mb-2" />
                              Memuat data...
                           </div>
                        </td>
                     </tr>
                  ) : filteredKelas.length > 0 ? (
                    filteredKelas.map((kelas, index) => (
                      <tr key={kelas.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                        <td className="px-6 py-4 text-gray-700 font-mono">{kelas.kodeMatakuliah}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{kelas.namaMatakuliah}</td>
                        <td className="px-6 py-4 text-center">
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                                {kelas.namaKelas}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-700">{kelas.sks}</td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/penilaian/portofolio/${idsemester}/${kelas.id}`}>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                              Lihat Portofolio
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan={6} className="text-center p-10 text-gray-500 italic">
                            {kelasList.length === 0 ? "Belum ada kelas di semester ini." : "Data tidak ditemukan."}
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* Back to Top Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors opacity-80 hover:opacity-100"
            title="Kembali ke atas"
          >
            <svg className="w-6 h-6 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}