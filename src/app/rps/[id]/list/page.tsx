"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Book, Plus, FileText, Calendar, Award } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Fungsi utilitas untuk mendapatkan ID unik dari string kode ---
const extractIdFromCode = (kode: string): string => kode.split(' ')[0];

// --- Placeholder Data ---
const kurikulumNama = "Kurikulum Sarjana K-23";
const kurikulumID = "1003";

const matakuliahList = [
    {
        kode: "47778 | 23D12110102",
        nama: "Pengantar Teknologi Informasi",
        sks: 3,
        semester: 1,
        rpsHistory: [
            { 
                tahun: 2023, 
                semester: "Ganjil",
                isAvailable: true, 
                details: "Tugas - 15.00, Aktivitas Partisipatif - 50.00, Quiz - 5.00, Ujian Tengah Semester - 20.00, Ujian Akhir Semester - 10.00" 
            },
            { 
                tahun: 2024, 
                semester: "Genap",
                isAvailable: true, 
                details: "Aktivitas Partisipatif - 40.00, Tugas - 20.00, Quiz - 5.00, Ujian Akhir Semester - 35.00" 
            },
            { 
                tahun: 2025, 
                semester: "Ganjil",
                isAvailable: true, 
                details: "Tugas - 30.00, Aktivitas Partisipatif - 40.00, Quiz - 10.00" 
            },
        ]
    },
    {
        kode: "47780 | 23D12110203",
        nama: "Dasar Pemrograman Komputer",
        sks: 4,
        semester: 1,
        rpsHistory: [
            { 
                tahun: 2023, 
                semester: "Ganjil",
                isAvailable: true, 
                details: "Tugas - 40.00, Ujian Tengah Semester - 30.00, Ujian Akhir Semester - 30.00" 
            },
            { 
                tahun: 2024, 
                semester: "Genap",
                isAvailable: false, 
                details: "Belum tersedia RPS untuk tahun ini." 
            }
        ]
    },
    {
        kode: "47781 | 23D12110303",
        nama: "Sistem Digital",
        sks: 3,
        semester: 2,
        rpsHistory: [
            { 
                tahun: 2024, 
                semester: "Ganjil",
                isAvailable: true, 
                details: "Tugas - 50.00, Quiz - 10.00, Ujian Akhir Semester - 40.00" 
            }
        ]
    },
];

// --- Komponen Riwayat RPS ---
interface RPSHistoryItemProps {
    history: typeof matakuliahList[0]['rpsHistory'][0];
    index: number;
}

const RPSHistoryItem: React.FC<RPSHistoryItemProps> = ({ history, index }) => {
    const assessmentItems = history.isAvailable 
        ? history.details.split(', ').map(item => {
            const [method, percentage] = item.split(' - ');
            return { method, percentage };
        })
        : [];

    return (
        <div className={`p-4 rounded-lg border-2 transition-all ${
            history.isAvailable 
                ? 'border-green-200 bg-green-50/50 hover:border-green-300' 
                : 'border-red-200 bg-red-50/50'
        }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                        history.isAvailable ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        <Calendar size={18} className={
                            history.isAvailable ? 'text-green-600' : 'text-red-600'
                        } />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">
                            Tahun Ajaran {history.tahun}
                        </h4>
                        <p className="text-xs text-gray-600">Semester {history.semester}</p>
                    </div>
                </div>
                {history.isAvailable && (
                    <span className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
                        <Award size={12} />
                        Aktif
                    </span>
                )}
            </div>

            {/* Content */}
            {history.isAvailable ? (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Komponen Penilaian:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {assessmentItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-green-100">
                                <span className="text-sm text-gray-700 font-medium">
                                    {item.method}
                                </span>
                                <span className="text-sm font-bold text-green-700">
                                    {item.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-100">
                        <button className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline">
                            Lihat Detail RPS →
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-red-600">
                    <p className="text-sm font-medium">{history.details}</p>
                </div>
            )}
        </div>
    );
};

// --- Komponen Utama ---
interface RPSListByKurikulumPageProps {
    kurikulumId: string;
}

export default function RPSListByKurikulumPage({ kurikulumId }: RPSListByKurikulumPageProps) {
    const [selectedMatakuliah, setSelectedMatakuliah] = useState(matakuliahList[0]);

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                {/* Page Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Book size={28} className="text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                                RPS Matakuliah
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Kelola Rencana Pembelajaran Semester
                            </p>
                        </div>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                        <p className="text-sm font-semibold">
                            🎓 Admin Program Studi
                        </p>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-1">
                                Pilih Mata Kuliah
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
                                    <FileText size={12} />
                                    {kurikulumNama}
                                </span>
                                <span className="text-xs text-gray-600">
                                    ID: {kurikulumID}
                                </span>
                            </div>
                        </div>
                        <Link href="/rps">
                            <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm">
                                <ChevronLeft size={18} />
                                <span>Kembali</span>
                            </button>
                        </Link>
                    </div>

                    {/* Two Column Layout */}
                    <div className="flex flex-col lg:flex-row">
                        {/* LEFT: Mata Kuliah List */}
                        <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
                            <div className="p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Daftar Mata Kuliah ({matakuliahList.length})
                                </p>
                                <div className="space-y-2">
                                    {matakuliahList.map((mk, index) => {
                                        const isSelected = selectedMatakuliah.kode === mk.kode;

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedMatakuliah(mk)}
                                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 border-2 ${
                                                    isSelected
                                                        ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                                                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className={`text-xs font-mono ${
                                                        isSelected ? 'text-indigo-700' : 'text-gray-500'
                                                    }`}>
                                                        {mk.kode.split(' | ')[1]}
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${
                                                        isSelected 
                                                            ? 'bg-indigo-600 text-white' 
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {mk.sks} SKS
                                                    </span>
                                                </div>
                                                <p className={`font-semibold text-sm leading-tight ${
                                                    isSelected ? 'text-indigo-700' : 'text-gray-800'
                                                }`}>
                                                    {mk.nama}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Semester {mk.semester}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: RPS History */}
                        <div className="flex-1 p-6">
                            {/* Selected Course Header */}
                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <FileText size={20} className="text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <Link 
                                            href={`/rps/${kurikulumID}/list/${extractIdFromCode(selectedMatakuliah.kode)}`}
                                            className="text-xl font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                                        >
                                            {selectedMatakuliah.nama}
                                        </Link>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Kode: {selectedMatakuliah.kode}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 text-xs font-semibold rounded">
                                                {selectedMatakuliah.sks} SKS
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 text-xs font-semibold rounded">
                                                Semester {selectedMatakuliah.semester}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RPS History */}
                            <div className="space-y-4 mb-6">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                    Riwayat RPS ({selectedMatakuliah.rpsHistory.length})
                                </h4>
                                {selectedMatakuliah.rpsHistory.map((history, index) => (
                                    <RPSHistoryItem key={index} history={history} index={index} />
                                ))}
                            </div>

                            {/* Action Button */}
                            <div className="pt-6 border-t border-gray-200">
                                <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                                    <Plus size={18} />
                                    <span>Tambah Versi RPS Baru</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}