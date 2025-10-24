"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
    semesterId: string;
}

interface MatakuliahKelas {
    semesterKur: string;
    namaKelas: string;
    kodeMatakuliah: string;
    namaMatakuliah: string;
    sks: number;
}

// --- Data Placeholder ---
const matakuliahKelasList: MatakuliahKelas[] = [
    {
        semesterKur: "None",
        namaKelas: "Pendidikan Agama Islam (T. Informatika A)",
        kodeMatakuliah: "23U01110102",
        namaMatakuliah: "Pendidikan Agama Islam",
        sks: 2
    },
    {
        semesterKur: "None",
        namaKelas: "Pendidikan Agama Islam (T.Informatika B)",
        kodeMatakuliah: "23U01110102",
        namaMatakuliah: "Pendidikan Agama Islam",
        sks: 2
    },
    {
        semesterKur: "None",
        namaKelas: "Pendidikan Agama Khatolik (T. Informatika)",
        kodeMatakuliah: "23U01110202",
        namaMatakuliah: "Pendidikan Agama Khatolik",
        sks: 2
    },
    {
        semesterKur: "None",
        namaKelas: "Pendidikan Agama Protestan (T. Informatika)",
        kodeMatakuliah: "23U01110302",
        namaMatakuliah: "Pendidikan Agama Protestan",
        sks: 2
    },
    {
        semesterKur: "None",
        namaKelas: "Pendidikan Agama Hindu (T. Informatika)",
        kodeMatakuliah: "23U01110402",
        namaMatakuliah: "Pendidikan Agama Hindu",
        sks: 2
    },
    {
        semesterKur: "None",
        namaKelas: "Pendidikan Agama Budha (T. Informatika)",
        kodeMatakuliah: "23U01110502",
        namaMatakuliah: "Pendidikan Agama Budha",
        sks: 2
    },
    {
        semesterKur: "None",
        namaKelas: "Pendidikan Agama Khonghucu Kls. A",
        kodeMatakuliah: "23U01110602",
        namaMatakuliah: "Pendidikan Agama Khonghucu",
        sks: 2
    },
];

// --- Main Component ---
export default function SemesterMatakuliahListPage({
    params
}: {
    params: Promise<PageParams>
}) {
    const { semesterId } = use(params);
    
    const [searchSemKur, setSearchSemKur] = useState("");
    const [searchNamaKelas, setSearchNamaKelas] = useState("");
    const [searchKodeMK, setSearchKodeMK] = useState("");
    const [searchNamaMK, setSearchNamaMK] = useState("");

    // Filter matakuliah berdasarkan search
    const filteredMatakuliah = matakuliahKelasList.filter(mk => {
        const matchSemKur = mk.semesterKur.toLowerCase().includes(searchSemKur.toLowerCase());
        const matchNamaKelas = mk.namaKelas.toLowerCase().includes(searchNamaKelas.toLowerCase());
        const matchKodeMK = mk.kodeMatakuliah.toLowerCase().includes(searchKodeMK.toLowerCase());
        const matchNamaMK = mk.namaMatakuliah.toLowerCase().includes(searchNamaMK.toLowerCase());
        
        return matchSemKur && matchNamaKelas && matchKodeMK && matchNamaMK;
    });

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Data Kelas</h1>
                </div>

                {/* Header with Action Buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Data</h2>
                        <div className="flex gap-2">
                            <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-colors shadow">
                                Baru
                            </button>
                            <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow">
                                Sinkronisasi Neosia
                            </button>
                            <Link href="/penilaian/datakelas">
                                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow flex items-center gap-2">
                                    <ArrowLeft size={16} />
                                    Kembali
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Search Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <input
                            type="text"
                            placeholder="Sem. Kur."
                            value={searchSemKur}
                            onChange={(e) => setSearchSemKur(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Nama Kelas"
                            value={searchNamaKelas}
                            onChange={(e) => setSearchNamaKelas(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Kode Matakuliah"
                            value={searchKodeMK}
                            onChange={(e) => setSearchKodeMK(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Nama Matakuliah"
                            value={searchNamaMK}
                            onChange={(e) => setSearchNamaMK(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="SKS"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Matakuliah Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                        SEM. KUR.
                                    </th>
                                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                        NAMA KELAS
                                    </th>
                                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                        KODE MATAKULIAH
                                    </th>
                                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                        NAMA MATAKULIAH
                                    </th>
                                    <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                                        SKS
                                    </th>
                                    <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                                        AKSI
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredMatakuliah.map((mk, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600">
                                            {mk.semesterKur}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">
                                            {mk.namaKelas}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-mono">
                                            {mk.kodeMatakuliah}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800">
                                            {mk.namaMatakuliah}
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-700">
                                            {mk.sks}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/penilaian/datakelas/${semesterId}/${mk.kodeMatakuliah}`}
                                            >
                                                <button 
                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow ${
                                                        index === filteredMatakuliah.length - 1
                                                            ? 'bg-indigo-500 hover:bg-indigo-600'
                                                            : 'bg-green-500 hover:bg-green-600'
                                                    }`}
                                                >
                                                    Detail Kelas
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredMatakuliah.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-sm">
                                Tidak ada data matakuliah yang sesuai dengan filter
                            </p>
                        </div>
                    )}
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