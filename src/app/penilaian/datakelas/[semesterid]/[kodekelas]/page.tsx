"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Loader2, Users, BookOpen, 
  RefreshCw, Award, Info, FileText, Calendar,
  Target, CheckCircle, AlertCircle, X, TrendingUp
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

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

  const handleSyncRPS = async () => {
    if (!data?.rpsSource) return;

    const confirmMsg = `Deteksi data penilaian dari RPS:\n\n` + 
      data.rpsSource.evaluasi.map(e => `- ${e.nama} (${e.bobot}%)`).join("\n") +
      `\n\nApakah Anda ingin menggunakan format ini?`;

    if (!confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/kelas/${kodekelas}/komponen`, {
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
    <DashboardLayout>
      <div className="flex h-screen items-center justify-center flex-col gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={2.5} />
        <p className="text-gray-600 font-semibold">Memuat Data Kelas...</p>
      </div>
    </DashboardLayout>
  );

  if (error || !data) return (
    <DashboardLayout>
      <div className="p-8 m-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="font-bold text-xl text-red-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-700 mb-6">{error || "Data tidak ditemukan"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 transition-all font-semibold text-red-700"
          >
            <RefreshCw size={18} />
            Coba Lagi
          </button>
        </div>
      </div>
    </DashboardLayout>
  );

  const { kelasInfo, komponenList, mahasiswaList, rpsSource } = data;
  const totalBobot = komponenList.reduce((acc, curr) => acc + curr.bobot, 0);
  const isBobotValid = totalBobot === 100;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
        
        {/* ================= BACK BUTTON ================= */}
        <Link 
          href={`/penilaian/datakelas/${semesterid}`} 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors font-semibold text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
          Kembali ke Daftar Kelas
        </Link>

        {/* ================= HEADER SECTION - Enhanced ================= */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Left: Course Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                  <BookOpen size={16} strokeWidth={2.5} />
                  {kelasInfo.kodeMatakuliah}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold border border-blue-200">
                  <Calendar size={16} />
                  {kelasInfo.tahunAjaran}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                {kelasInfo.namaMatakuliah}
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                Kelas {kelasInfo.namaKelas}
              </p>
            </div>

            {/* Right: Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white rounded-xl p-5 min-w-[120px] border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mb-3 mx-auto">
                  <Target className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
                </div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider text-center mb-1">
                  Bobot SKS
                </p>
                <p className="text-3xl font-bold text-indigo-600 text-center">
                  {kelasInfo.sks}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-5 min-w-[120px] border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg mb-3 mx-auto">
                  <Users className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                </div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider text-center mb-1">
                  Mahasiswa
                </p>
                <p className="text-3xl font-bold text-emerald-600 text-center">
                  {mahasiswaList.length}
                </p>
              </div>
            </div>
          </div>

          {/* Otorisasi Info */}
          {kelasInfo.otorisasi && (
            <div className="mt-6 bg-white border border-indigo-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1.5">
                  <Users size={14} /> Dosen Penyusun
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {kelasInfo.otorisasi.penyusun}
                </span>
              </div>

              <div className="space-y-1 md:border-l md:border-gray-200 md:pl-6">
                <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                  Koordinator MK
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {kelasInfo.otorisasi.koordinator}
                </span>
              </div>

              <div className="space-y-1 md:border-l md:border-gray-200 md:pl-6">
                <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                  Kaprodi
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {kelasInfo.otorisasi.kaprodi}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================= ERROR ALERT ================= */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 mb-1">Terjadi Kesalahan</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ================= MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* ================= KOMPONEN PENILAIAN - 2 Columns ================= */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Komponen Penilaian
                </h2>
                
                {komponenList.length === 0 && rpsSource && (
                  <button 
                    onClick={handleSyncRPS}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin" size={16} strokeWidth={2.5} />
                    ) : (
                      <RefreshCw size={16} strokeWidth={2.5} />
                    )}
                    Tarik dari RPS
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {komponenList.length === 0 ? (
                /* Empty State */
                <div className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Info className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Belum Ada Komponen Nilai
                    </h3>
                    {rpsSource ? (
                      <div className="space-y-3">
                        <p className="text-sm text-orange-600 font-semibold bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                          ✨ RPS Terdeteksi! Klik tombol di atas untuk sinkronisasi
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Silakan tambah komponen penilaian secara manual
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Komponen Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {komponenList.map((k) => (
                      <div 
                        key={k.id} 
                        className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                              Komponen
                            </p>
                            <p className="font-bold text-gray-900 text-base">
                              {k.nama}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200">
                            {k.bobot}%
                          </span>
                        </div>
                        
                        {k.nama_cpmk ? (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-semibold border border-green-200">
                            <CheckCircle size={14} strokeWidth={2.5} />
                            <span>Linked: {k.nama_cpmk}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200">
                            <AlertCircle size={14} />
                            <span>Tanpa Link CPMK</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total Bobot */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm border-2 ${
                      isBobotValid
                        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200"
                        : "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200"
                    }`}>
                      {isBobotValid ? (
                        <CheckCircle size={18} strokeWidth={2.5} />
                      ) : (
                        <AlertCircle size={18} strokeWidth={2.5} />
                      )}
                      <span>Total Bobot: {totalBobot}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= STATUS CARD - 1 Column ================= */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div>
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <TrendingUp size={22} strokeWidth={2.5} />
                  Status Kelas
                </h3>
                <p className="text-indigo-200 text-sm">
                  Monitoring komponen & koneksi
                </p>
              </div>
              
              {/* Status Items */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    komponenList.length > 0 ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-red-400 shadow-lg shadow-red-400/50"
                  }`}></div>
                  <span className="text-sm font-medium flex-1">
                    {komponenList.length > 0 ? "Komponen Nilai Terisi" : "Komponen Nilai Kosong"}
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded font-bold">
                    {komponenList.length}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    rpsSource ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-400"
                  }`}></div>
                  <span className="text-sm font-medium">
                    {rpsSource ? "Terhubung dengan RPS" : "RPS Tidak Terkunci"}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isBobotValid ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                  }`}></div>
                  <span className="text-sm font-medium">
                    {isBobotValid ? "Bobot Valid (100%)" : `Bobot: ${totalBobot}%`}
                  </span>
                </div>
              </div>
              
              {/* Action Button */}
              <button className="w-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 font-bold py-3 rounded-xl hover:bg-white hover:text-indigo-700 transition-all shadow-lg flex justify-center items-center gap-2 group">
                <FileText size={18} strokeWidth={2.5} />
                <span>Export Rekap Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= TABEL REKAP NILAI - Enhanced ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <Users size={20} className="text-indigo-600" strokeWidth={2.5} />
                Rekapitulasi Nilai Mahasiswa
              </h3>
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 text-sm font-bold">
                <Users size={16} />
                {mahasiswaList.length} Mahasiswa
              </span>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 sticky left-0 z-20 w-14">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 sticky left-14 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-32">
                    NIM
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 min-w-[250px]">
                    Nama Mahasiswa
                  </th>
                  
                  {komponenList.map((k) => (
                    <th 
                      key={k.id} 
                      className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-l border-gray-200 min-w-[100px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-gray-900">{k.nama}</span>
                        <span className="text-[10px] text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                          {k.bobot}%
                        </span>
                      </div>
                    </th>
                  ))}

                  <th className="px-6 py-4 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50 border-l border-indigo-200 w-24">
                    Nilai Akhir
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50 w-20">
                    Huruf
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {mahasiswaList.length === 0 ? (
                  <tr>
                    <td colSpan={5 + komponenList.length} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Users size={36} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Belum Ada Data Mahasiswa
                        </h3>
                        <p className="text-sm text-gray-500">
                          Tidak ada mahasiswa terdaftar di kelas ini
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mahasiswaList.map((mhs) => (
                    <tr 
                      key={mhs.id} 
                      className="group hover:bg-indigo-50/40 transition-all duration-150"
                    >
                      <td className="px-6 py-4 text-center text-gray-600 font-medium sticky left-0 bg-white group-hover:bg-indigo-50/40 z-10">
                        {mhs.no}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-indigo-700 sticky left-14 bg-white group-hover:bg-indigo-50/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 text-sm">
                        {mhs.nim}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 text-sm">
                        {mhs.nama}
                      </td>

                      {komponenList.map((k) => (
                        <td 
                          key={k.id} 
                          className="px-4 py-4 text-center border-l border-gray-100"
                        >
                          {mhs[k.nama] !== undefined ? (
                            <span className="inline-block font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 min-w-[50px]">
                              {Number(mhs[k.nama]).toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-sm">-</span>
                          )}
                        </td>
                      ))}

                      <td className="px-6 py-4 text-center font-bold text-indigo-700 bg-indigo-50/50 border-l border-indigo-200 text-base">
                        {Number(mhs.nilai_akhir).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center bg-indigo-50/50">
                        <span className={`inline-flex items-center justify-center min-w-[45px] px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${
                          mhs.nilai_huruf === 'A' 
                            ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' :
                          ['B+', 'B', 'B-'].includes(mhs.nilai_huruf) 
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200' :
                          ['C+', 'C', 'C-'].includes(mhs.nilai_huruf) 
                            ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200'
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
    </DashboardLayout>
  );
}