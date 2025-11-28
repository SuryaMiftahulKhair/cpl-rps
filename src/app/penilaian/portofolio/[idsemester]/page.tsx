"use client";

import { useState,useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
    idsemester: string;
}

interface KelasPortofolio {
    semesterKur: string;
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchNamaKelas, setSearchNamaKelas] = useState("");
    const [searchKodeMK, setSearchKodeMK] = useState("");
    const [searchNamaMK, setSearchNamaMK] = useState("");

    useEffect(() => {
    if (!idsemester) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Panggil API yang sudah ada
        const res = await fetch(`/api/kelas?semesterId=${idsemester}`);
        
        if (!res.ok) {
          throw new Error(await parseApiError(res));
        }

        const data = await res.json();
        setKelasList(data);

      } catch (err: any) {
        setError(`Gagal mengambil data kelas: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idsemester]);

    // Filter kelas berdasarkan search
    const filteredKelas = kelasList.filter(kelas => {
        const matchNamaKelas = kelas.namaKelas.toLowerCase().includes(searchNamaKelas.toLowerCase());
        const matchKodeMK = kelas.kodeMatakuliah.toLowerCase().includes(searchKodeMK.toLowerCase());
        const matchNamaMK = kelas.namaMatakuliah.toLowerCase().includes(searchNamaMK.toLowerCase());
        
        return  matchNamaKelas && matchKodeMK && matchNamaMK;
    });

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Portofolio</h1>
                </div>

                {/* Page Title and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Data</h2>
                        <Link href="/penilaian/portofolio">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow flex items-center gap-2">
                                <ArrowLeft size={16} />
                                Kembali
                            </button>
                        </Link>
                    </div>

                    {/* Search Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        
                        <input
                            type="text"
                            placeholder="Nama Kelas"
                            value={searchNamaKelas}
                            onChange={(e) => setSearchNamaKelas(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Kode Matakuliah"
                            value={searchKodeMK}
                            onChange={(e) => setSearchKodeMK(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Nama Matakuliah"
                            value={searchNamaMK}
                            onChange={(e) => setSearchNamaMK(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="SKS"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                    {filteredKelas.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                            NO.
                                        </th>
                                        <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                            NAMA KELAS
                                        </th>
                                        <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                            KODE MATAKULIAH
                                        </th>
                                        <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                            NAMA MATAKULIAH
                                        </th>
                                        <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                                            SKS
                                        </th>
                                        <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                                            AKSI
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-10 text-gray-500">
                                            <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                                            Memuat data kelas...
                                            </td>
                                        </tr>
                                    ) : filteredKelas.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-10 text-gray-500">
                                            {kelasList.length === 0 
                                                ? "Tidak ada data kelas untuk semester ini." 
                                                : "Tidak ada data yang sesuai filter."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredKelas.map((kelas, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-600">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-gray-800 font-medium">
                                                {kelas.namaKelas}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-mono">
                                                {kelas.kodeMatakuliah}
                                            </td>
                                            <td className="px-6 py-4 text-gray-800">
                                                {kelas.namaMatakuliah}
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-gray-700">
                                                {kelas.sks}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link 
                                                    href={`/penilaian/portofolio/${idsemester}/${kelas.kodeMatakuliah}`}
                                                >
                                                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow">
                                                        Lihat Portofolio
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        // Empty State
                        <div className="p-8">
                            <div className="text-center">
                                <p className="text-gray-500 font-semibold mb-2">No Items</p>
                                <p className="text-gray-400 text-sm">0 Record ditemukan.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back to Top Button */}
                <div className="fixed bottom-8 right-8">
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        title="Kembali ke atas"
                    >
                        <svg className="w-6 h-6 rotate-[-90deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

