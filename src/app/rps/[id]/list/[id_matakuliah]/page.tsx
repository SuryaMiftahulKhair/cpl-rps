"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Plus, Copy, Eye, Edit, Trash2, X } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Data Types & Placeholder Data ---
interface RPSVersion {
    kode: number;
    tahunSemester: string;
    keterangan: string;
}

const matakuliahNama = "Pengantar Teknologi Informasi";
const matakuliahKode = "23D12110102";
const kurikulumID = "1003";

const initialRPSVersions: RPSVersion[] = [
    { kode: 547, tahunSemester: "2023", keterangan: "2023" },
    { kode: 5913, tahunSemester: "2024", keterangan: "Semester Ganjil 2024/2025" },
    { kode: 10716, tahunSemester: "2025/1", keterangan: "Awal 2025/2026" },
];

// --- Komponen Modal Form ---
interface AddRPSModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { tahunSemester: string; keterangan: string }) => void;
}

function AddRPSModal({ isOpen, onClose, onSubmit }: AddRPSModalProps) {
    const [tahunSemester, setTahunSemester] = useState("");
    const [keterangan, setKeterangan] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tahunSemester.trim() && keterangan.trim()) {
            onSubmit({ tahunSemester, keterangan });
            // Reset form
            setTahunSemester("");
            setKeterangan("");
        }
    };

    const handleClose = () => {
        setTahunSemester("");
        setKeterangan("");
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={handleClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800">Data</h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Body - Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Input Tahun/Semester */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                TAHUN
                            </label>
                            <input
                                type="text"
                                value={tahunSemester}
                                onChange={(e) => setTahunSemester(e.target.value)}
                                placeholder="Contoh: 2025/1"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Input Keterangan */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                KETERANGAN
                            </label>
                            <textarea
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder="Masukkan keterangan RPS..."
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

// --- Komponen Utama RPSVersionHistoryPage ---
interface RPSVersionHistoryPageProps {
    matakuliahId: string; 
}

export default function RPSVersionHistoryPage({ matakuliahId }: RPSVersionHistoryPageProps) {
    const [data, setData] = useState(initialRPSVersions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userRole = "Admin Program Studi";

    // Handler untuk menambah RPS baru
    const handleAddRPS = (newData: { tahunSemester: string; keterangan: string }) => {
        // Generate kode baru (dalam aplikasi real, ini dari backend)
        const newKode = Math.max(...data.map(item => item.kode)) + 1;
        
        const newRPS: RPSVersion = {
            kode: newKode,
            tahunSemester: newData.tahunSemester,
            keterangan: newData.keterangan,
        };

        setData([...data, newRPS]);
        setIsModalOpen(false);
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                
                {/* Page Title and Role Alert */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <FileText size={28} className="text-indigo-600" />
                        RPS Matakuliah
                    </h1>
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm shadow-sm">
                        Peran saat ini sebagai <strong>{userRole}</strong>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white shadow-xl rounded-xl p-6">
                    
                    {/* Header, Title, and Action Buttons */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-gray-700">Tahun/Semester RPS</h2>
                            <p className="text-sm text-indigo-600 font-medium">Mata Kuliah: {matakuliahNama}</p>
                        </div>
                        
                        {/* Action Buttons: Kembali, Baru, Copy */}
                        <div className="flex gap-2">
                            <Link href={`/rps/${kurikulumID}`}>
                                <button className="flex items-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition shadow">
                                    <ChevronLeft size={16} /> Kembali
                                </button>
                            </Link>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition shadow"
                            >
                                <Plus size={16} /> Baru
                            </button>
                            <button className="flex items-center gap-1 bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-600 transition shadow">
                                <Copy size={16} /> Copy Dari
                            </button>
                        </div>
                    </div>

                    {/* Table of RPS Versions */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-indigo-50">
                                <tr>
                                    <th className="w-1/4 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">TAHUN/SEMESTER</th>
                                    <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">KETERANGAN</th>
                                    <th className="w-48 px-6 py-3 text-center font-bold text-xs text-indigo-700 uppercase tracking-wider">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {data.map((item) => (
                                    <tr key={item.kode} className="hover:bg-indigo-50/50 transition duration-100">
                                        <td className="px-6 py-3 whitespace-nowrap font-semibold text-gray-800">
                                            {item.kode} | {item.tahunSemester}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">{item.keterangan}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-center space-x-2">
                                            {/* Aksi: View (Biru) - Link ke Detail RPS, Edit (Hijau), Copy (Kuning), Delete (Merah) */}
                                            <Link href={`/rps/${kurikulumID}/list/${matakuliahId}/detail/${item.kode}`}>
                                                <button className="p-1.5 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 transition duration-150" title="Lihat Detail RPS">
                                                    <Eye size={16} />
                                                </button>
                                            </Link>
                                            <button className="p-1.5 text-green-600 border border-green-200 rounded-full hover:bg-green-100 transition duration-150" title="Edit RPS">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-1.5 text-yellow-600 border border-yellow-200 rounded-full hover:bg-yellow-100 transition duration-150" title="Duplikasi RPS">
                                                <Copy size={16} />
                                            </button>
                                            <button className="p-1.5 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition duration-150" title="Hapus Versi">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Component */}
            <AddRPSModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddRPS}
            />
        </DashboardLayout>
    );
}