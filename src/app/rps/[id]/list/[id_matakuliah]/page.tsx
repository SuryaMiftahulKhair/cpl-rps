// File: /src/app/rps/[id]/list/[id_matakuliah]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ChevronLeft, FileText, Plus, Edit, Trash2, X, Loader2, Calendar, Eye 
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Data Types ---
interface RPSVersion {
    id: number;
    nomor_dokumen: string | null;
    tanggal_penyusunan: string;
    updatedAt: string;
    deskripsi: string | null;
    is_locked: boolean;
    tahun?: string;
    semester?: string;
}

interface MataKuliah {
    id: number;
    nama: string;
    kode_mk: string;
}

// --- Komponen Modal Form (REVISI LENGKAP) ---
function AddRPSModal({ isOpen, onClose, onSubmit, isProcessing }: any) {
    const [keterangan, setKeterangan] = useState("");
    const [tahun, setTahun] = useState("2025/2026");
    const [semester, setSemester] = useState("GANJIL");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mengirim data lengkap ke fungsi handleAddRPS
        onSubmit({ 
            keterangan, 
            new_tahun: tahun, 
            new_semester: semester,
            is_new_ta: true 
        });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">Buat RPS Baru</h3>
                        <button title="tutup" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Input Tahun Ajaran */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">Tahun Ajaran</label>
                            <input 
                                type="text" 
                                value={tahun} 
                                onChange={(e) => setTahun(e.target.value)}
                                placeholder="Contoh: 2025/2026"
                                className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-indigo-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>

                        {/* Dropdown Semester (YANG BARU DITAMBAHKAN) */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">Semester</label>
                            <select 
                                className="w-full border-2 border-slate-100 rounded-lg p-2.5 bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            >
                                <option value="GANJIL">GANJIL </option>
                                <option value="GENAP">GENAP </option>
                            </select>
                        </div>

                        {/* Input Keterangan */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">Keterangan / Deskripsi</label>
                            <textarea
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder="Contoh: RPS Kurikulum Baru"
                                className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-indigo-500 outline-none transition-all text-sm min-h-20"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-[#00b041] text-white py-3 rounded-lg font-bold hover:bg-[#009637] disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-lg shadow-green-100"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>}
                            Buat RPS Sekarang
                        </button>
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
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const resList = await fetch(`/api/rps/matakuliah/${id_matakuliah}?mode=history`);
                const jsonList = await resList.json();
                if (jsonList.success) setRpsList(jsonList.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id_matakuliah]);

    // --- REVISI: Fungsi handleAddRPS yang sinkron dengan API ---
    const handleAddRPS = async (data: any) => {
        setIsProcessing(true);
        try {
            const res = await fetch("/api/rps/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    matakuliah_id: id_matakuliah,
                    keterangan: data.keterangan,
                    is_new_ta: data.is_new_ta,
                    new_tahun: data.new_tahun,
                    new_semester: data.new_semester
                })
            });

            const json = await res.json();
            if (json.success) {
                router.push(`/rps/${id}/list/${id_matakuliah}/detail/${json.data.id}`);
            } else {
                alert("Gagal: " + json.error);
            }
        } catch (err) {
            alert("Kesalahan sistem");
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
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <FileText size={28} className="text-indigo-600" />
                        Riwayat Versi RPS
                    </h1>
                    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                        Mata Kuliah ID: {id_matakuliah}
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-xl p-6 min-h-[500px]">
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
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition font-medium shadow-md shadow-indigo-100"
                            >
                                <Plus size={16} /> Buat RPS Baru
                            </button>
                        </div>
                    </div>

                    {rpsList.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <FileText className="mx-auto text-gray-300 mb-3" size={48}/>
                            <p className="text-gray-500 font-medium">Belum ada RPS dibuat.</p>
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800">{item.nomor_dokumen || `Draft #${item.id}`}</span>
                                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full w-fit mt-1 font-bold">
                                                        TA {item.tahun || '-'} ({item.semester || '-'})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                {item.deskripsi || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap flex items-center gap-2">
                                                <Calendar size={14}/>
                                                {new Date(item.updatedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link href={`/rps/${id}/list/${id_matakuliah}/detail/${item.id}`}>
                                                        <button className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition" title="Lihat Detail">
                                                            <Eye size={18} />
                                                        </button>
                                                    </Link>
                                                    <Link href={`/rps/${id}/list/${id_matakuliah}/detail/${item.id}`}>
                                                        <button className="p-2 text-green-600 bg-green-50 rounded hover:bg-green-100 transition" title="Edit">
                                                            <Edit size={18} />
                                                        </button>
                                                    </Link>
                                                    <button className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100 transition" title="Hapus">
                                                        <Trash2 size={18} />
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

            <AddRPSModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddRPS}
                isProcessing={isProcessing}
            />
        </DashboardLayout>
    );
}