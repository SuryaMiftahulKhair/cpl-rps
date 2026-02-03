// file: src/app/penilaian/datakelas/[semesterid]/[kodekelas]/page.tsx
"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx"; // Library Excel
import { 
  ArrowLeft, Loader2, Users, BookOpen, 
  RefreshCw, Award, Info, AlertCircle, X, TrendingUp,
  ChevronRight, Download, Upload, CheckCircle
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- INTERFACES ---
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

  // Ref untuk tombol upload file tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- LOGIC: SYNC RPS ---
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

  // --- LOGIC: EXPORT EXCEL ---
  const handleExportExcel = () => {
    // Membuka endpoint GET Export di tab baru
    window.open(`/api/kelas/${kodekelas}/export`, "_blank");
  };

  // --- LOGIC: IMPORT EXCEL ---
  const triggerImport = () => {
    // Klik input file secara programmatik
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert Excel ke JSON Array
        const dataImport = XLSX.utils.sheet_to_json(ws);

        if (dataImport.length === 0) {
          alert("File Excel kosong!");
          return;
        }

        if (!confirm(`Ditemukan ${dataImport.length} baris data. Lanjutkan import nilai?`)) return;

        setIsProcessing(true);
        
        // Kirim ke Backend
        const res = await fetch(`/api/kelas/${kodekelas}/komponen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "import_excel",
            komponen: data?.komponenList, // Kirim daftar komponen agar backend tau kolom apa yg dicari
            dataNilai: dataImport
          }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Gagal import");

        alert("Import Berhasil! Data nilai telah diperbarui.");
        fetchData(); // Refresh tampilan

      } catch (err: any) {
        alert("Gagal membaca file: " + err.message);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- RENDER LOADING / ERROR ---
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
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-300 rounded-xl hover:bg-red-50 transition-all font-semibold text-red-700 shadow-md">
            <RefreshCw size={18} /> Coba Lagi
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
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/penilaian/datanilai" className="hover:text-indigo-600">Data Nilai</Link>
          <ChevronRight size={16} className="text-gray-400" />
          <Link href={`/penilaian/datakelas/${semesterid}`} className="hover:text-indigo-600">Data Kelas</Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Detail Kelas</span>
        </div>

        {/* HEADER SECTION */}
        <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
                  <BookOpen size={16} /> {kelasInfo.kodeMatakuliah}
                </span>
                <span className="inline-flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border-2 border-indigo-200">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  {kelasInfo.tahunAjaran}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{kelasInfo.namaMatakuliah}</h1>
              <p className="text-gray-600 text-lg font-medium">Kelas {kelasInfo.namaKelas}</p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3">
               <div className="bg-white rounded-xl p-4 min-w-[100px] border border-indigo-100 shadow-sm text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase">SKS</p>
                  <p className="text-2xl font-bold text-indigo-600">{kelasInfo.sks}</p>
               </div>
               <div className="bg-white rounded-xl p-4 min-w-[100px] border border-emerald-100 shadow-sm text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase">MHS</p>
                  <p className="text-2xl font-bold text-emerald-600">{mahasiswaList.length}</p>
               </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* KOMPONEN PENILAIAN */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg"><Award className="w-5 h-5 text-indigo-600" /></div>
                <h2 className="font-bold text-gray-900">Komponen Penilaian</h2>
              </div>
              {komponenList.length === 0 && rpsSource && (
                <button onClick={handleSyncRPS} disabled={isProcessing} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex gap-2 items-center hover:bg-orange-600 transition-all">
                  <RefreshCw size={16} /> Sync RPS
                </button>
              )}
            </div>

            <div className="p-6">
              {komponenList.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Belum ada komponen penilaian.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {komponenList.map((k) => (
                    <div key={k.id} className="border rounded-xl p-4 hover:border-indigo-300 transition-all bg-gray-50/50">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-gray-800">{k.nama}</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">{k.bobot}%</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {k.nama_cpmk ? `Linked: ${k.nama_cpmk}` : "Unlinked"}
                      </div>
                    </div>
                  ))}
                  <div className="md:col-span-2 pt-2 border-t flex justify-between items-center text-sm font-bold">
                     <span>Total Bobot</span>
                     <span className={isBobotValid ? "text-green-600" : "text-red-600"}>{totalBobot}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STATUS & ACTIONS CARD */}
          <div className="bg-linear-to-br from-indigo-600 via-indigo-700 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

             <div className="relative z-10">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                   <TrendingUp size={20} /> Status & Aksi
                </h3>

                <div className="space-y-3 mb-6">
                   <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg text-sm">
                      <div className={`w-3 h-3 rounded-full ${isBobotValid ? "bg-green-400" : "bg-red-400"}`}></div>
                      <span>{isBobotValid ? "Bobot Valid (100%)" : "Bobot Tidak Valid"}</span>
                   </div>
                   <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg text-sm">
                      <div className={`w-3 h-3 rounded-full ${mahasiswaList.length > 0 ? "bg-green-400" : "bg-yellow-400"}`}></div>
                      <span>{mahasiswaList.length} Mahasiswa</span>
                   </div>
                </div>

                {/* --- TOMBOL IMPORT / EXPORT --- */}
                <div className="grid grid-cols-2 gap-3">
                   {/* Input File Hidden */}
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept=".xlsx, .xls" 
                      className="hidden" 
                   />
                   
                   <button 
                      onClick={triggerImport}
                      disabled={isProcessing || komponenList.length === 0}
                      className="bg-white/20 hover:bg-white hover:text-indigo-700 disabled:opacity-50 text-white border border-white/30 font-bold py-2 rounded-xl transition-all flex justify-center items-center gap-2 text-sm"
                   >
                      <Upload size={16} /> Import
                   </button>

                   <button 
                      onClick={handleExportExcel}
                      disabled={komponenList.length === 0}
                      className="bg-white text-indigo-700 disabled:opacity-50 font-bold py-2 rounded-xl hover:bg-indigo-50 transition-all flex justify-center items-center gap-2 text-sm"
                   >
                      <Download size={16} /> Template
                   </button>
                </div>
                <p className="text-[10px] text-indigo-200 mt-2 text-center opacity-80">
                   *Download template, isi nilai, lalu import.
                </p>
             </div>
          </div>
        </div>

        {/* TABEL REKAP NILAI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Rekapitulasi Nilai</h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-bold">{mahasiswaList.length} Mhs</span>
           </div>
           
           <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                 <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                       <th className="px-6 py-3 text-center w-14">No</th>
                       <th className="px-6 py-3 text-left">NIM</th>
                       <th className="px-6 py-3 text-left">Nama</th>
                       {komponenList.map(k => (
                          <th key={k.id} className="px-4 py-3 text-center border-l">{k.nama} <span className="text-[10px] block text-gray-400">{k.bobot}%</span></th>
                       ))}
                       <th className="px-6 py-3 text-center bg-indigo-50 border-l border-indigo-100 text-indigo-700">Akhir</th>
                       <th className="px-6 py-3 text-center bg-indigo-50 text-indigo-700">Huruf</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {mahasiswaList.length === 0 ? (
                       <tr><td colSpan={10} className="text-center py-8 text-gray-500">Tidak ada data mahasiswa</td></tr>
                    ) : (
                       mahasiswaList.map((mhs) => (
                          <tr key={mhs.id} className="hover:bg-indigo-50/30">
                             <td className="px-6 py-3 text-center font-medium text-gray-500">{mhs.no}</td>
                             <td className="px-6 py-3 font-mono text-indigo-600 font-semibold">{mhs.nim}</td>
                             <td className="px-6 py-3 font-medium text-gray-800">{mhs.nama}</td>
                             {komponenList.map(k => (
                                <td key={k.id} className="px-4 py-3 text-center border-l border-gray-100">
                                   {mhs[k.nama] !== undefined ? (
                                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono text-xs">
                                         {Number(mhs[k.nama]).toFixed(1)}
                                      </span>
                                   ) : "-"}
                                </td>
                             ))}
                             <td className="px-6 py-3 text-center font-bold text-indigo-700 bg-indigo-50/30 border-l border-indigo-100">
                                {Number(mhs.nilai_akhir).toFixed(2)}
                             </td>
                             <td className="px-6 py-3 text-center bg-indigo-50/30">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                   mhs.nilai_huruf === 'A' ? 'bg-green-100 text-green-700' :
                                   mhs.nilai_huruf === 'E' ? 'bg-red-100 text-red-700' :
                                   'bg-blue-100 text-blue-700'
                                }`}>
                                   {mhs.nilai_huruf}
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