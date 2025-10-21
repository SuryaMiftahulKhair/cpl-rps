"use client";

import { useState } from "react";
import { ChevronLeft, Layers, Plus, Save, Edit } from "lucide-react";
// 🚀 Impor komponen DashboardLayout
import DashboardLayout from "@/app/components/DashboardLayout"; // Sesuaikan path sesuai struktur Anda

// Placeholder data untuk daftar Rubrik
const initialRubrikList = [
    { id: 1, kode: '23D121', nama: 'Rubrik Analisis Kasus' },
    { id: 2, kode: '23D121', nama: 'Rubrik Analitik Makalah' },
    { id: 3, kode: '23D121', nama: 'Rubrik Presentasi' },
    { id: 4, kode: '23D121', nama: 'Rubrik Quiz' },
    { id: 5, kode: '23D121', nama: 'Rubrik Praktikum' },
    { id: 6, kode: '23D121', nama: 'Rubrik Kerja Praktek' },
    { id: 7, kode: '23D121', nama: 'Rubrik Ujian Tertulis' },
];

interface RubrikPenilaianPageProps {
    kurikulumId: string;
}

export default function RubrikPenilaianPage({ kurikulumId }: RubrikPenilaianPageProps) {
    const [rubriks] = useState(initialRubrikList);
    const [activeRubrik, setActiveRubrik] = useState<number | 'new'>(1);
    
    const isNewFormActive = activeRubrik === 'new';

    const handleSave = () => {
        // Logika untuk menyimpan rubrik baru atau yang diedit
        console.log(`Menyimpan rubrik, status: ${isNewFormActive ? 'Baru' : 'Edit'}`);
        if (isNewFormActive) {
            setActiveRubrik(1); 
        }
    };

    return (
        // 🚀 WRAPPER UTAMA: Menggunakan DashboardLayout
        <DashboardLayout>
            {/* Hapus flex-1 bg-gray-100 min-h-screen dari sini */}
            <div className="p-8"> 
                
                {/* Page Header */}
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Layers size={24} className="text-indigo-600" />
                    Kurikulum Program Studi
                </h1>

                {/* Main Card Container */}
                <div className="bg-white shadow-xl rounded-xl p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Rubrik Penilaian Matakuliah</h2>

                    {/* Main Content Area: Flex Container (Daftar Kiri & Form Kanan) */}
                    <div className="flex">
                        
                        {/* KIRI: Daftar Rubrik (Rubric List) */}
                        <div className="w-64 border-r border-gray-200 pr-4 space-y-1 text-sm">
                            {rubriks.map((rubrik) => (
                                <button
                                    key={rubrik.id}
                                    onClick={() => setActiveRubrik(rubrik.id)}
                                    className={`w-full text-left p-2 rounded transition-colors duration-150 ${
                                        activeRubrik === rubrik.id 
                                            ? 'bg-indigo-100 text-indigo-700 font-semibold' 
                                            : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    <span className="font-mono text-xs text-gray-500 mr-1">{rubrik.kode}</span> | {rubrik.nama}
                                </button>
                            ))}
                        </div>

                        {/* KANAN: Detail/Form Rubrik */}
                        <div className="flex-1 pl-6">
                            {/* Header Aksi Kanan */}
                            <div className="flex justify-end items-center mb-4 space-x-2">
                                 <button 
                                    onClick={() => setActiveRubrik('new')}
                                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition shadow"
                                >
                                    <Plus size={16} /> Baru
                                </button>
                                <button 
                                    // Mengarahkan kembali ke halaman Mata Kuliah (asumsi: menggunakan history back atau Next.js useRouter)
                                    className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-600 transition shadow"
                                >
                                    <ChevronLeft size={16} /> Kembali
                                </button>
                            </div>

                            {/* Form Input Rubrik (Muncul ketika 'Baru' ditekan) */}
                            {isNewFormActive ? (
                                <form className="space-y-4">
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* KODE */}
                                        <div>
                                            <label htmlFor="kode" className="block text-xs font-semibold text-gray-600 mb-1">KODE</label>
                                            <input type="text" id="kode" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                        {/* NAMA RUBRIK */}
                                        <div>
                                            <label htmlFor="namaRubrik" className="block text-xs font-semibold text-gray-600 mb-1">NAMA RUBRIK</label>
                                            <input type="text" id="namaRubrik" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                    </div>
                                    
                                    {/* RUBRIK (Text Editor Placeholder) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">RUBRIK</label>
                                        <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                                            <div className="flex items-center justify-start space-x-2 border-b pb-2 mb-2">
                                                <span className="text-gray-500 text-xs">V</span>
                                                <span className="font-bold text-gray-700">B</span>
                                                <span className="italic text-gray-700">I</span>
                                                <select className="border rounded px-1 py-0.5 text-xs bg-white">
                                                    <option>sans-serif</option>
                                                </select>
                                                <span className="text-sm">...</span>
                                            </div>
                                            <textarea 
                                                rows={8} 
                                                placeholder="Masukkan detail rubrik penilaian di sini..."
                                                className="w-full border-none focus:ring-0 resize-none text-sm bg-transparent"
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Tombol Aksi Form */}
                                    <div className="flex justify-start pt-4 space-x-3">
                                        <button 
                                            type="button" 
                                            onClick={handleSave}
                                            className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                                        >
                                            <Save size={16} /> Simpan
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveRubrik(rubriks[0].id)}
                                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-400 transition"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                // Tampilan Detail Rubrik yang Sedang Dipilih
                                <div className="p-4 bg-gray-50 rounded-lg h-96 overflow-y-auto border border-indigo-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-bold text-indigo-700">Detail Rubrik: {rubriks.find(r => r.id === activeRubrik)?.nama || 'Pilih Rubrik'}</h3>
                                        <button className="p-1.5 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition duration-150" title="Edit Rubrik">
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                    <p className="text-gray-600">
                                        Ini adalah area untuk menampilkan isi lengkap rubrik yang dipilih. Data ini biasanya dimuat dari server menggunakan ID rubrik (`activeRubrik`).
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}