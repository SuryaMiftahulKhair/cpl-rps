"use client";

import React from "react";
import { Loader2, Filter, BarChart3, Search } from "lucide-react"; 
import DashboardLayout from "@/app/components/DashboardLayout";
import { useCPLProdi } from "@/hooks/useCPLProdi"; 
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function LaporanCplProdiPage() {
  // Panggil Hook
  const {
    semesterList, uniqueYears, radarData, courseList,
    loading, hasSearched,
    filterType, setFilterType, selectedYear, setSelectedYear, selectedSemesterId, setSelectedSemesterId,
    loadReport
  } = useCPLProdi();

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
                        onClick={loadReport}
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
                
                {/* 1. Radar Chart & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CHART */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-gray-700">Peta Capaian Lulusan (Prodi)</h3>
                             <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-bold">
                                {filterType === 'SEMUA' ? 'ALL TIME' : filterType === 'TAHUN' ? selectedYear : 'SEMESTER INI'}
                             </span>
                        </div>
                        
                        {radarData.length > 0 ? (
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#e5e7eb" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                        
                                        <Radar name="Target" dataKey="target" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                                        <Radar name="Capaian Prodi" dataKey="prodi" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
                                        
                                        <Legend />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">Data tidak ditemukan</div>
                        )}
                    </div>

                    {/* STATS */}
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

                {/* 2. Tabel Detail per Mata Kuliah */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <h4 className="font-bold text-gray-700">Rincian Kontribusi Mata Kuliah</h4>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-indigo-50 text-indigo-900">
                                <tr>
                                    <th className="p-3 text-left min-w-[100px]">Kode MK</th>
                                    <th className="p-3 text-left min-w-[200px]">Mata Kuliah</th>
                                    <th className="p-3 text-left min-w-[100px]">Kelas</th>
                                    {/* Header Dinamis CPL */}
                                    {radarData.map(r => (
                                        <th key={r.subject} className="p-3 text-center min-w-[60px]">{r.subject}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {courseList.length === 0 ? (
                                    <tr><td colSpan={3 + radarData.length} className="p-6 text-center text-gray-400">Tidak ada data kelas.</td></tr>
                                ) : (
                                    courseList.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="p-3 font-mono font-medium text-gray-600">{c.code}</td>
                                            <td className="p-3 font-medium text-gray-800">{c.name}</td>
                                            <td className="p-3 text-gray-600">{c.class_name}</td>
                                            {radarData.map(r => {
                                                const val = c.scores[r.subject];
                                                return (
                                                    <td key={r.subject} className="p-3 text-center">
                                                        {val ? (
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                                val >= 75 ? 'bg-green-100 text-green-700' : 
                                                                val >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                                {val.toFixed(0)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
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