"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import * as XLSX from "xlsx"; 
import { 
  ArrowLeft, Loader2, Plus, Users, 
  FileSpreadsheet, Save, Info, UserCheck, Trash2, RefreshCw, FileText
} from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";
import DosenModal from "@/app/components/DosenModal"; 

interface PageParams {
  semesterid: string;
  kodematkul: string; 
}

interface Dosen {
  id: number;
  nip: string;
  nama: string;
  role: string;
}

interface Komponen {
  id?: number;
  nama: string;
  bobot: number;
}

interface MahasiswaData {
  id: number;
  nim: string;
  nama: string;
  nilai_akhir: number;
  nilai_huruf: string;
  [key: string]: any; 
}

interface KelasInfo {
  namaKelas: string;
  kodeMatakuliah: string;
  namaMatakuliah: string;
  tahunAjaran: string;
  sks?: number;
}

interface RpsSuggestion {
  rps_id: number;
  evaluasi: { nama: string; bobot: number }[];
}

export default function DetailKelasPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const { semesterid, kodematkul: kelasIdString } = resolvedParams;
  const kelasId = kelasIdString; 


  const [kelasInfo, setKelasInfo] = useState<KelasInfo | null>(null);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [komponen, setKomponen] = useState<Komponen[]>([]);
  const [mahasiswaData, setMahasiswaData] = useState<MahasiswaData[]>([]);
  
  const [rpsSuggestion, setRpsSuggestion] = useState<RpsSuggestion | null>(null);

  const [newAspek, setNewAspek] = useState("");
  const [newBobot, setNewBobot] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDosenModalOpen, setIsDosenModalOpen] = useState(false);


  const fetchData = async () => {
    try {
      const res = await fetch(`/api/kelas/${kelasId}`);
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      const data = await res.json();
      
      setKelasInfo(data.kelasInfo);
      setDosenList(data.dosenList || []);
      setKomponen(data.komponenList || []);
      setMahasiswaData(data.mahasiswaList || []);
      
      if (data.rpsSource) {
        setRpsSuggestion(data.rpsSource);
      } else {
        setRpsSuggestion(null);
      }
      
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (kelasId) {
      setIsLoading(true);
      fetchData().finally(() => setIsLoading(false));
    }
  }, [kelasId]);

  // --- HANDLER: SYNC RPS ---
  const handleSyncRPS = async () => {
    if (!rpsSuggestion) return;
    
    const itemList = rpsSuggestion.evaluasi.map(e => `- ${e.nama} (${e.bobot}%)`).join("\n");
    if (!confirm(`Ditemukan format penilaian dari RPS Aktif.\nApakah Anda ingin menggunakannya?\n\nKomponen:\n${itemList}`)) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/kelas/${kelasId}/komponen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_rps", 
          evaluasi: rpsSuggestion.evaluasi
        })
      });

      if (!res.ok) throw new Error("Gagal sinkronisasi RPS");

      alert("✅ Berhasil menarik format penilaian dari RPS!");
      await fetchData(); 
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- HANDLER: MANUAL ASPEK ---
  const addKomponen = () => {
    if (!newAspek || !newBobot) return alert("Harap isi nama aspek dan bobot!");
    setKomponen([...komponen, { nama: newAspek, bobot: parseFloat(newBobot) }]);
    setNewAspek(""); 
    setNewBobot("");
  };

  const removeKomponen = (idx: number) => {
    if(!confirm("Hapus aspek ini?")) return;
    const newK = [...komponen];
    newK.splice(idx, 1);
    setKomponen(newK);
  };

  // --- HANDLER: UPLOAD EXCEL ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (komponen.length === 0) {
      alert("⚠️ Harap tentukan Aspek Penilaian terlebih dahulu sebelum upload Excel!");
      e.target.value = ""; 
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const dataJSON = XLSX.utils.sheet_to_json(ws);
      saveToServer(dataJSON);
    };
    reader.readAsBinaryString(file);
  };

  const saveToServer = async (excelData: any[]) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/kelas/${kelasId}/komponen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          komponen: komponen,
          dataNilai: excelData
        })
      });
      
      if(!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal menyimpan");
      }
      
      alert("✅ Data nilai berhasil disimpan!");
      await fetchData(); 
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Dummy Handler Dosen
  const handleAddDosen = async (data: any) => { 
      alert("Fitur tambah dosen belum aktif."); 
      setIsDosenModalOpen(false); 
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center gap-4">
          <Loader2 size={48} className="animate-spin text-indigo-600" />
          <p className="text-gray-500 font-medium">Memuat data kelas...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
           <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-4 shadow-sm">
             <h3 className="font-bold text-lg mb-2">Terjadi Kesalahan</h3>
             <p className="font-mono text-sm bg-white p-2 rounded border border-red-100">{error}</p>
           </div>
           <Link href={`/penilaian/datakelas/${semesterid}`}>
             <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition shadow flex items-center gap-2">
                <ArrowLeft size={18}/> Kembali
             </button>
           </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Detail Kelas</h1>
            <p className="text-gray-500 text-sm mt-1">
               {kelasInfo?.namaMatakuliah} ({kelasInfo?.kodeMatakuliah}) - Kelas {kelasInfo?.namaKelas}
            </p>
          </div>
          <Link href={`/penilaian/datakelas/${semesterid}`}>
            <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
              <ArrowLeft size={16} /> Kembali
            </button>
          </Link>
        </div>

        {/* SECTION 1: INFO KELAS & DOSEN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Info Kelas (Kiri) */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Informasi Akademik</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 mb-1">Mata Kuliah</p>
                        <p className="font-semibold text-gray-800">{kelasInfo?.namaMatakuliah}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Kode MK</p>
                        <p className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block">{kelasInfo?.kodeMatakuliah}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Tahun Ajaran</p>
                        <p className="font-semibold text-gray-800">{kelasInfo?.tahunAjaran}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Kelas</p>
                        <p className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">{kelasInfo?.namaKelas}</p>
                    </div>
                </div>
            </div>

            {/* Data Dosen (Kanan) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                 <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <UserCheck size={18} className="text-indigo-600"/> Dosen
                    </h2>
                    <button onClick={() => setIsDosenModalOpen(true)} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-100 transition">
                        + Edit
                    </button>
                 </div>
                 <div className="grow overflow-y-auto max-h-40 pr-2 custom-scrollbar">
                    {dosenList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm italic min-h-[100px]">
                            <UserCheck size={24} className="mb-1 opacity-20"/>
                            Belum ada dosen.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dosenList.map((d) => (
                                <div key={d.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 shadow-sm">
                                        {d.nama ? d.nama.charAt(0) : "D"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{d.nama}</p>
                                        <p className="text-[10px] text-gray-500 font-mono bg-white px-1 rounded inline-block border border-gray-200">{d.nip}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {/* SECTION 2: INPUT ASPEK & UPLOAD */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Save className="text-green-600" /> Manajemen Penilaian
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Form Aspek */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">1. Atur Komponen Nilai</h3>
                    
                    {/* TOMBOL SYNC RPS (Hanya muncul jika tabel kosong & ada RPS) */}
                    {komponen.length === 0 && rpsSuggestion && (
                        <button 
                            onClick={handleSyncRPS}
                            disabled={isProcessing}
                            className="text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full font-bold border border-orange-200 hover:bg-orange-100 flex items-center gap-1.5 animate-pulse transition-colors"
                        >
                            <FileText size={14}/> Tarik dari RPS
                        </button>
                    )}

                    {komponen.length > 0 && (
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">Total Bobot: {komponen.reduce((a,b)=>a+b.bobot,0)}%</span>
                    )}
                </div>
                
                <div className="flex gap-2 mb-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nama (cth: UTS)</label>
                        <input className="border p-2 rounded w-full text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-700" value={newAspek} onChange={e => setNewAspek(e.target.value)} placeholder="Tugas 1" />
                    </div>
                    <div className="w-24">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Bobot %</label>
                        <input type="number" className="border p-2 rounded w-full text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-700" value={newBobot} onChange={e => setNewBobot(e.target.value)} placeholder="20" />
                    </div>
                    <button onClick={addKomponen} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg transition h-[38px] w-[38px] flex items-center justify-center shadow-sm">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {komponen.length === 0 && (
                        <span className="text-sm text-gray-400 italic">
                            {rpsSuggestion ? "Klik tombol 'Tarik dari RPS' di atas atau tambah manual." : "Belum ada aspek. Tambahkan manual."}
                        </span>
                    )}
                    {komponen.map((k, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-2 text-gray-700 group hover:border-indigo-200 transition">
                            <span className="font-medium">{k.nama}</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold border border-indigo-100">{k.bobot}%</span>
                            <button onClick={() => removeKomponen(idx)} className="text-gray-300 hover:text-red-500 ml-1 transition"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">2. Import Nilai (Excel)</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-indigo-300 transition cursor-pointer relative h-32 flex flex-col items-center justify-center group bg-gray-50/50">
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isProcessing} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                    {isProcessing ? (
                         <div className="flex flex-col items-center text-indigo-600">
                            <Loader2 className="animate-spin mb-2" />
                            <span className="text-sm font-bold">Memproses data...</span>
                         </div>
                    ) : (
                        <>
                            <FileSpreadsheet size={32} className="text-gray-400 group-hover:text-green-600 transition mb-2"/>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Klik untuk upload .xlsx</span>
                            <span className="text-[10px] text-gray-400 mt-1">
                                Pastikan Header Excel: <span className="font-mono bg-white border px-1 rounded">NIM</span>, <span className="font-mono bg-white border px-1 rounded">Nama</span>, {komponen.length > 0 ? komponen.map(k=>k.nama).join(", ") : "..."}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* SECTION 3: TABEL NILAI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Users size={18} className="text-gray-500" /> Rekap Nilai Mahasiswa</h2>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">Total: {mahasiswaData.length} Mahasiswa</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold w-12 sticky left-0 bg-gray-100 z-10">No</th>
                    <th className="px-6 py-4 text-left font-bold sticky left-12 bg-gray-100 z-10 shadow-sm">NIM</th>
                    <th className="px-6 py-4 text-left font-bold min-w-[200px]">Nama</th>
                    {komponen.map((k, i) => (
                        <th key={i} className="px-4 py-4 text-center font-bold bg-white text-indigo-900 border-l border-gray-200 min-w-[100px]">
                            {k.nama} <br/><span className="text-[9px] text-gray-400 font-normal">({k.bobot}%)</span>
                        </th>
                    ))}
                    <th className="px-6 py-4 text-center font-bold bg-gray-200 text-gray-800 border-l border-gray-300">Akhir</th>
                    <th className="px-6 py-4 text-center font-bold bg-gray-200 text-gray-800">Huruf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mahasiswaData.length === 0 ? (
                    <tr><td colSpan={5 + komponen.length} className="px-6 py-16 text-center text-gray-400 w-full">
                        <div className="flex flex-col items-center justify-center">
                            <Info size={32} className="mb-2 opacity-20"/>
                            <p>Belum ada data nilai.</p>
                            <p className="text-xs mt-1">Silakan atur komponen nilai lalu upload Excel.</p>
                        </div>
                    </td></tr>
                  ) : (
                    mahasiswaData.map((mhs, idx) => (
                      <tr key={mhs.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-3 text-gray-500 sticky left-0 bg-white group-hover:bg-blue-50/50">{idx + 1}</td>
                        <td className="px-6 py-3 font-mono font-medium text-gray-800 sticky left-12 bg-white group-hover:bg-blue-50/50 shadow-sm">{mhs.nim}</td>
                        <td className="px-6 py-3 text-gray-600 uppercase text-xs font-semibold">{mhs.nama}</td>
                        {komponen.map((k, i) => (
                            <td key={i} className="px-4 py-3 text-center border-l border-gray-100 text-gray-700">
                                {mhs[k.nama] !== undefined ? mhs[k.nama] : <span className="text-gray-300">-</span>}
                            </td>
                        ))}
                        <td className="px-6 py-3 text-center font-bold text-blue-700 bg-gray-50 border-l border-gray-200 group-hover:bg-blue-100/50">{mhs.nilai_akhir}</td>
                        <td className="px-6 py-3 text-center bg-gray-50 font-bold text-gray-800 group-hover:bg-blue-100/50">{mhs.nilai_huruf || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* Modal Dosen */}
        <DosenModal 
          isOpen={isDosenModalOpen}
          onClose={() => setIsDosenModalOpen(false)}
          onSubmit={handleAddDosen}
          submitting={false}
        />
      </div>
    </DashboardLayout>
  );
}