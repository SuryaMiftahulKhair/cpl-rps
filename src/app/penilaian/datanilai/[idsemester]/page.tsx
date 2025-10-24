"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
    semesterId: string;
}

interface KelasNilai {
    semesterKur: string;
    idKelas: string;
    namaKelas: string;
    kodeMatakuliah: string;
    namaMatakuliah: string;
    sks: number;
}

// --- Data Placeholder ---
const kelasNilaiList: KelasNilai[] = [
    {
        semesterKur: "None",
        idKelas: "149616",
        namaKelas: "Pendidikan Agama Islam (T. Informatika A)",
        kodeMatakuliah: "23U01110102",
        namaMatakuliah: "Pendidikan Agama Islam",
        sks: 2
    },
    {
        semesterKur: "None",
        idKelas: "149620",
        namaKelas: "Pendidikan Agama Islam (T.Informatika B)",
        kodeMatakuliah: "23U01110102",
        namaMatakuliah: "Pendidikan Agama Islam",
        sks: 2
    },
    {
        semesterKur: "None",
        idKelas: "149634",
        namaKelas: "Pendidikan Agama Khatolik (T. Informatika)",
        kodeMatakuliah: "23U01110202",
        namaMatakuliah: "Pendidikan Agama Khatolik",
        sks: 2
    },
    {
        semesterKur: "None",
        idKelas: "149635",
        namaKelas: "Pendidikan Agama Protestan (T. Informatika)",
        kodeMatakuliah: "23U01110302",
        namaMatakuliah: "Pendidikan Agama Protestan",
        sks: 2
    },
    {
        semesterKur: "None",
        idKelas: "149638",
        namaKelas: "Pendidikan Agama Hindu (T. Informatika)",
        kodeMatakuliah: "23U01110402",
        namaMatakuliah: "Pendidikan Agama Hindu",
        sks: 2
    },
    {
        semesterKur: "None",
        idKelas: "149641",
        namaKelas: "Pendidikan Agama Budha (T. Informatika)",
        kodeMatakuliah: "23U01110502",
        namaMatakuliah: "Pendidikan Agama Budha",
        sks: 2
    },
];

// --- Main Component ---
export default function SemesterNilaiListPage({
    params
}: {
    params: Promise<PageParams>
}) {
    const { semesterId } = use(params);
    
    const [searchSemKur, setSearchSemKur] = useState("");
    const [searchIdKelas, setSearchIdKelas] = useState("");
    const [searchNamaKelas, setSearchNamaKelas] = useState("");
    const [searchKodeMK, setSearchKodeMK] = useState("");
    const [searchNamaMK, setSearchNamaMK] = useState("");

    // Get semester name
    const getSemesterName = (id: string) => {
        const semesterMap: { [key: string]: string } = {
            "1": "Ganjil 2025/2026",
            "2": "Genap 2024/2025",
            "3": "Ganjil 2024/2025",
        };
        return semesterMap[id] || `Semester ${id}`;
    };

    // Filter kelas berdasarkan search
    const filteredKelas = kelasNilaiList.filter(kelas => {
        const matchSemKur = kelas.semesterKur.toLowerCase().includes(searchSemKur.toLowerCase());
        const matchIdKelas = kelas.idKelas.toLowerCase().includes(searchIdKelas.toLowerCase());
        const matchNamaKelas = kelas.namaKelas.toLowerCase().includes(searchNamaKelas.toLowerCase());
        const matchKodeMK = kelas.kodeMatakuliah.toLowerCase().includes(searchKodeMK.toLowerCase());
        const matchNamaMK = kelas.namaMatakuliah.toLowerCase().includes(searchNamaMK.toLowerCase());
        
        return matchSemKur && matchIdKelas && matchNamaKelas && matchKodeMK && matchNamaMK;
    });

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Data Nilai</h1>
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                        <p className="text-sm font-semibold">
                            Peran saat ini sebagai Admin Program Studi
                        </p>
                    </div>
                </div>

                {/* Page Title */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Data Nilai | Semester {getSemesterName(semesterId)}
                        </h2>
                        <Link href="/penilaian/datanilai">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow flex items-center gap-2">
                                <ArrowLeft size={16} />
                                Kembali
                            </button>
                        </Link>
                    </div>

                    {/* Search Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <input
                            type="text"
                            placeholder="Sem. Kur."
                            value={searchSemKur}
                            onChange={(e) => setSearchSemKur(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="ID Kelas"
                            value={searchIdKelas}
                            onChange={(e) => setSearchIdKelas(e.target.value)}
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

                {/* Kelas Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                        SEM. KUR.
                                    </th>
                                    <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                        ID KELAS
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
                                {filteredKelas.map((kelas, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600">
                                            {kelas.semesterKur}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-mono">
                                            {kelas.idKelas}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">
                                            {kelas.namaKelas}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-mono">
                                            {kelas.kodeMatakuliah}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800">
                                            {kelas.namaMatakuliah}
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-700">
                                            {kelas.sks}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/penilaian/datanilai/${semesterId}/${kelas.idKelas}`}
                                            >
                                                <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow">
                                                    Penilaian
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredKelas.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-sm">
                                Tidak ada data kelas yang sesuai dengan filter
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