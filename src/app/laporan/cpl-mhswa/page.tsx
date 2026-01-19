"use client";

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, X, Printer, Loader2, Search } from 'lucide-react';
import DashboardLayout from "@/app/components/DashboardLayout";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Types ---
interface Student {
  nim: string;
  nama: string;
}

interface StudentCPL {
  code: string;
  cplLo: string;
  nilai: number;
  description: string;
  descriptionEn: string;
}

interface TahunAjaran {
  id: number;
  tahun: string;
  semester: string;
}

export default function CPLMahasiswaPage() {
  // State Filter
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [filterType, setFilterType] = useState<"SEMUA" | "TAHUN" | "SEMESTER">("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>(""); 
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(""); 

  // State Data
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCPL, setLoadingCPL] = useState(false);
  
  // State Search Table
  const [searchNim, setSearchNim] = useState('');
  const [searchName, setSearchName] = useState('');
  
  // State Modal Detail
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentCPLData, setStudentCPLData] = useState<StudentCPL[]>([]);
  const [activeTab, setActiveTab] = useState<'radar' | 'bar'>('radar');

  // 1. Initial Load (Semester List)
  useEffect(() => {
    fetch("/api/tahunAjaran").then(res => res.json()).then(json => {
        const data = Array.isArray(json) ? json : json.data;
        setSemesterList(data);
        if (data.length > 0) {
            setSelectedSemesterId(String(data[0].id));
            setSelectedYear(data[0].tahun);
        }
    });
  }, []);

  // Helper: Unik Tahun
  const uniqueYears = Array.from(new Set(semesterList.map(s => s.tahun)));

  // Helper: Get Active Semester IDs based on Filter
  const getActiveSemesterIds = () => {
    if (filterType === "SEMUA") return semesterList.map(s => Number(s.id));
    if (filterType === "TAHUN") return semesterList.filter(s => s.tahun === selectedYear).map(s => Number(s.id));
    return [Number(selectedSemesterId)];
  };

  // 2. Load Student List
  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/laporan/cpl-mahasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester_ids: getActiveSemesterIds() })
      });
      const json = await res.json();
      setStudents(json.students || []);
      setFilteredStudents(json.students || []); // Reset filter
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  // 3. Client-side Search Filter (NIM/Nama)
  useEffect(() => {
    let filtered = students;
    if (searchNim) filtered = filtered.filter(s => s.nim.toLowerCase().includes(searchNim.toLowerCase()));
    if (searchName) filtered = filtered.filter(s => s.nama.toLowerCase().includes(searchName.toLowerCase()));
    setFilteredStudents(filtered);
  }, [searchNim, searchName, students]);

  // 4. Load CPL Detail (Modal)
  const handleOpenCPL = async (student: Student) => {
    setSelectedStudent(student);
    setLoadingCPL(true);
    try {
        const res = await fetch("/api/laporan/cpl-mahasiswa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                semester_ids: getActiveSemesterIds(),
                nim: student.nim 
            })
        });
        const json = await res.json();
        setStudentCPLData(json.cplData || []);
    } catch (e) {
        alert("Gagal hitung CPL");
    } finally {
        setLoadingCPL(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setStudentCPLData([]);
    setActiveTab('radar');
  };

  // Data Grafik
  const radarData = studentCPLData.map(item => ({ subject: item.code, value: item.nilai, fullMark: 100 }));
  const barData = studentCPLData.map(item => ({ name: item.code, nilai: item.nilai }));

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col lg:flex-row">
        
        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto min-h-screen bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">CPL Mahasiswa</h1>
          </div>

          {/* --- FILTER SECTION (Dual Dropdown) --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cakupan Data</label>
                    <select className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 text-gray-700" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                        <option value="SEMESTER">Per Semester</option>
                        <option value="TAHUN">1 Tahun Ajaran</option>
                        <option value="SEMUA">Keseluruhan</option>
                    </select>
                </div>
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        {filterType === 'TAHUN' ? 'Pilih Tahun' : filterType === 'SEMESTER' ? 'Pilih Semester' : '-'}
                    </label>
                    {filterType === 'SEMUA' ? (
                        <input disabled value="Semua Data" className="w-full border p-2.5 rounded-lg text-sm bg-gray-100 text-gray-700"/>
                    ) : filterType === 'TAHUN' ? (
                        <select className="w-full border p-2.5 rounded-lg text-sm bg-white text-gray-700" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    ) : (
                        <select className="w-full border p-2.5 rounded-lg text-sm bg-white text-gray-700" value={selectedSemesterId} onChange={(e) => setSelectedSemesterId(e.target.value)}>
                            {semesterList.map(s => <option key={s.id} value={s.id}>{s.semester} {s.tahun}</option>)}
                        </select>
                    )}
                </div>
                <button onClick={loadStudents} disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>} Tampilkan
                </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">Daftar Mahasiswa</h2>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{filteredStudents.length} Mahasiswa</span>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Cari NIM..." value={searchNim} onChange={(e) => setSearchNim(e.target.value)} className="px-4 py-2 border rounded-lg text-sm"/>
                <input type="text" placeholder="Cari Nama..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="px-4 py-2 border rounded-lg text-sm"/>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">No</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">NIM</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Nama</th>
                      <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">Data tidak ditemukan. Silakan atur filter.</td></tr>
                    ) : (
                        filteredStudents.map((s, idx) => (
                            <tr key={s.nim} className="hover:bg-indigo-50 transition">
                                <td className="py-3 px-4 text-sm text-gray-600">{idx + 1}</td>
                                <td className="py-3 px-4 text-sm font-mono text-gray-800">{s.nim}</td>
                                <td className="py-3 px-4 text-sm font-semibold text-gray-800">{s.nama}</td>
                                <td className="py-3 px-4 text-center">
                                    <button onClick={() => handleOpenCPL(s)} className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 shadow-sm">
                                        LIHAT CPL
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

        {/* Right Panel (Optional: List Master CPL) */}
        <div className="hidden xl:block w-80 bg-white border-l border-gray-200 overflow-y-auto h-screen sticky top-0">
           <div className="p-6 bg-gray-50 border-b"><h3 className="font-bold text-gray-700">Referensi CPL</h3></div>
           <div className="p-4 space-y-4">
               {/* Ini bisa diisi data statis atau fetch dari API Master CPL */}
               <div className="text-sm text-gray-500 italic text-center">Pilih mahasiswa untuk melihat detail nilai.</div>
           </div>
        </div>
      </div>

      {/* --- MODAL DETAIL CPL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start p-6 border-b bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Capaian Pembelajaran Lulusan</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedStudent.nama} ({selectedStudent.nim})</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Printer size={20}/></button>
                <button onClick={handleCloseModal} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><X size={20}/></button>
              </div>
            </div>

            {/* Content Modal */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               {loadingCPL ? (
                   <div className="flex h-60 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>
               ) : (
                   <>
                       {/* Tabs Chart */}
                       <div className="flex justify-center mb-6">
                           <div className="bg-white p-1 rounded-lg border shadow-sm inline-flex">
                               <button onClick={() => setActiveTab('radar')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'radar' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>Radar Chart</button>
                               <button onClick={() => setActiveTab('bar')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'bar' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>Bar Chart</button>
                           </div>
                       </div>

                       {/* Chart Area */}
                       <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                               {activeTab === 'radar' ? (
                                   <RadarChart data={radarData}>
                                       <PolarGrid stroke="#e5e7eb" />
                                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
                                       <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                       <Radar name="Nilai CPL" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                                       <Tooltip />
                                   </RadarChart>
                               ) : (
                                   <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                       <XAxis dataKey="name" />
                                       <YAxis domain={[0, 100]} />
                                       <Tooltip cursor={{ fill: 'transparent' }} />
                                       <Bar dataKey="nilai" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                   </BarChart>
                               )}
                           </ResponsiveContainer>
                       </div>

                       {/* Detail Table */}
                       <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                           <table className="w-full text-sm">
                               <thead className="bg-gray-100 border-b">
                                   <tr>
                                       <th className="p-4 text-left font-bold text-gray-700">Kode</th>
                                       <th className="p-4 text-left font-bold text-gray-700">Deskripsi CPL</th>
                                       <th className="p-4 text-center font-bold text-gray-700">Nilai</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y">
                                   {studentCPLData.map((item, idx) => (
                                       <tr key={idx} className="hover:bg-gray-50">
                                           <td className="p-4 font-mono font-bold text-indigo-700 w-20 align-top">{item.code}</td>
                                           <td className="p-4 text-gray-600 align-top">{item.description}</td>
                                           <td className="p-4 text-center font-bold text-gray-800 w-24 align-top text-lg">
                                               {item.nilai}
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </>
               )}
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}