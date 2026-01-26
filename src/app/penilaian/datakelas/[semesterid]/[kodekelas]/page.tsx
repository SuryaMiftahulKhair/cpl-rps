"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Loader2, Users, BookOpen, 
  RefreshCw, Award, Info, FileText 
} from "lucide-react";
import { id } from "zod/locales";

interface KelasInfo {
  namaKelas: string;
  kodeMatakuliah: string;
  namaMatakuliah: string;
  sks: number;
  tahunAjaran: string;
  otorisasi: {
    kaprodi: string;
    koordinator: string;
    penyusun: string;
  } | null;
}

interface Komponen {
  id: number;
  nama: string;
  bobot: number;
  cpmk_id?: number | null;
  nama_cpmk?: string | null;
}

interface Mahasiswa {
  id: number;
  no: number;
  nim: string;
  nama: string;
  nilai_akhir: number;
  nilai_huruf: string;
  [key: string]: any; 
}

interface RpsSource {
  rps_id: number;
  evaluasi: {
    nama: string;
    bobot: number;
    cpmk_kode?: string;
  }[];
}

interface ApiResponse {
  kelasInfo: KelasInfo;
  cpmkList: any[];
  komponenList: Komponen[];
  rpsSource: RpsSource | null;
  mahasiswaList: Mahasiswa[];
}

