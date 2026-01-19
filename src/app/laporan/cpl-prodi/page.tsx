"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Filter, BarChart3, Search } from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";

// --- KOMPONEN RADAR CHART (Sama seperti sebelumnya) ---
const RadarChart: React.FC<{ data: any[]; labels: string[]; datasets: any[] }> = ({ data, labels, datasets }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    // ... (KODE CANVAS SAMA SEPERTI SEBELUMNYA, Copy Paste Saja) ...
    // Agar hemat tempat, saya skip kode canvas disini karena tidak berubah logicnya
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // ... Render Logic ...
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    const angleStep = (Math.PI * 2) / labels.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) { ctx.beginPath(); ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2); ctx.stroke(); }
    labels.forEach((_, i) => { const angle = angleStep * i - Math.PI / 2; const x = centerX + Math.cos(angle) * radius; const y = centerY + Math.sin(angle) * radius; ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(x, y); ctx.stroke(); });

    // Labels
    ctx.fillStyle = '#374151'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    labels.forEach((label, i) => { const angle = angleStep * i - Math.PI / 2; const x = centerX + Math.cos(angle) * (radius + 30); const y = centerY + Math.sin(angle) * (radius + 30); ctx.fillText(label, x, y); });

    // Datasets
    datasets.forEach((dataset) => {
      ctx.strokeStyle = dataset.borderColor; ctx.fillStyle = dataset.backgroundColor; ctx.lineWidth = 2; ctx.beginPath();
      data.forEach((point, i) => {
        const value = point[dataset.dataKey] || 0; const angle = angleStep * i - Math.PI / 2; const r = (radius / 100) * Math.min(value, 100); const x = centerX + Math.cos(angle) * r; const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }, [data, labels, datasets]);
  return <canvas ref={canvasRef} width={400} height={400} className="mx-auto" />;
};
// --------------------------------------------------------

interface TahunAjaran {
  id: number;
  tahun: string;
  semester: string;
}

export default function LaporanCplProdiPage() {
  // State Data Master
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  
  // State Filter Dropdown
  const [filterType, setFilterType] = useState<"SEMUA" | "TAHUN" | "SEMESTER">("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>(""); // Untuk filter TAHUN
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(""); // Untuk filter SEMESTER

  // State Data Grafik
  const [radarData, setRadarData] = useState<any[]>([]);
  const [courseList, setCourseList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Load Daftar Semester saat halaman dibuka
  useEffect(() => {
    fetch("/api/tahunAjaran") // Pastikan API ini mereturn list tahun ajaran
      .then(res => res.json())
      .then(json => {
        const data = Array.isArray(json) ? json : json.data;
        setSemesterList(data);
        // Set default values
        if (data.length > 0) {
            setSelectedSemesterId(String(data[0].id));
            setSelectedYear(data[0].tahun);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // 2. Helper: Ambil List Tahun Unik (misal: "2024/2025")
  const uniqueYears = Array.from(new Set(semesterList.map(s => s.tahun)));

  // 3. Fungsi Utama: Load Grafik
  const handleLoadGrafik = async () => {
    setLoading(true);
    setHasSearched(true);
    let ids: number[] = [];

    if (filterType === "SEMUA") {
        // Ambil semua ID
        ids = semesterList.map(s => Number(s.id));
    } else if (filterType === "TAHUN") {
        // Cari ID Ganjil & Genap untuk tahun tersebut
        ids = semesterList
            .filter(s => s.tahun === selectedYear)
            .map(s => Number(s.id));
    } else {
        // Satu semester spesifik
        ids = [Number(selectedSemesterId)];
    }

    try {
        const res = await fetch("/api/laporan/cpl-prodi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ semester_ids: ids })
        });
        const json = await res.json();
        setRadarData(json.radarData || []);
        setCourseList(json.courseData || []);
    } catch (error) {
        console.error(error);
        alert("Gagal memuat data grafik");
    } finally {
        setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan Capaian CPL Prodi</h1>

        {/* --- FILTER SECTION --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                
                {/* Dropdown 1: Tipe Filter */}
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cakupan Data</label>
                    <select 
                        className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <option value="SEMESTER">Per Semester</option>
                        <option value="TAHUN">1 Tahun Ajaran (Ganjil + Genap)</option>
                        <option value="SEMUA">Keseluruhan (Semua Data)</option>
                    </select>
                </div>

                {/* Dropdown 2: Konteks (Dinamis) */}
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        {filterType === 'TAHUN' ? 'Pilih Tahun' : filterType === 'SEMESTER' ? 'Pilih Semester' : '-'}
                    </label>
                    
                    {filterType === 'SEMUA' ? (
                        <input type="text" disabled value="Semua Data Terpilih" className="w-full border p-2.5 rounded-lg text-sm bg-gray-100 text-gray-400 cursor-not-allowed"/>
                    ) : filterType === 'TAHUN' ? (
                        <select 
                            className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    ) : (
                        <select 
                            className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                            value={selectedSemesterId}
                            onChange={(e) => setSelectedSemesterId(e.target.value)}
                        >
                            {semesterList.map(s => (
                                <option key={s.id} value={s.id}>{s.semester} {s.tahun}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Tombol Search */}
                <div className="w-full md:w-auto">
                    <button 
                        onClick={handleLoadGrafik}
                        disabled={loading || semesterList.length === 0}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
                        Tampilkan
                    </button>
                </div>
            </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        {!hasSearched ? (
            <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                <Filter size={48} className="mx-auto mb-2 opacity-20"/>
                <p>Silakan pilih filter dan klik "Tampilkan" untuk melihat grafik.</p>
            </div>
        ) : (
            <div className="space-y-6">
                
                {/* 1. Radar Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-gray-700">Peta Capaian Lulusan (Prodi)</h3>
                             <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-bold">
                                {filterType === 'SEMUA' ? 'ALL TIME' : filterType === 'TAHUN' ? selectedYear : 'SEMESTER INI'}
                             </span>
                        </div>
                        
                        {radarData.length > 0 ? (
                            <RadarChart 
                                data={radarData}
                                labels={radarData.map(d => d.subject)}
                                datasets={[
                                    { dataKey: 'target', borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' },
                                    { dataKey: 'prodi', borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                                ]}
                            />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">Data tidak ditemukan</div>
                        )}
                        
                        <div className="flex justify-center gap-4 mt-4 text-xs">
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div><span>Target</span></div>
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span>Capaian</span></div>
                        </div>
                    </div>

                    {/* 2. Statistik Simple */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col justify-center items-center text-center">
                        <div className="p-4 bg-indigo-50 rounded-full mb-4">
                            <BarChart3 size={32} className="text-indigo-600"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-1">Total Mata Kuliah</h3>
                        <span className="text-5xl font-bold text-indigo-600 mb-2">{courseList.length}</span>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Mata kuliah yang berkontribusi dalam perhitungan CPL pada periode {filterType.toLowerCase()} ini.
                        </p>
                    </div>
                </div>

                {/* 3. Tabel Detail per Mata Kuliah (Opsional, untuk validasi) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <h4 className="font-bold text-gray-700">Rincian Kontribusi Mata Kuliah</h4>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-indigo-50 text-indigo-900">
                                <tr>
                                    <th className="p-3 text-left">Kode MK</th>
                                    <th className="p-3 text-left">Mata Kuliah</th>
                                    <th className="p-3 text-left">Kelas</th>
                                    {radarData.map(r => <th key={r.subject} className="p-3 text-center">{r.subject}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {courseList.map((c, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 font-mono">{c.code}</td>
                                        <td className="p-3">{c.name}</td>
                                        <td className="p-3">{c.class_name}</td>
                                        {radarData.map(r => (
                                            <td key={r.subject} className="p-3 text-center">
                                                {c.scores[r.subject] ? c.scores[r.subject].toFixed(1) : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        )}
      </div>
    </DashboardLayout>
  );
}