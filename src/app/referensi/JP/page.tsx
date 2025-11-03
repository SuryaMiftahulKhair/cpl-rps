"use client";

// 🚀 PERBAIKAN UTAMA: Tambahkan semua impor yang hilang
import { useState, FormEvent } from "react";
import { Edit, Trash2, Plus, Search, X, Save } from "lucide-react";

// 🚀 Import DashboardLayout
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Data Types ---
interface JenisPenilaian {
    id: number;
    nama: string;
    basis: string;
    dipilih: boolean;
}

interface JPModalData {
    nama: string;
    basis: string;
    dipilih: boolean;
}

// --- 1. Modal Component (Pop-up for Data Baru Jenis Penilaian) ---

interface JPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: JPModalData) => void;
}

const BasisPenilaianOptions = [
    "Aktivitas Partisipatif",
    "Hasil Proyek",
    "Tugas",
    "Quiz",
    "Ujian Tengah Semester",
    "Ujian Akhir Semester"
];

function JenisPenilaianModal({ isOpen, onClose, onSubmit }: JPModalProps) {
    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const newJPData: JPModalData = {
            nama: formData.get("namaPenilaian") as string,
            basis: formData.get("basisPenilaian") as string,
            dipilih: formData.get("dapatDipilih") === 'Ya', 
        };
        
        if (newJPData.nama && newJPData.basis) {
            onSubmit(newJPData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 scale-100">
                
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Data</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />Lihat
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label htmlFor="namaPenilaian" className="block text-xs font-semibold text-gray-700 mb-2">JENIS PENILAIAN</label>
                        <input type="text" id="namaPenilaian" name="namaPenilaian" required placeholder="Nama Penilaian" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>

                    <div>
                        <label htmlFor="basisPenilaian" className="block text-xs font-semibold text-gray-700 mb-2">BASIS PENILAIAN</label>
                        <select id="basisPenilaian" name="basisPenilaian" required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition">
                            {BasisPenilaianOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="dapatDipilih" className="block text-xs font-semibold text-gray-700 mb-2">DAPAT DIPILIH</label>
                        <select id="dapatDipilih" name="dapatDipilih" required defaultValue="Ya" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition">
                            <option value="Ya">Ya</option>
                            <option value="Tidak">Tidak</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-6 space-x-3">
                        <button 
                            type="submit" 
                            className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                        >
                            <Save size={16} /> Simpan
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-400 transition"
                        >
                            Tutup
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- 2. Komponen Utama JenisPenilaianPage (Menggunakan Layout) ---

export default function JenisPenilaianPage() {
    // 🚀 PERBAIKAN: Gunakan tipe JenisPenilaian[] untuk data state
    const [data, setData] = useState<JenisPenilaian[]>([
        { id: 1, nama: "Tugas", basis: "Tugas", dipilih: true },
        { id: 2, nama: "Quiz", basis: "Quiz", dipilih: true },
        { id: 3, nama: "Mid Tes", basis: "Ujian Tengah Semester", dipilih: true },
        { id: 4, nama: "Final Tes", basis: "Ujian Akhir Semester", dipilih: true },
        { id: 5, nama: "Partisipasi", basis: "Aktivitas Partisipatif", dipilih: true },
        { id: 6, nama: "Observasi", basis: "Aktivitas Partisipatif", dipilih: true },
        { id: 7, nama: "Tes Tertulis", basis: "Quiz", dipilih: true },
        { id: 8, nama: "Praktikum", basis: "Tugas", dipilih: true },
    ]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddJenisPenilaian = (newJPData: JPModalData) => {
        const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
        
        const newJenis: JenisPenilaian = {
            id: maxId + 1,
            nama: newJPData.nama,
            basis: newJPData.basis,
            dipilih: newJPData.dipilih,
        };
        
        setData([newJenis, ...data]);
        setIsModalOpen(false);
    };


    return (
        // 🚀 WRAPPER: Menggunakan DashboardLayout
        <DashboardLayout>
            <div className="p-8">
                
                {/* Page Header and Controls */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Jenis Penilaian</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.01]"
                    >
                        <Plus size={18} />
                        Data Baru
                    </button>
                </div>

                {/* Main Card Container */}
                <div className="bg-white shadow-xl rounded-xl p-6">
                    
                    {/* Search and Filter Row */}
                    <div className="flex justify-end items-center mb-5">
                        <div className="relative w-72">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari penilaian..."
                                className="w-full py-2 pl-10 pr-4 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            
                            {/* Table Head */}
                            <thead className="bg-indigo-50">
                                <tr>
                                    <th className="w-12 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">Nama Penilaian</th>
                                    <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">Basis Penilaian</th>
                                    <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">Dapat Dipilih</th>
                                    <th className="w-24 px-6 py-3 text-center font-bold text-xs text-indigo-700 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            
                            {/* Table Body */}
                            <tbody className="bg-white divide-y divide-gray-100">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-indigo-50/50 transition duration-100">
                                        <td className="px-6 py-3 whitespace-nowrap text-gray-500">{item.id}</td>
                                        <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-700">{item.nama}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-gray-600">{item.basis}</td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            {/* Badge for "Dapat Dipilih" status */}
                                            <span 
                                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                                    item.dipilih 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {item.dipilih ? 'Ya' : 'Tidak'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-center space-x-2">
                                            <button 
                                                className="p-1.5 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition duration-150"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="p-1.5 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition duration-150"
                                                title="Hapus"
                                            >
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

            {/* MODAL INTEGRATION */}
            <JenisPenilaianModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddJenisPenilaian}
            />
        </DashboardLayout>
    );
}