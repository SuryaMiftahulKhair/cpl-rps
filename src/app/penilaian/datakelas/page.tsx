"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface Semester {
    id: string;
    nama: string;
    tahunAjaran: string;
}

// --- Data Placeholder ---
const semesterList: Semester[] = [
    { id: "1", nama: "GANJIL 2025/2026", tahunAjaran: "2025/2026" },
    { id: "2", nama: "GENAP 2024/2025", tahunAjaran: "2024/2025" },
    { id: "3", nama: "GANJIL 2024/2025", tahunAjaran: "2024/2025" },
    { id: "4", nama: "GENAP 2023/2024", tahunAjaran: "2023/2024" },
    { id: "5", nama: "GANJIL 2023/2024", tahunAjaran: "2023/2024" },
    { id: "6", nama: "GENAP 2022/2023", tahunAjaran: "2022/2023" },
    { id: "7", nama: "GANJIL 2022/2023", tahunAjaran: "2022/2023" },
    { id: "8", nama: "GENAP 2021/2022", tahunAjaran: "2021/2022" },
    { id: "9", nama: "GANJIL 2021/2022", tahunAjaran: "2021/2022" },
    { id: "10", nama: "GENAP 2020/2021", tahunAjaran: "2020/2021" },
    { id: "11", nama: "GANJIL 2020/2021", tahunAjaran: "2020/2021" },
    { id: "12", nama: "GENAP 2019/2020", tahunAjaran: "2019/2020" },
    { id: "13", nama: "GANJIL 2019/2020", tahunAjaran: "2019/2020" },
    { id: "14", nama: "GANJIL 2018/2019", tahunAjaran: "2018/2019" },
    { id: "15", nama: "GENAP 2017/2018", tahunAjaran: "2017/2018" },
];

// --- Main Component ---
export default function DataKelasPage() {
    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Data Kelas</h1>
                </div>

                {/* Semester Selection */}
                <div>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilih Semester</h2>
                        <div className="flex items-center justify-end mb-4">
                            <button className="bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-md">
                                Sinkronisasi Neosia
                            </button>
                        </div>
                    </div>

                    {/* Semester Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {semesterList.map((semester) => (
                            <Link 
                                key={semester.id}
                                href={`/penilaian/datakelas/${semester.id}`}
                            >
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 group cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-indigo-600 group-hover:text-indigo-700 mb-1">
                                                {semester.nama}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Tahun Ajaran {semester.tahunAjaran}
                                            </p>
                                        </div>
                                        <Eye 
                                            size={24} 
                                            className="text-gray-400 group-hover:text-indigo-600 transition-colors" 
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Back to Top Button */}
                <div className="fixed bottom-8 right-8">
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        title="Kembali ke atas"
                    >
                        <svg className="w-6 h-6 rotate-[-90deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}