"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Trash2, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
    semesterId: string;
    kodeMatakuliah: string;
}

interface Dosen {
    nip: string;
    nama: string;
    posisi: string;
}

interface Mahasiswa {
    no: number;
    nim: string;
    nama: string;
}

// --- Data Placeholder ---
const kelasInfo = {
    namaKelas: "Pendidikan Agama Islam (T. Informatika A)",
    kodeMatakuliah: "23U01110102",
    namaMatakuliah: "Pendidikan Agama Islam"
};

const dosenList: Dosen[] = [
    {
        nip: "197605022005012005",
        nama: "Hj.Nur Asiah, M.Ag.",
        posisi: "Koordinator"
    }
];

const mahasiswaList: Mahasiswa[] = [
    { no: 1, nim: "D121241001", nama: "MOHAMAD ALIEF NAUVAL MOHI" },
    { no: 2, nim: "D121241003", nama: "SITI NURAULIYA" },
    { no: 3, nim: "D121241007", nama: "ALIA" },
    { no: 4, nim: "D121241009", nama: "M. YUSUF IRAWAN AKSA" },
    { no: 5, nim: "D121241011", nama: "MUHAMMAD FAJAR REZKI RAMADHAN" },
];

// --- Main Component ---
export default function DetailKelasPage({
    params
}: {
    params: Promise<PageParams>
}) {
    const { semesterId, kodeMatakuliah } = use(params);
    const [dosenData, setDosenData] = useState(dosenList);
    const [mahasiswaData, setMahasiswaData] = useState(mahasiswaList);

    // Handle delete dosen
    const handleDeleteDosen = (nip: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus dosen ini?")) {
            setDosenData(dosenData.filter(d => d.nip !== nip));
        }
    };

    // Handle delete mahasiswa
    const handleDeleteMahasiswa = (nim: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus mahasiswa ini?")) {
            setMahasiswaData(mahasiswaData.filter(m => m.nim !== nim));
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Data Kelas</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: Informasi Kelas & Data Dosen */}
                    <div className="space-y-6">
                        {/* Informasi Kelas */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800">Informasi Kelas</h2>
                                <div className="flex gap-2">
                                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow">
                                        Sinkronisasi Neosia
                                    </button>
                                    <Link href="/penilaian/datakelas">
                                        <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow">
                                            Kembali
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div className="flex border-b border-gray-100 pb-3">
                                    <div className="w-1/3 font-semibold text-gray-700 text-sm">
                                        Nama Kelas
                                    </div>
                                    <div className="w-2/3 text-gray-800 text-sm">
                                        {kelasInfo.namaKelas}
                                    </div>
                                </div>

                                <div className="flex border-b border-gray-100 pb-3">
                                    <div className="w-1/3 font-semibold text-gray-700 text-sm">
                                        Kode Matakuliah
                                    </div>
                                    <div className="w-2/3 text-gray-800 text-sm">
                                        {kelasInfo.kodeMatakuliah}
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="w-1/3 font-semibold text-gray-700 text-sm">
                                        Nama Matakuliah
                                    </div>
                                    <div className="w-2/3 text-gray-800 text-sm">
                                        {kelasInfo.namaMatakuliah}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Dosen */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800">Data Dosen</h2>
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors shadow">
                                    Tambah Manual Dosen
                                </button>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                                NIP
                                            </th>
                                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                                NAMA
                                            </th>
                                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                                POSISI
                                            </th>
                                            <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider w-20">
                                                AKSI
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dosenData.map((dosen, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                                                    {dosen.nip}
                                                </td>
                                                <td className="px-6 py-4 text-gray-800">
                                                    {dosen.nama}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {dosen.posisi}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteDosen(dosen.nip)}
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                        title="Hapus Dosen"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {dosenData.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">Tidak ada data dosen</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Data Mahasiswa */}
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Data Mahasiswa</h2>
                                
                                {/* Info Alert */}
                                <div className="bg-cyan-100 border-l-4 border-cyan-500 text-cyan-800 px-4 py-3 rounded text-sm">
                                    <p>
                                        <strong>Fasilitas hapus peserta kelas</strong> digunakan untuk mengeluarkan mahasiswa yang 
                                        tidak berproses dari penilaian pada kelas non tatap muka.
                                    </p>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider w-16">
                                                #
                                            </th>
                                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                                NIM
                                            </th>
                                            <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                                                NAMA
                                            </th>
                                            <th className="px-6 py-3 text-center font-bold text-gray-700 uppercase tracking-wider w-20">
                                                AKSI
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {mahasiswaData.map((mahasiswa, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-center text-gray-600 font-semibold">
                                                    {mahasiswa.no}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 font-mono">
                                                    {mahasiswa.nim}
                                                </td>
                                                <td className="px-6 py-4 text-gray-800">
                                                    {mahasiswa.nama}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteMahasiswa(mahasiswa.nim)}
                                                        className="text-red-500 hover:text-red-600 transition-colors"
                                                        title="Hapus Mahasiswa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {mahasiswaData.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">Tidak ada data mahasiswa</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Back to Top Button */}
                <div className="fixed bottom-8 right-8">
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        title="Kembali ke atas"
                    >
                        <ArrowLeft size={24} className="rotate-90" />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}