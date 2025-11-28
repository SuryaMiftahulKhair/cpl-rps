// src/app/penilaian/datanilai/[idsemester]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
  idsemester: string; 
}

interface KelasData {
  id: number;
  semesterKur: number | string;
  namaKelas: string;
  kodeMatakuliah: string;
  namaMatakuliah: string;
  sks: number;
}

// --- Helper Error ---
async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (parsed?.error) return typeof parsed.error === "string" ? parsed.error : JSON.stringify(parsed.error);
  } catch {}
  return text || `HTTP ${res.status}`;
}

// --- Main Component ---
export default function SemesterNilaiListPage({
  params
}: {
  params: Promise<PageParams>;
}) {
  // 1. Buka params menggunakan use()
  const resolvedParams = use(params);
  const { idsemester } = resolvedParams;

  // 2. State untuk data dinamis
  const [kelasList, setKelasList] = useState<KelasData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State Filter

  const [searchIdKelas, setSearchIdKelas] = useState("");
  const [searchNamaKelas, setSearchNamaKelas] = useState("");
  const [searchKodeMK, setSearchKodeMK] = useState("");
  const [searchNamaMK, setSearchNamaMK] = useState("");

  // 3. Fetch Data dari API (Gunakan API yang sama dengan Data Kelas)
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

  // 4. Filter Logic
  const filteredKelas = kelasList.filter(kelas => {
    
    // Convert ID ke string untuk pencarian
    const matchIdKelas = String(kelas.id).toLowerCase().includes(searchIdKelas.toLowerCase());
    const matchNamaKelas = kelas.namaKelas.toLowerCase().includes(searchNamaKelas.toLowerCase());
    const matchKodeMK = kelas.kodeMatakuliah.toLowerCase().includes(searchKodeMK.toLowerCase());
    const matchNamaMK = kelas.namaMatakuliah.toLowerCase().includes(searchNamaMK.toLowerCase());
    
    return  matchIdKelas && matchNamaKelas && matchKodeMK && matchNamaMK;
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Data Nilai</h1>
        </div>

        {/* Page Title & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
               {/* Menampilkan ID semester sementara, idealnya fetch nama semester juga */}
               Daftar Kelas | Semester ID: {idsemester} 
            </h2>
            <Link href="/penilaian/datanilai">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow flex items-center gap-2">
                <ArrowLeft size={16} />
                Kembali
              </button>
            </Link>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Nama Kelas"
              value={searchNamaKelas}
              onChange={(e) => setSearchNamaKelas(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder="ID Kelas"
              value={searchIdKelas}
              onChange={(e) => setSearchIdKelas(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder="Nama MK"
              value={searchNamaMK}
              onChange={(e) => setSearchNamaMK(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder="Kode MK"
              value={searchKodeMK}
              onChange={(e) => setSearchKodeMK(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder="SKS"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              disabled
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
            <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                <strong>Error:</strong> {error}
            </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">NO.</th>
                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">NAMA KELAS</th>
                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">ID KELAS</th>
                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">NAMA MK</th>
                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">KODE MK</th>
                            <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">SKS</th>
                            <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">AKSI</th>
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
                                <tr key={kelas.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                                    <td className="px-6 py-4 text-gray-800 font-medium">{kelas.namaKelas}</td>
                                    <td className="px-6 py-4 text-gray-700 font-mono">{kelas.id}</td>
                                    <td className="px-6 py-4 text-gray-800">{kelas.namaMatakuliah}</td>
                                    <td className="px-6 py-4 text-gray-700 font-mono">{kelas.kodeMatakuliah}</td>
                                    <td className="px-6 py-4 text-center font-semibold text-gray-700">{kelas.sks}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={`/penilaian/datanilai/${idsemester}/${kelas.id}`}>
                                            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow">
                                                Penilaian
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
}