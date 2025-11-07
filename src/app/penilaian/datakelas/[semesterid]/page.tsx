// file: src/app/penilaian/datakelas/[semesterid]/page.tsx

"use client";

// 1. Impor hook dan komponen yang diperlukan
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye } from "lucide-react"; // Impor ikon yang relevan
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
  semesterid: string; // Pastikan nama ini sama dengan nama folder [semesterid]
}

// 2. Definisikan tipe data di sini
interface MatakuliahKelas {
  id: number;
  semesterKur: number | string;
  namaKelas: string;
  kodeMatakuliah: string;
  namaMatakuliah: string;
  sks: number;
}

// === Helper untuk handle error (diambil dari contoh Anda) ===
async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* not json */
  }
  if (parsed?.error) {
    if (Array.isArray(parsed.error)) return parsed.error.join(", ");
    if (typeof parsed.error === "string") return parsed.error;
    if (Array.isArray(parsed.error.issues)) {
      return parsed.error.issues
        .map((i: any) => `${i.path[0]}: ${i.message}`)
        .join(", ");
    }
    return JSON.stringify(parsed.error);
  }
  return text || `HTTP ${res.status}`;
}

// --- Main Component ---
export default function SemesterMatakuliahListPage({
  params,
}: {
  params: PageParams;
}) {
  const { semesterid } = params;

  // 3. State untuk data, loading, dan filter
  const [matakuliahList, setMatakuliahList] = useState<MatakuliahKelas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchSemKur, setSearchSemKur] = useState("");
  const [searchNamaKelas, setSearchNamaKelas] = useState("");
  const [searchKodeMK, setSearchKodeMK] = useState("");
  const [searchNamaMK, setSearchNamaMK] = useState("");

  // 4. useEffect untuk mengambil data saat komponen dimuat
  useEffect(() => {
    if (!semesterid) return; // Jangan fetch jika ID semester tidak ada

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 5. Gunakan 'fetch' untuk memanggil API route
        const res = await fetch(`/api/kelas?semesterId=${semesterid}`);
        
        if (!res.ok) {
          throw new Error(await parseApiError(res));
        }

        const data = await res.json();
        setMatakuliahList(data);

      } catch (err: any) {
        setError(
          `Gagal mengambil data kelas: ${err.message || "Error tidak diketahui"}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [semesterid]); // Jalankan ulang jika semesterid berubah

  // 6. Logika filter
  const filteredMatakuliah = matakuliahList.filter((mk) => {
    const matchSemKur = String(mk.semesterKur)
      .toLowerCase()
      .includes(searchSemKur.toLowerCase());
    const matchNamaKelas = mk.namaKelas
      .toLowerCase()
      .includes(searchNamaKelas.toLowerCase());
    const matchKodeMK = mk.kodeMatakuliah
      .toLowerCase()
      .includes(searchKodeMK.toLowerCase());
    const matchNamaMK = mk.namaMatakuliah
      .toLowerCase()
      .includes(searchNamaMK.toLowerCase());

    return matchSemKur && matchNamaKelas && matchKodeMK && matchNamaMK;
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Data Kelas</h1>
          <span className="text-lg text-gray-500">Semester ID: {semesterid}</span>
        </div>

        {/* Header with Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-end items-center mb-4">
             <div className="flex gap-2">
                <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors shadow">
                    Baru
                </button>
                <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow">
                    Sinkronisasi Neosia
                </button>
                <Link href="/penilaian/datakelas">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Kembali
                    </button>
                </Link>
             </div>
          </div>
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
             <input
                type="text"
                placeholder="Sem. Kur."
                value={searchSemKur}
                onChange={(e) => setSearchSemKur(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
             />
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

        {/* Tampilkan pesan Error jika ada */}
        {error && (
            <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                <strong>Error:</strong> {error}
            </div>
        )}

        {/* Matakuliah Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              
              {/* ===== INI BAGIAN LABEL TABEL (THEAD) ===== */}
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
              {/* ===== AKHIR DARI BAGIAN LABEL TABEL ===== */}

              <tbody className="divide-y divide-gray-100">
                {/* Render kondisional: Loading */}
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-10 text-gray-500">
                      <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                      Memuat data kelas...
                    </td>
                  </tr>
                // Render kondisional: Data kosong
                ) : filteredMatakuliah.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-10 text-gray-500">
                      {matakuliahList.length === 0 
                        ? "Tidak ada data kelas untuk semester ini." 
                        : "Tidak ada data matakuliah yang sesuai dengan filter."
                      }
                    </td>
                  </tr>
                // Render kondisional: Tampilkan data
                ) : (
                  filteredMatakuliah.map((mk, index) => (
                    <tr key={mk.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600">
                        {mk.semesterKur}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {mk.namaKelas}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-mono">
                        {mk.kodeMatakuliah}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {mk.namaMatakuliah}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">
                        {mk.sks}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/penilaian/datakelas/${semesterid}/${mk.id}`}
                        >
                          <button
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow bg-indigo-500 hover:bg-indigo-600"
                          >
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
        {/* ... (Back to Top Button) ... */}
      </div>
    </DashboardLayout>
  );
}