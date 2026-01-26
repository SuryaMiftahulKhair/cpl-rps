// file: src/app/penilaian/datakelas/[semesterid]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, Plus } from "lucide-react"; 
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
      const res = await fetch(`/api/kelas?tahun_ajaran_id=${semesterid}`); // Gunakan tahun_ajaran_id sesuai backend
      if (!res.ok) throw new Error(await parseApiError(res));
      
      const json = await res.json();
      
      // Ambil array data (sesuaikan dengan format response API backend)
      const rawData = Array.isArray(json) ? json : (json.data || []);
      
      // Mapping data dari backend (snake_case) ke interface frontend (camelCase)
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
      setMatakuliahList([]); // Reset list jika error
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
      await fetchData(); // Refresh data setelah berhasil
      alert("Berhasil menambah kelas!");
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Logic (Aman karena matakuliahList dijamin array)
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
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
             {/* Tombol Kiri */}
             <div className="flex gap-2">
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
          
             {/* Search Bar Kanan */}
             <div className="relative w-full md:w-1/3"> 
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                 </div>
                 <input 
                    type="text" 
                    placeholder="Cari Kelas / Mata Kuliah..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                 />
             </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                <strong>Error:</strong> {error}
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">KODE MK</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">NAMA MATAKULIAH</th>
                    <th className="px-6 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">KELAS</th>
                    <th className="px-6 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">SKS</th>
                    <th className="px-6 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <Loader2 size={32} className="animate-spin mb-2 text-indigo-500" />
                            <span>Memuat data kelas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredMatakuliah.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500 italic">
                        {matakuliahList.length === 0 
                          ? "Belum ada kelas yang terdaftar di semester ini." 
                          : "Tidak ditemukan data yang cocok."
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredMatakuliah.map((mk) => (
                      <tr key={mk.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4 text-gray-700 font-mono font-medium">{mk.kodeMatakuliah}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{mk.namaMatakuliah}</td>
                        <td className="px-6 py-4 text-center">
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                              {mk.namaKelas}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">{mk.sks}</td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/penilaian/datakelas/${semesterid}/${mk.id}`}>
                            <button className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
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