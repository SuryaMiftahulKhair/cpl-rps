"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Loader2, Users, BookOpen, 
  RefreshCw, Award, Info, FileText, Calendar,
  Target, CheckCircle, AlertCircle, X, TrendingUp,
  ChevronRight, Download
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
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={2.5} />
        <p className="text-gray-600 font-semibold text-lg">Memuat Detail Kelas...</p>
      </div>
    </DashboardLayout>
  );

  if (error || !data) return (
    <DashboardLayout>
      <div className="p-8 m-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="font-bold text-2xl text-red-900 mb-3">Terjadi Kesalahan</h3>
          <p className="text-red-700 mb-8 text-lg">{error || "Data tidak ditemukan"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-300 rounded-xl hover:bg-red-50 transition-all font-semibold text-red-700 shadow-md hover:shadow-lg"
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
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/penilaian/datanilai" className="hover:text-indigo-600 transition-colors">
            Data Nilai
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <Link href={`/penilaian/datakelas/${semesterid}`} className="hover:text-indigo-600 transition-colors">
            Data Kelas
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Detail Kelas</span>
        </div>

        {/* ========== HEADER SECTION ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            
            {/* Left: Course Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
                  <BookOpen size={16} strokeWidth={2.5} />
                  {kelasInfo.kodeMatakuliah}
                </span>
                <span className="inline-flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border-2 border-indigo-200">
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

            {/* Right: Stats & Back Button */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                {/* SKS Card */}
                <div className="bg-white rounded-xl p-4 min-w-[110px] border-2 border-indigo-200 shadow-sm">
                  <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mb-2 mx-auto">
                    <Target className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-gray-600 uppercase font-bold tracking-wider text-center mb-1">
                    SKS
                  </p>
                  <p className="text-3xl font-bold text-indigo-600 text-center">
                    {kelasInfo.sks}
                  </p>
                </div>
                
                {/* Mahasiswa Card */}
                <div className="bg-white rounded-xl p-4 min-w-[110px] border-2 border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg mb-2 mx-auto">
                    <Users className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-gray-600 uppercase font-bold tracking-wider text-center mb-1">
                    Mhs
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 text-center">
                    {mahasiswaList.length}
                  </p>
                </div>
              </div>

              {/* Back Button */}
              <Link 
                href={`/penilaian/datakelas/${semesterid}`} 
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                <span>Kembali</span>
              </Link>
            </div>
          </div>

          {/* Otorisasi Info */}
          {kelasInfo.otorisasi && (
            <div className="mt-6 bg-white border-2 border-indigo-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1.5">
                  <Users size={14} /> Penyusun
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {kelasInfo.otorisasi.penyusun}
                </span>
              </div>

              <div className="space-y-1 md:border-l-2 md:border-gray-200 md:pl-6">
                <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                  Koordinator
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {kelasInfo.otorisasi.koordinator}
                </span>
              </div>

              <div className="space-y-1 md:border-l-2 md:border-gray-200 md:pl-6">
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

        {/* ========== ERROR ALERT ========== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 rounded-lg hover:bg-red-100 transition-colors">
              <X size={18} className="text-red-600" />
            </button>
          </div>
        )}

        {/* ========== MAIN CONTENT GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* ========== KOMPONEN PENILAIAN (2 columns) ========== */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Komponen Penilaian</h2>
                    <p className="text-sm text-gray-600">
                      {komponenList.length} komponen terdaftar
                    </p>
                  </div>
                </div>
                
                {komponenList.length === 0 && rpsSource && (
                  <button 
                    onClick={handleSyncRPS}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin" size={18} strokeWidth={2.5} />
                    ) : (
                      <RefreshCw size={18} strokeWidth={2.5} />
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
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <Info className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Belum Ada Komponen Penilaian
                  </h3>
                  {rpsSource ? (
                    <div className="space-y-3">
                      <p className="text-sm text-orange-700 font-semibold bg-orange-50 px-4 py-3 rounded-xl border-2 border-orange-200 max-w-md mx-auto">
                        ✨ RPS terdeteksi! Klik tombol "Tarik dari RPS" untuk sinkronisasi
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Silakan tambahkan komponen penilaian secara manual
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Komponen Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {komponenList.map((k) => (
                      <div 
                        key={k.id} 
                        className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                              Komponen
                            </p>
                            <p className="font-bold text-gray-900 text-lg">
                              {k.nama}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-2 border-indigo-200">
                            {k.bobot}%
                          </span>
                        </div>
                        
                        {k.nama_cpmk ? (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-100 text-green-700 px-3 py-2 rounded-lg text-xs font-bold border border-green-200">
                            <CheckCircle size={16} strokeWidth={2.5} />
                            <span>Linked: {k.nama_cpmk}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200">
                            <AlertCircle size={16} />
                            <span>Tanpa Link CPMK</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total Bobot */}
                  <div className="flex justify-end pt-4 border-t-2 border-gray-200">
                    <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-base border-2 ${
                      isBobotValid
                        ? "bg-gradient-to-r from-green-50 to-emerald-100 text-green-700 border-green-200"
                        : "bg-gradient-to-r from-red-50 to-rose-100 text-red-700 border-red-200"
                    }`}>
                      {isBobotValid ? (
                        <CheckCircle size={20} strokeWidth={2.5} />
                      ) : (
                        <AlertCircle size={20} strokeWidth={2.5} />
                      )}
                      <span>Total Bobot: {totalBobot}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========== STATUS CARD (1 column) ========== */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div>
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <TrendingUp size={24} strokeWidth={2.5} />
                  Status Kelas
                </h3>
                <p className="text-indigo-200 text-sm">
                  Monitoring & validasi data
                </p>
              </div>
              
              {/* Status Items */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    komponenList.length > 0 ? "bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" : "bg-red-400 shadow-lg shadow-red-400/50"
                  }`}></div>
                  <span className="text-sm font-medium flex-1">
                    {komponenList.length > 0 ? "Komponen Terisi" : "Komponen Kosong"}
                  </span>
                  <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
                    {komponenList.length}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    rpsSource ? "bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" : "bg-gray-400"
                  }`}></div>
                  <span className="text-sm font-medium">
                    {rpsSource ? "Terhubung RPS" : "RPS Tidak Aktif"}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isBobotValid ? "bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" : "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                  }`}></div>
                  <span className="text-sm font-medium">
                    {isBobotValid ? "Bobot Valid" : `Bobot: ${totalBobot}%`}
                  </span>
                </div>
              </div>
              
              {/* Action Button */}
              <button className="w-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 font-bold py-3 rounded-xl hover:bg-white hover:text-indigo-700 transition-all shadow-lg flex justify-center items-center gap-2 group">
                <Download size={18} strokeWidth={2.5} />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========== TABEL REKAP NILAI ========== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users size={20} className="text-indigo-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">Rekapitulasi Nilai</h3>
                  <p className="text-sm text-gray-600">
                    {mahasiswaList.length} mahasiswa terdaftar
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-4 py-2 rounded-xl border-2 border-indigo-200 text-sm font-bold">
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
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 z-20 bg-white w-14">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-14 z-20 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-32">
                    NIM
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[250px]">
                    Nama
                  </th>
                  
                  {komponenList.map((k) => (
                    <th 
                      key={k.id} 
                      className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200 min-w-[100px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-gray-900">{k.nama}</span>
                        <span className="text-[10px] text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                          {k.bobot}%
                        </span>
                      </div>
                    </th>
                  ))}

                  <th className="px-6 py-4 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50 border-l-2 border-indigo-200 w-24">
                    Akhir
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
                          <Users size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Belum Ada Mahasiswa
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
                      <td className="px-6 py-5 text-center text-gray-600 font-medium sticky left-0 bg-white group-hover:bg-indigo-50/40 z-10">
                        {mhs.no}
                      </td>
                      <td className="px-6 py-5 font-mono font-bold text-indigo-700 sticky left-14 bg-white group-hover:bg-indigo-50/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 text-sm">
                        {mhs.nim}
                      </td>
                      <td className="px-6 py-5 font-bold text-gray-900 text-sm">
                        {mhs.nama}
                      </td>

                      {komponenList.map((k) => (
                        <td 
                          key={k.id} 
                          className="px-4 py-5 text-center border-l border-gray-100"
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

                      <td className="px-6 py-5 text-center font-bold text-indigo-700 bg-indigo-50/50 border-l-2 border-indigo-200 text-base">
                        {Number(mhs.nilai_akhir).toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-center bg-indigo-50/50">
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