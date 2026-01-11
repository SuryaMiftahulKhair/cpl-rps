"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ChevronLeft, Edit, FileText, BookOpen, Target,
    ClipboardList, Loader2, Printer, Trash2, Copy, Plus, X, Save,
    Book, CheckSquare, GraduationCap, PieChart
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// ... (KOMPONEN HELPER: Modal, SectionHeader, InfoRow -> TETAP SAMA, TIDAK BERUBAH) ...
// Agar hemat tempat, bagian Helper di atas tidak saya tulis ulang. 
// Pastikan kode Helper (Modal, SectionHeader, InfoRow) dari jawaban sebelumnya tetap ada di file kakak.

// --- MAIN PAGE ---
export default function DetailRPSPage({ params }: { params: Promise<{ id: string; id_matakuliah: string; id_rps: string }> }) {
    const { id, id_matakuliah, id_rps } = use(params);
    const router = useRouter();
    
    // State Data
    const [activeTab, setActiveTab] = useState<"pertemuan" | "evaluasi">("pertemuan");
    const [rpsData, setRpsData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State Modal General
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    
    // State Modal Pertemuan & Evaluasi
    const [showPertemuanModal, setShowPertemuanModal] = useState(false);
    const [pertemuanForm, setPertemuanForm] = useState<any>({});
    const [isEditPertemuan, setIsEditPertemuan] = useState(false);
    const [selectedCpmkId, setSelectedCpmkId] = useState<string>(""); // State Helper untuk Pilih CPMK

    // State Modal CPMK
    const [showCpmkModal, setShowCpmkModal] = useState(false);
    const [cpmkForm, setCpmkForm] = useState<any>({ kode: "", deskripsi: "", ik_ids: [] });

    // --- FETCH DATA (SAMA) ---
    const fetchRPSData = async () => {
        try {
            const res = await fetch(`/api/rps/${id_rps}`); 
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            const json = await res.json();
            if (json.success) setRpsData(json.data);
            else throw new Error(json.error);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRPSData(); }, [id_rps]);

    function Modal({ isOpen, onClose, title, children, onSave, isSaving }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <button title="Tutup" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto grow">
                    {children}
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl shrink-0 sticky bottom-0 z-10">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                    <button 
                        onClick={onSave} 
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

// 2. Section Header
function SectionHeader({ title, icon, onEdit, action }: { title: string, icon?: React.ReactNode, onEdit?: () => void, action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between bg-slate-600 text-white px-4 py-3 rounded-t-lg print:bg-white print:text-black print:border-b print:border-black">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
                {icon} {title}
            </h3>
            <div className="flex items-center gap-2">
                {action}
                {onEdit && (
                    <button 
                        onClick={onEdit} 
                        className="p-1.5 hover:bg-slate-700 rounded transition-colors print:hidden text-white/80 hover:text-white" 
                        title="Edit Bagian Ini"
                    >
                        <Edit size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

// 3. Info Row
function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex py-2 border-b border-gray-100 last:border-0 print:border-gray-300">
            <div className="w-1/3 font-semibold text-gray-700 text-sm print:text-black">{label}</div>
            <div className="w-2/3 text-gray-800 text-sm print:text-black">{value}</div>
        </div>
    );
}
    const handleCpmkSelect = (cpmkId: string) => {
        setSelectedCpmkId(cpmkId);
        if(!cpmkId) return;

        // Cari data CPMK yang dipilih
        const selected = rpsData.cpmk.find((c: any) => c.id === Number(cpmkId));
        if(selected) {
            // Gabungkan kode IK menjadi string
            const ikCodes = selected.ik ? selected.ik.map((i: any) => i.kode_ik).join(", ") : "-";
            
            setPertemuanForm((prev: any) => ({
                ...prev,
                // Auto-fill Sub-CPMK dengan deskripsi CPMK
                kemampuan_akhir: selected.deskripsi,
                // Auto-fill Indikator dengan Kode IK
                kriteria_penilaian: `Indikator: ${ikCodes}. \nBentuk: Tes/Non-Tes.`
            }));
        }
    };

    const openAddPertemuan = () => {
        const nextPekan = rpsData.pertemuan?.length > 0 ? Math.max(...rpsData.pertemuan.map((p: any) => p.pekan_ke)) + 1 : 1;
        setPertemuanForm({ pekan_ke: nextPekan, metode_pembelajaran: "Kuliah & Diskusi", waktu: "TM: 2x50'", bobot_nilai: 0, kemampuan_akhir: "", bahan_kajian: "" });
        setSelectedCpmkId(""); // Reset pilihan
        setIsEditPertemuan(false); setShowPertemuanModal(true);
    };

    const handleSavePertemuan = async () => {
        setIsSaving(true);
        try {
            const url = isEditPertemuan ? `/api/rps/pertemuan/${pertemuanForm.id}` : `/api/rps/pertemuan`;
            const method = isEditPertemuan ? 'PUT' : 'POST';
            const payload = { ...pertemuanForm, rps_id: id_rps, bobot_nilai: Number(pertemuanForm.bobot_nilai), pekan_ke: Number(pertemuanForm.pekan_ke) };

            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            await fetchRPSData();
            setShowPertemuanModal(false);
        } catch (error: any) { alert(`Error: ${error.message}`); } finally { setIsSaving(false); }
    };

    // --- RENDER ---
    if (loading) return <DashboardLayout><div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="p-6 text-red-600 bg-red-50">{error}</div></DashboardLayout>;
    if (!rpsData) return null;

    const totalBobot = rpsData.pertemuan ? rpsData.pertemuan.reduce((acc: number, curr: any) => acc + (curr.bobot_nilai || 0), 0) : 0;

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen print:bg-white print:p-0">
                {/* ... (HEADER, INFO MATKUL, OTORISASI, CPL, CPMK, DESKRIPSI - TETAP SAMA) ... */}
                {/* ... (Langsung ke bagian TAB EVALUASI & PERTEMUAN yang berubah) ... */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden print:border-black print:shadow-none">
                    <SectionHeader title="Rencana Pembelajaran & Evaluasi" icon={<ClipboardList size={16}/>} />
                    
                    {/* TAB NAVIGATION */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                         <button onClick={() => setActiveTab("pertemuan")} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 ${activeTab === "pertemuan" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-600 hover:bg-gray-100"}`}>
                            <Book size={14}/> Rencana Mingguan
                         </button>
                         <button onClick={() => setActiveTab("evaluasi")} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 ${activeTab === "evaluasi" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-600 hover:bg-gray-100"}`}>
                            <GraduationCap size={16}/> Rencana Asesmen / Evaluasi
                         </button>
                    </div>

                    {/* CONTENT TAB PERTEMUAN (SAMA SEPERTI SEBELUMNYA) */}
                    {activeTab === 'pertemuan' && (
                        <div className="p-6">
                            {/* ... (Table Pertemuan Tetap Sama) ... */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                                <table className="w-full text-xs border-collapse border border-gray-300">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="border p-3 w-12 text-center">Mg</th>
                                            <th className="border p-3 w-1/4">Sub-CPMK</th>
                                            <th className="border p-3 w-1/4">Bahan Kajian</th>
                                            <th className="border p-3">Metode</th>
                                            <th className="border p-3 w-16 text-center">Bobot</th>
                                            <th className="border p-3 w-20 text-center print:hidden">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {rpsData.pertemuan.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="border p-3 text-center font-bold">{p.pekan_ke}</td>
                                                <td className="border p-3 whitespace-pre-wrap">{p.kemampuan_akhir}</td>
                                                <td className="border p-3 whitespace-pre-wrap">{p.bahan_kajian}</td>
                                                <td className="border p-3">{p.metode_pembelajaran}</td>
                                                <td className={`border p-3 text-center font-bold ${p.bobot_nilai > 0 ? 'text-green-600 bg-green-50' : 'text-gray-400'}`}>{p.bobot_nilai > 0 ? `${p.bobot_nilai}%` : '-'}</td>
                                                <td className="border p-3 text-center print:hidden">
                                                    {/* Tombol Edit/Delete (Panggil fungsi yg sudah ada) */}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={openAddPertemuan} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm"><Plus size={16}/> Tambah Pertemuan</button>
                        </div>
                    )}

                    {/* CONTENT TAB EVALUASI (BARU) */}
                    {activeTab === 'evaluasi' && (
                        <div className="p-6">
                            <div className="flex gap-6 items-start">
                                {/* Ringkasan Grafik */}
                                <div className="w-1/3 bg-gray-50 p-5 rounded-xl border border-gray-200 text-center">
                                    <PieChart className="mx-auto text-indigo-500 mb-2" size={40}/>
                                    <h4 className="text-gray-600 font-semibold mb-1">Total Bobot Penilaian</h4>
                                    <div className={`text-4xl font-bold ${totalBobot === 100 ? 'text-green-600' : 'text-orange-500'}`}>
                                        {totalBobot}%
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {totalBobot === 100 ? "Sempurna! Bobot sudah mencapai 100%." : "Total bobot harus tepat 100%."}
                                    </p>
                                </div>

                                {/* Tabel Rencana Asesmen */}
                                <div className="w-2/3">
                                    <h4 className="font-bold text-gray-800 mb-3">Daftar Asesmen (Dari Pertemuan)</h4>
                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-indigo-50 text-indigo-900">
                                                <tr>
                                                    <th className="p-3 text-left">Minggu Ke</th>
                                                    <th className="p-3 text-left">Bentuk Evaluasi (Sub-CPMK)</th>
                                                    <th className="p-3 text-center">Bobot</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rpsData.pertemuan.filter((p: any) => p.bobot_nilai > 0).length === 0 && (
                                                    <tr><td colSpan={3} className="p-4 text-center text-gray-400 italic">Belum ada penilaian yang diset (Bobot 0%). Edit pertemuan untuk menambahkan bobot.</td></tr>
                                                )}
                                                {rpsData.pertemuan.filter((p: any) => p.bobot_nilai > 0).map((p: any) => (
                                                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                                        <td className="p-3 font-semibold text-center w-24">Mg {p.pekan_ke}</td>
                                                        <td className="p-3 text-gray-700">{p.kemampuan_akhir}</td>
                                                        <td className="p-3 text-center font-bold text-green-700">{p.bobot_nilai}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                                        * Tips: Untuk menambah evaluasi (UTS/UAS/Tugas), edit "Rencana Pertemuan" di minggu terkait dan isi <b>Bobot Nilai</b>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL PERTEMUAN (UPDATE: DENGAN PILIHAN CPMK) */}
            <Modal isOpen={showPertemuanModal} onClose={() => setShowPertemuanModal(false)} title={isEditPertemuan ? "Edit Pertemuan" : "Tambah Pertemuan Baru"} onSave={handleSavePertemuan} isSaving={isSaving}>
                <div className="space-y-4">
                    
                    {/* BAGIAN ATAS: PILIH CPMK (HELPER) */}
                    {!isEditPertemuan && (
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-2">
                            <label className="block text-xs font-bold text-indigo-700 mb-1 uppercase tracking-wide">Langkah 1: Pilih Target CPMK (Opsional)</label>
                            <select 
                                className="w-full border-indigo-200 rounded p-2 text-sm focus:ring-indigo-500"
                                value={selectedCpmkId}
                                onChange={(e) => handleCpmkSelect(e.target.value)}
                            >
                                <option value="">-- Pilih CPMK untuk Auto-Fill --</option>
                                {rpsData.cpmk && rpsData.cpmk.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.kode_cpmk} - {c.deskripsi.substring(0, 50)}...</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-indigo-500 mt-1">*Memilih ini akan mengisi Sub-CPMK dan Indikator Penilaian otomatis.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Minggu Ke-</label><input type="number" className="w-full border border-gray-300 rounded-lg p-2.5" value={pertemuanForm.pekan_ke || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, pekan_ke: e.target.value})} /></div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Bobot Nilai (%)</label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 bg-yellow-50 focus:bg-white transition" placeholder="0" value={pertemuanForm.bobot_nilai || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, bobot_nilai: e.target.value})} />
                            <p className="text-[10px] text-gray-500">Isi jika ini adalah minggu ujian/tugas.</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-CPMK (Kemampuan Akhir)</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-2.5 h-20" value={pertemuanForm.kemampuan_akhir || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, kemampuan_akhir: e.target.value})} placeholder="Mahasiswa mampu..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Bahan Kajian (Materi)</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-2.5 h-20" value={pertemuanForm.bahan_kajian || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, bahan_kajian: e.target.value})} placeholder="Topik..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Metode Pembelajaran</label><input type="text" className="w-full border border-gray-300 rounded-lg p-2.5" value={pertemuanForm.metode_pembelajaran || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, metode_pembelajaran: e.target.value})} /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Waktu</label><input type="text" className="w-full border border-gray-300 rounded-lg p-2.5" value={pertemuanForm.waktu || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, waktu: e.target.value})} /></div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Indikator Penilaian</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-2.5 h-16" value={pertemuanForm.kriteria_penilaian || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, kriteria_penilaian: e.target.value})} placeholder="Indikator..." />
                    </div>
                </div>
            </Modal>

            {/* (MODAL LAINNYA TETAP SAMA) */}
        </DashboardLayout>
    );
}