// src/app/rps/[id]/list/[id_matakuliah]/page.tsx

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ChevronLeft, FileText, Plus, Copy, Eye, Edit, Trash2, X, Loader2, Calendar 
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Data Types ---
interface RPSVersion {
    id: number; // ID RPS
    nomor_dokumen: string | null;
    tanggal_penyusunan: string;
    updatedAt: string;
    deskripsi: string | null;
    is_locked: boolean;
}

interface MataKuliah {
    id: number;
    nama: string;
    kode_mk: string;
}

// --- Komponen Modal Form ---
interface AddRPSModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (keterangan: string) => void;
    isProcessing: boolean;
}

function AddRPSModal({ isOpen, onClose, onSubmit, isProcessing }: AddRPSModalProps) {
    const [keterangan, setKeterangan] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(keterangan);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800">Buat RPS Baru</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                DESKRIPSI SINGKAT
                            </label>
                            <textarea
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder="Contoh: RPS Semester Ganjil 2025/2026"
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isProcessing && <Loader2 className="animate-spin" size={18}/>}
                                {isProcessing ? "Menyimpan..." : "Simpan & Buat"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

// --- Komponen Utama Page ---
export default function RPSVersionHistoryPage({ 
    params 
}: { 
    params: Promise<{ id: string; id_matakuliah: string }> 
}) {
    const { id, id_matakuliah } = use(params);
    const router = useRouter();

    const [rpsList, setRpsList] = useState<RPSVersion[]>([]);
    const [matakuliah, setMatakuliah] = useState<MataKuliah | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- 1. Fetch Data Matkul & Riwayat RPS ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Ambil Info Matkul (Optional, bisa ambil dari API detail matkul jika ada)
                // Untuk sementara kita pakai API detail RPS yg pertama untuk ambil nama matkul, atau buat API khusus detail matkul.
                // Disini saya asumsikan kita ambil dari API List RPS saja, lalu ambil nama matkul dari response list (kalau backend kirim include matkul)
                // Atau fetch terpisah:
                
                const resList = await fetch(`/api/rps/riwayat/${id_matakuliah}`);
                const jsonList = await resList.json();

                if (jsonList.success && Array.isArray(jsonList.data)) {
                    setRpsList(jsonList.data);
                    
                    // Ambil nama matkul dari item pertama jika ada (Hack sementara jika blm ada API detail Matkul)
                    if (jsonList.data.length > 0) {
                        // Perlu backend kirim include matakuliah di API list, atau kita fetch API matakuliah
                        // Sementara hardcode dari props atau biarkan kosong dulu sampai ada API matkul detail
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id_matakuliah]);

    // --- 2. Create RPS Baru ---
    const handleAddRPS = async (keterangan: string) => {
        setIsProcessing(true);
        try {
            const res = await fetch("/api/rps/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    matakuliah_id: id_matakuliah,
                    keterangan: keterangan 
                })
            });

            const json = await res.json();

            if (json.success) {
                // Redirect ke halaman detail RPS yang baru dibuat
                router.push(`/rps/${id}/list/${id_matakuliah}/detail/${json.data.id}`);
            } else {
                alert("Gagal membuat RPS: " + json.error);
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem");
        } finally {
            setIsProcessing(false);
            setIsModalOpen(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-indigo-600" size={40}/>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="p-8">
                
                {/* Page Title */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <FileText size={28} className="text-indigo-600" />
                        Riwayat Versi RPS
                    </h1>
                    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                        Mata Kuliah ID: {id_matakuliah}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white shadow-xl rounded-xl p-6 min-h-[500px]">
                    
                    {/* Header: Title & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 mb-6 gap-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-gray-700">Daftar Dokumen RPS</h2>
                            <p className="text-sm text-gray-500">Kelola berbagai versi RPS untuk mata kuliah ini.</p>
                        </div>
                        
                        <div className="flex gap-2">
                            <Link href={`/rps/${id}/list`}>
                                <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition font-medium">
                                    <ChevronLeft size={16} /> Kembali
                                </button>
                            </Link>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition font-medium shadow-md"
                            >
                                <Plus size={16} /> Buat RPS Baru
                            </button>
                        </div>
                    </div>

                    {/* Table of RPS Versions */}
                    {rpsList.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <FileText className="mx-auto text-gray-300 mb-3" size={48}/>
                            <p className="text-gray-500 font-medium">Belum ada RPS dibuat.</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-4 text-indigo-600 hover:underline text-sm">
                                Buat RPS Pertama Sekarang
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-indigo-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">NOMOR DOKUMEN</th>
                                        <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">KETERANGAN / DESKRIPSI</th>
                                        <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">TANGGAL UPDATE</th>
                                        <th className="px-6 py-3 text-center font-bold text-xs text-indigo-700 uppercase tracking-wider">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {rpsList.map((item) => (
                                        <tr key={item.id} className="hover:bg-indigo-50/30 transition duration-100">
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                                                {item.nomor_dokumen || `Draft #${item.id}`}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.deskripsi || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap flex items-center gap-2">
                                                <Calendar size={14}/>
                                                {new Date(item.updatedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    {/* View Detail */}
                                                    <Link href={`/rps/${id}/list/${id_matakuliah}/detail/${item.id}`}>
                                                        <button className="p-1.5 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition" title="Lihat Detail">
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>
                                                    
                                                    {/* Edit (Sama kayak View sebenernya) */}
                                                    <Link href={`/rps/${id}/list/${id_matakuliah}/detail/${item.id}`}>
                                                        <button className="p-1.5 text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition" title="Edit RPS">
                                                            <Edit size={16} />
                                                        </button>
                                                    </Link>

                                                    {/* Delete (Mocking) */}
                                                    <button 
                                                        className="p-1.5 text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition" 
                                                        title="Hapus"
                                                        onClick={() => confirm("Hapus RPS ini?") && alert("Fitur delete segera hadir")}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Component */}
            <AddRPSModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddRPS}
                isProcessing={isProcessing}
            />
        </DashboardLayout>
    );
}