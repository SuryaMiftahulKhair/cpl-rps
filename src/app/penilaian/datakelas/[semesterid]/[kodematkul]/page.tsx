// file: src/app/penilaian/datakelas/[semesterid]/[id]/page.tsx
"use client";

// 1. Impor 'use', 'useState', 'useEffect'
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Trash2, ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
  semesterid: string;
  kodematkul: string; 
}

interface Dosen {
  id: number; 
  nip: string;
  nama: string;
  posisi: string;
}

interface Mahasiswa {
  id: number;
  no: number;
  nim: string;
  nama: string;
}

interface KelasInfo {
  namaKelas: string;
  kodeMatakuliah: string;
  namaMatakuliah: string;
  tahunAjaran: string;
}

// --- Helper untuk parse error ---
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
export default function DetailKelasPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
 
  const resolvedParams = use(params);
  
  const { semesterid, kodematkul: kelasId } = resolvedParams;

  // State untuk data, loading, dan error
  const [kelasInfo, setKelasInfo] = useState<KelasInfo | null>(null);
  const [dosenData, setDosenData] = useState<Dosen[]>([]);
  const [mahasiswaData, setMahasiswaData] = useState<Mahasiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4. useEffect untuk mengambil data
  useEffect(() => {
    if (!kelasId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Fetching detail for Kelas ID: ${kelasId}`);
        
        // 5. Panggil API route dinamis /api/kelas/[id]
        const res = await fetch(`/api/kelas/${kelasId}`);

        if (!res.ok) {
          throw new Error(await parseApiError(res));
        }

        const data = await res.json();
        
        setKelasInfo(data.kelasInfo);
        setDosenData(data.dosenList);
        setMahasiswaData(data.mahasiswaList);

      } catch (err: any) {
        setError(`Gagal mengambil detail kelas: ${err.message || 'Error tidak diketahui'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [kelasId]); // Dependency array

  // ... (Handler Delete Dosen & Mahasiswa tetap sama) ...
  const handleDeleteDosen = async (dosenPengampuId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus dosen ini dari kelas?")) {
      // TODO: Panggil API DELETE /api/dosen-pengampu/[dosenPengampuId]
      setDosenData(dosenData.filter(d => d.id !== dosenPengampuId));
    }
  };

  const handleDeleteMahasiswa = async (pesertaKelasId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus mahasiswa ini dari kelas?")) {
      // TODO: Panggil API DELETE /api/peserta-kelas/[pesertaKelasId]
      setMahasiswaData(mahasiswaData.filter(m => m.id !== pesertaKelasId));
    }
  };

  // Tampilkan status Loading
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Tampilkan status Error
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
          <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
          <Link href={`/penilaian/datakelas/${semesterid}`}>
              <button className="bg-gray-500 text-white px-4 py-2 ...">
                  <ArrowLeft size={16} />
                  Kembali
              </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }
  
  // Tampilkan halaman jika data berhasil diambil
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Detail Kelas: {kelasInfo?.namaKelas || 'Memuat...'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Informasi Kelas & Data Dosen */}
          <div className="space-y-6">
            {/* Informasi Kelas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Informasi Kelas</h2>
                <div className="flex gap-2">
                  <button className="bg-indigo-500 text-white px-4 py-2 ...">
                    Sinkronisasi Neosia
                  </button>
                  <Link href={`/penilaian/datakelas/${semesterid}`}> 
                    <button className="bg-gray-500 text-white px-4 py-2 ...">
                      <ArrowLeft size={16} />
                      Kembali
                    </button>
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex border-b border-gray-100 pb-3">
                  <div className=" text-gray-800 w-1/3 ...">Nama Kelas</div>
                  <div className=" text-gray-800 w-2/3 ...">{kelasInfo?.namaKelas}</div>
                </div>
                <div className="flex border-b border-gray-100 pb-3">
                  <div className=" text-gray-800 w-1/3 ...">Kode Matakuliah</div>
                  <div className=" text-gray-800 w-2/3 ...">{kelasInfo?.kodeMatakuliah}</div>
                </div>
                <div className="flex">
                  <div className=" text-gray-800 w-1/3 ...">Nama Matakuliah</div>
                  <div className=" text-gray-800 w-2/3 ...">{kelasInfo?.namaMatakuliah}</div>
                </div>
              </div>
            </div>

            {/* Data Dosen */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 ...">
                <h2 className="text-lg font-bold text-gray-800">Data Dosen</h2>
                <button className="bg-green-500 text-white px-4 py-2 ...">
                  Tambah Manual Dosen
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className=" text-gray-800 px-6 py-3 ...">NIP</th>
                      <th className=" text-gray-800 px-6 py-3 ...">NAMA</th>
                      <th className=" text-gray-800 px-6 py-3 ...">POSISI</th>
                      <th className=" text-gray-800 px-6 py-3 ...">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dosenData.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-gray-500">Tidak ada data dosen</td></tr>
                    ) : (
                      dosenData.map((dosen) => (
                        <tr key={dosen.id} className="hover:bg-gray-50 ...">
                          <td className=" text-gray-800 px-6 py-4 ...">{dosen.nip}</td>
                          <td className=" text-gray-800 px-6 py-4 ...">{dosen.nama}</td>
                          <td className=" text-gray-800 px-6 py-4 ...">{dosen.posisi}</td>
                          <td className=" text-gray-800 px-6 py-4 text-center">
                            <button onClick={() => handleDeleteDosen(dosen.id)} className="p-2 bg-red-500 ...">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Data Mahasiswa */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Data Mahasiswa</h2>
              <div className="bg-cyan-100 border-l-4 ...">
                <p><strong>Fasilitas hapus peserta kelas...</strong></p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className=" text-gray-800 px-6 py-3 ...">#</th>
                    <th className=" text-gray-800 px-6 py-3 ...">NIM</th>
                    <th className=" text-gray-800 px-6 py-3 ...">NAMA</th>
                    <th className=" text-gray-800 px-6 py-3 ...">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mahasiswaData.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-500">Tidak ada data mahasiswa</td></tr>
                  ) : (
                    mahasiswaData.map((mahasiswa, index) => (
                      <tr key={mahasiswa.id} className="hover:bg-gray-50 ...">
                        <td className=" text-gray-800 px-6 py-4 ...">{index + 1}</td>
                        <td className=" text-gray-800 px-6 py-4 ...">{mahasiswa.nim}</td>
                        <td className=" text-gray-800 px-6 py-4 ...">{mahasiswa.nama}</td>
                        <td className=" text-gray-800 px-6 py-4 text-center">
                          <button onClick={() => handleDeleteMahasiswa(mahasiswa.id)} className="text-red-500 ...">
                            <Trash2 size={18} />
                          </button>
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
    </DashboardLayout>
  );
}