export default function DetailKelasPage({ params }: { params: Promise<{ semesterid: string; kodekelas: string }> }) {
  const { semesterid, kodekelas } = use(params);
  
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/kelas/${kodekelas}`, { cache: "no-store" });
      
      if (!res.ok) throw new Error(`Gagal mengambil data (${res.status})`);
      const json = await res.json();
      setData(json); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kodekelas) fetchData();
  }, [kodekelas]);

  // --- HANDLER: SYNC RPS ---
  const handleSyncRPS = async () => {
    if (!data?.rpsSource) return;

    const confirmMsg = `Deteksi data penilaian dari RPS:\n\n` + 
      data.rpsSource.evaluasi.map(e => `- ${e.nama} (${e.bobot}%)`).join("\n") +
      `\n\nApakah Anda ingin menggunakan format ini?`;

    if (!confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/kelas/${id}/komponen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "sync_rps", 
          evaluasi: data.rpsSource.evaluasi 
        })
      });

      if (!res.ok) throw new Error("Gagal sinkronisasi");
      
      alert("Berhasil menarik data dari RPS!");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };


  if (loading) return (
    <div className="flex h-screen items-center justify-center flex-col gap-3">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-gray-500 font-medium">Memuat Data Kelas...</p>
    </div>
  );

  if (error || !data) return (
    <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg m-8 border border-red-200">
      <h3 className="font-bold text-lg mb-2">Terjadi Kesalahan</h3>
      <p>{error || "Data tidak ditemukan"}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white border border-red-300 rounded shadow-sm hover:bg-red-50">Coba Lagi</button>
    </div>
  );

  const { kelasInfo, komponenList, mahasiswaList, rpsSource } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans text-slate-800">
      
      {/* --- SECTION A: HEADER HALAMAN --- */}
      <div className="mb-8">
        <Link 
          href={`/penilaian/datakelas/${semesterid}`} 
          className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-4 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} className="mr-2" /> Kembali ke Daftar Kelas
        </Link>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide">
                  {kelasInfo.kodeMatakuliah}
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                  {kelasInfo.tahunAjaran}
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{kelasInfo.namaMatakuliah}</h1>
              <p className="text-gray-500 mt-1 text-lg font-medium">Kelas {kelasInfo.namaKelas}</p>
            </div>

            <div className="flex gap-4 text-center shrink-0">
              <div className="bg-gray-50 p-4 rounded-xl min-w-[100px] border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Bobot SKS</p>
                <p className="text-2xl font-black text-indigo-600">{kelasInfo.sks}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl min-w-[100px] border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Mahasiswa</p>
                <p className="text-2xl font-black text-green-600">{mahasiswaList.length}</p>
              </div>
            </div>
          </div>

          {kelasInfo.otorisasi && (
             <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest flex items-center gap-1">
                      <Users size={12}/> Dosen Penyusun
                   </span>
                   <span className="font-bold text-gray-700 text-sm">{kelasInfo.otorisasi.penyusun}</span>
                </div>

                <div className="flex flex-col gap-1 md:border-l md:border-indigo-200 md:pl-6">
                   <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Koordinator MK</span>
                   <span className="font-bold text-gray-700 text-sm">{kelasInfo.otorisasi.koordinator}</span>
                </div>

                <div className="flex flex-col gap-1 md:border-l md:border-indigo-200 md:pl-6">
                   <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Kaprodi</span>
                   <span className="font-bold text-gray-700 text-sm">{kelasInfo.otorisasi.kaprodi}</span>
                </div>
             </div>
          )}
        </div>
      </div>
      

      {/* --- SECTION B: KOMPONEN PENILAIAN --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <Award className="text-indigo-500" size={20}/> Komponen Penilaian
            </h2>
            
            {/* Tombol Tarik RPS hanya muncul jika Komponen Kosong & RPS Source Ada */}
            {komponenList.length === 0 && rpsSource && (
              <button 
                onClick={handleSyncRPS}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-xs font-bold border border-orange-200 hover:bg-orange-100 transition-all hover:shadow-md disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                Tarik Bobot dari RPS
              </button>
            )}
          </div>

          {komponenList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="bg-white p-3 rounded-full inline-block shadow-sm mb-3">
                <Info className="text-gray-400" size={24}/>
              </div>
              <p className="text-gray-500 font-medium text-sm">Belum ada komponen nilai.</p>
              {rpsSource ? (
                <p className="text-xs text-orange-600 mt-1 font-semibold">RPS Terdeteksi! Klik tombol di atas untuk sinkronisasi.</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Silakan tambah komponen penilaian secara manual.</p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                {komponenList.map((k) => (
                  <div key={k.id} className="relative group bg-white border border-gray-200 rounded-xl p-4 min-w-40 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bobot</p>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{k.bobot}%</span>
                    </div>
                    <p className="font-bold text-gray-800 text-sm mb-2">{k.nama}</p>
                    
                    {k.nama_cpmk ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-mono border border-green-100 font-semibold w-full">
                        Link: {k.nama_cpmk}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 px-2 py-1 rounded text-[10px] border border-gray-200 w-full">
                        Tanpa Link CPMK
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                  <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                    komponenList.reduce((acc, curr) => acc + curr.bobot, 0) === 100 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                  }`}>
                    Total Bobot: {komponenList.reduce((acc, curr) => acc + curr.bobot, 0)}%
                  </span>
              </div>
            </div>
          )}
        </div>

        {/* Status Card & Actions */}
        <div className="bg-linear-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-xl shadow-indigo-200/50 p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <BookOpen size={20} className="text-indigo-200"/> Status Kelas
            </h3>
            
            <ul className="mt-4 space-y-2 text-xs font-medium text-indigo-200">
               <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${komponenList.length > 0 ? "bg-green-400" : "bg-red-400"}`}></div>
                  {komponenList.length > 0 ? "Komponen Nilai Terisi" : "Komponen Nilai Kosong"}
               </li>
               <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${rpsSource ? "bg-green-400" : "bg-gray-400"}`}></div>
                  {rpsSource ? "Terhubung dengan RPS" : "RPS Tidak Terkunci"}
               </li>
            </ul>
          </div>
          
          <button className="relative z-10 mt-6 w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 font-bold py-3 rounded-xl hover:bg-white hover:text-indigo-700 transition-all shadow-lg flex justify-center items-center gap-2">
            <FileText size={18}/> Export Rekap Excel
          </button>
          
          {/* Decoration Circle */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* --- SECTION C: TABEL REKAP NILAI --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            <Users size={20} className="text-indigo-500"/> Rekapitulasi Nilai Mahasiswa
          </h3>
          <div className="text-xs text-gray-500 font-medium">
            Menampilkan {mahasiswaList.length} mahasiswa
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-14 text-center sticky left-0 bg-gray-100 z-10 border-b border-gray-200">No</th>
                <th className="px-6 py-4 w-32 sticky left-14 bg-gray-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-b border-gray-200">NIM</th>
                <th className="px-6 py-4 min-w-[250px] border-b border-gray-200">Nama Mahasiswa</th>
                
                {/* Header Dinamis berdasarkan Komponen */}
                {komponenList.map((k) => (
                  <th key={k.id} className="px-4 py-4 text-center min-w-[100px] border-l border-b border-gray-200 bg-gray-50">
                    <span className="block text-gray-800 mb-0.5">{k.nama}</span>
                    <span className="text-[9px] text-gray-400 font-normal border border-gray-200 rounded-full px-1.5 inline-block bg-white">{k.bobot}%</span>
                  </th>
                ))}

                <th className="px-6 py-4 text-center bg-indigo-50 text-indigo-900 border-l border-b border-indigo-100 w-24">Nilai Akhir</th>
                <th className="px-6 py-4 text-center bg-indigo-50 text-indigo-900 border-b border-indigo-100 w-20">Huruf</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mahasiswaList.length === 0 ? (
                <tr>
                  <td colSpan={5 + komponenList.length} className="px-6 py-16 text-center text-gray-400 bg-gray-50/30">
                    <div className="flex flex-col items-center gap-2">
                       <Users size={32} className="opacity-20"/>
                       <span className="italic">Belum ada data mahasiswa terdaftar di kelas ini.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                mahasiswaList.map((mhs) => (
                  <tr key={mhs.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-3 text-center text-gray-500 sticky left-0 bg-white group-hover:bg-indigo-50/30 font-medium">{mhs.no}</td>
                    <td className="px-6 py-3 font-mono font-medium text-indigo-600 sticky left-14 bg-white group-hover:bg-indigo-50/30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {mhs.nim}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wide">{mhs.nama}</td>

                    {/* Nilai Per Komponen */}
                    {komponenList.map((k) => (
                      <td key={k.id} className="px-4 py-3 text-center border-l border-gray-100 text-gray-600">
                        {mhs[k.nama] !== undefined ? (
                          <span className="font-mono font-medium text-slate-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            {Number(mhs[k.nama]).toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs italic">-</span>
                        )}
                      </td>
                    ))}

                    <td className="px-6 py-3 text-center font-bold text-indigo-700 bg-indigo-50/50 border-l border-indigo-100">
                      {Number(mhs.nilai_akhir).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-center bg-indigo-50/50">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black shadow-sm border ${
                        mhs.nilai_huruf === 'A' ? 'bg-green-100 text-green-700 border-green-200' :
                        ['B+', 'B', 'B-'].includes(mhs.nilai_huruf) ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        ['C+', 'C', 'C-'].includes(mhs.nilai_huruf) ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {mhs.nilai_huruf || "T"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );  
}