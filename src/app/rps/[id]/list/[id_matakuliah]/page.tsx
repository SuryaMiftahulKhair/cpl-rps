"use client";

import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // TAMBAHKAN useSearchParams
import { 
    ChevronLeft, FileText, Plus, Edit, Trash2, X, Loader2, Calendar, Eye 
} from "lucide-react";
import { Semester } from "@prisma/client";
import DashboardLayout from "@/app/components/DashboardLayout";
import AddRPSModal from "@/app/components/AddRPSModal";

// --- Data Types ---
interface RPSVersion {
    id: number;
    nomor_dokumen: string | null;
    tanggal_penyusunan: string;
    updatedAt: string;
    deskripsi: string | null;
    is_locked: boolean;
    tahun?: string;
    semester?: Semester;
}

interface MataKuliah {
    id: number;
    nama: string;
    kode_mk: string;
}

// --- Form Data Type ---
interface RPSFormData {
    keterangan: string;
    tahun: string;
    semester: Semester;
}

// --- Komponen Modal Form dengan React Hook Form ---

// --- Komponen Utama Page ---
export default function RPSVersionHistoryPage({ 
    params 
}: { 
    params: Promise<{ id: string; id_matakuliah: string }> 
}) {
    const { id, id_matakuliah } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams(); // AMBIL prodiId DARI URL
    const prodiId = searchParams.get("prodiId");

    const [rpsList, setRpsList] = useState<RPSVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [isDeleting, setIsDeleting] = useState<number | null>(null); // State untuk loading per item

    useEffect(() => {
        const fetchData = async () => {
            if (!prodiId) return; // Tunggu prodiId dari sidebar
            setLoading(true);
            try {
                // TAMBAHKAN prodiId ke API fetch history
                const resList = await fetch(`/api/rps/matakuliah/${id_matakuliah}?mode=history&prodiId=${prodiId}`);
                const jsonList = await resList.json();
                if (jsonList.success) setRpsList(jsonList.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id_matakuliah, prodiId]);

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
                    new_semester: data.new_semester,
                    prodiId: prodiId // KIRIM prodiId saat buat RPS baru
                })
            });

            const json = await res.json();
            if (json.success) {
                // Pastikan saat redirect tetap membawa prodiId
                router.push(`/rps/${id}/list/${id_matakuliah}/detail/${json.data.id}?prodiId=${prodiId}`);
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

    const handleDeleteRPS = async (rpsId: number) => {
        const confirmDelete = confirm("Apakah Anda yakin ingin menghapus versi RPS ini? Data yang dihapus tidak dapat dikembalikan.");
        if (!confirmDelete) return;

        setIsDeleting(rpsId);
        try {
            const res = await fetch(`/api/rps/delete/${rpsId}?prodiId=${prodiId}`, {
                method: "DELETE",
            });

            const json = await res.json();
            if (json.success) {
                // Update state rpsList secara lokal agar data langsung hilang dari tabel
                setRpsList((prev) => prev.filter((item) => item.id !== rpsId));
                alert("RPS berhasil dihapus.");
            } else {
                alert("Gagal menghapus: " + json.error);
            }
        } catch (err) {
            alert("Terjadi kesalahan sistem.");
        } finally {
            setIsDeleting(null);
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
                        Prodi ID: {prodiId} | MK ID: {id_matakuliah}
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-xl p-6 min-h-[500px]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 mb-6 gap-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-gray-700">Daftar Dokumen RPS</h2>
                            <p className="text-sm text-gray-500">Kelola berbagai versi RPS untuk mata kuliah ini.</p>
                        </div>
                        
                        <div className="flex gap-2">
                            {/* Pastikan Link Kembali membawa prodiId */}
                            <Link href={`/rps/${id}/list?prodiId=${prodiId}`}>
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
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                {item.deskripsi || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14}/>
                                                    {new Date(item.updatedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    {/* Link Detail dan Edit membawa prodiId */}
                                                    <Link href={`/rps/${id}/list/${id_matakuliah}/detail/${item.id}?prodiId=${prodiId}`}>
                                                        <button className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition" title="Lihat Detail">
                                                            <Eye size={18} />
                                                        </button>
                                                    </Link>
                                                    <button 
        onClick={() => handleDeleteRPS(item.id)}
        disabled={isDeleting === item.id}
        className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100 transition disabled:opacity-50" 
        title="Hapus"
    >
        {isDeleting === item.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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