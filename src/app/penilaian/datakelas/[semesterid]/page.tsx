"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, RefreshCw, Plus } from "lucide-react"; 
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
      const res = await fetch(`/api/kelas?semesterId=${semesterid}`);
      if (!res.ok) throw new Error(await parseApiError(res));
      const data = await res.json();
      setMatakuliahList(data);
    } catch (err: any) {
      setError(`Gagal mengambil data kelas: ${err.message || "Error tidak diketahui"}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (semesterid) fetchData();
  }, [semesterid]);

  // Handler Create Kelas Manual 
  const handleCreateKelas = async (data: { kode_mk: string; nama_mk: string; nama_kelas: string; sks: number }) => {
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
      fetchData(); 
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

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Data Kelas</h1>
          <span className="text-lg text-gray-500">Semester ID: {semesterid}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-end items-center mb-4 flex-wrap gap-2">
             <div className="flex gap-2">
                {/* Tombol Manual */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors shadow flex items-center gap-2"
                >
                    <Plus size={16} /> Baru
                </button>

                <Link href="/penilaian/datakelas">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow flex items-center gap-2">
                        <ArrowLeft size={16} /> Kembali
                    </button>
                </Link>
             </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-1/2 lg:w-1/3 ml-auto"> 
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
             </div>
             <input 
                type="text" 
                placeholder="Cari Kelas, Kode, Nama Matakuliah..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
             />
          </div>
        </div>

        {error && (
            <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                <strong>Error:</strong> {error}
            </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
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
                    <td colSpan={5} className="text-center p-10 text-gray-500">
                      <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                      Memuat data kelas...
                    </td>
                  </tr>
                ) : filteredMatakuliah.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-10 text-gray-500">
                      {matakuliahList.length === 0 
                        ? "Belum ada kelas. Klik 'Sync Neosia' untuk mengambil data." 
                        : "Tidak ada data sesuai pencarian."
                      }
                    </td>
                  </tr>
                ) : (
                  filteredMatakuliah.map((mk) => (
                    <tr key={mk.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-mono">{mk.kodeMatakuliah}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{mk.namaMatakuliah}</td>
                      <td className="px-6 py-4 text-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                            {mk.namaKelas}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{mk.sks}</td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/penilaian/datakelas/${semesterid}/${mk.id}`}>
                          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow bg-indigo-500 hover:bg-indigo-600">
                            Detail Kelas
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

      <KelasModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateKelas}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}