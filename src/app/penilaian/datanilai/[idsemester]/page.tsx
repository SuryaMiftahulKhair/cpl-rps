"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw, Search } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
  idsemester: string;
}

// Interface sesuai dengan data dari API GET /api/kelas
interface KelasData {
  id: number;
  namaKelas: string;      // dari kolom nama_kelas
  kodeMatakuliah: string; // dari kolom kode_mk
  namaMatakuliah: string; // dari kolom nama_mk
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
  const resolvedParams = use(params);
  const { idsemester } = resolvedParams;

  // State Data
  const [kelasList, setKelasList] = useState<KelasData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // State untuk loading sync
  const [error, setError] = useState<string | null>(null);
  
  // State Search
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fungsi Fetch Data dari Database Lokal
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/kelas?semesterId=${idsemester}`);
      if (!res.ok) throw new Error(await parseApiError(res));
      const data = await res.json();
      setKelasList(data);
    } catch (err: any) {
      setError(`Gagal mengambil data kelas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data saat pertama kali buka
  useEffect(() => {
    if (idsemester) fetchData();
  }, [idsemester]);

  // 2. Fungsi SINKRONISASI ke Neosia
  const handleSyncNeosia = async () => {
    // Konfirmasi dulu agar tidak kepencet
    if (!confirm("Proses ini akan mengambil data terbaru dari Neosia dan menimpa data lokal. Lanjutkan?")) return;

    setIsSyncing(true);
    setError(null);

    try {
      // Langkah A: Cek dulu detail semester untuk dapatkan 'kode_neosia'
      const semRes = await fetch(`/api/tahunAjaran/${idsemester}`);
      if (!semRes.ok) throw new Error("Gagal mengecek data semester.");
      const semData = await semRes.json();

      if (!semData.kode_neosia) {
        alert("GAGAL: Semester ini belum memiliki 'Kode Neosia' (contoh: 20241). Silakan edit semester terlebih dahulu.");
        setIsSyncing(false);
        return;
      }

      // Langkah B: Panggil API Sync
      const res = await fetch("/api/kelas/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semesterId: idsemester,
          kodeNeosia: semData.kode_neosia, // Kode '20241' atau '20242'
          prodiId: "18" // ID Prodi Informatika (Sesuaikan jika perlu)
        })
      });

      if (!res.ok) throw new Error(await parseApiError(res));

      const result = await res.json();
      alert(`Berhasil sinkronisasi! Total ${result.total} kelas ditemukan.`);
      
      // Langkah C: Refresh tabel otomatis
      fetchData(); 

    } catch (err: any) {
      alert(`Gagal Sinkronisasi: ${err.message}`);
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter Logic (Search Bar)
  const filteredKelas = kelasList.filter(kelas => {
    const term = searchTerm.toLowerCase();
    return (
      kelas.namaKelas.toLowerCase().includes(term) ||
      kelas.kodeMatakuliah.toLowerCase().includes(term) ||
      kelas.namaMatakuliah.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Data Nilai & Kelas</h1>
            <p className="text-gray-500 text-sm mt-1">Semester ID: {idsemester}</p>
          </div>
          
          <div className="flex gap-2">
             {/* TOMBOL SINKRONISASI */}
             <button 
               onClick={handleSyncNeosia}
               disabled={isSyncing || isLoading}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow transition-colors ${
                 isSyncing ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
               }`}
             >
               <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
               {isSyncing ? "Menyinkronkan..." : "Sinkronisasi Neosia"}
             </button>

             <Link href="/penilaian/datanilai">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow flex items-center gap-2">
                <ArrowLeft size={18} />
                Kembali
              </button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
           <div className="relative w-full md:w-1/3"> 
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
             </div>
             <input 
                type="text" 
                placeholder="Cari Mata Kuliah, Kode, atau Kelas..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">NO</th>
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
                                  <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                                  Memuat data kelas...
                                </td>
                              </tr>
                        ) : filteredKelas.length === 0 ? (
                             <tr>
                                <td colSpan={6} className="text-center p-10 text-gray-500">
                                  {kelasList.length === 0 
                                    ? "Data masih kosong. Silakan klik tombol 'Sinkronisasi Neosia' di atas." 
                                    : "Tidak ada data yang sesuai pencarian."}
                                </td>
                              </tr>
                        ) : (
                            filteredKelas.map((kelas, index) => (
                                <tr key={kelas.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 text-gray-700 font-mono">{kelas.kodeMatakuliah}</td>
                                    <td className="px-6 py-4 text-gray-800 font-medium">{kelas.namaMatakuliah}</td>
                                    <td className="px-6 py-4 text-center">
                                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                                        {kelas.namaKelas}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600">{kelas.sks}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={`/penilaian/datanilai/${idsemester}/${kelas.id}`}>
                                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow">
                                                Input Nilai
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