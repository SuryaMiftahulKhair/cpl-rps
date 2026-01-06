"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ChevronLeft, Edit, FileText, BookOpen, Users, Target,
    ClipboardList, Loader2, AlertCircle, Printer, Trash2, Copy, Plus, X, Save,
    Book
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- COMPONENTS HELPER ---

// 1. Modal Component (Popup)
function Modal({ isOpen, onClose, title, children, onSave, isSaving }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto grow">
                    {children}
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl shrink-0 sticky bottom-0 z-10">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg">Batal</button>
                    <button 
                        onClick={onSave} 
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}

// 2. Section Header
function SectionHeader({ title, icon, onEdit }: { title: string, icon?: React.ReactNode, onEdit?: () => void }) {
    return (
        <div className="flex items-center justify-between bg-slate-600 text-white px-4 py-3 rounded-t-lg print:bg-white print:text-black print:border-b print:border-black">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
                {icon} {title}
            </h3>
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

    // State Modal Pertemuan (BARU)
    const [showPertemuanModal, setShowPertemuanModal] = useState(false);
    const [pertemuanForm, setPertemuanForm] = useState<any>({});
    const [isEditPertemuan, setIsEditPertemuan] = useState(false);

    // --- FETCH DATA ---
    const fetchRPSData = async () => {
        try {
            const res = await fetch(`/api/rps/${id_rps}`);
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            const json = await res.json();
            if (json.success) {
                setRpsData(json.data);
            } else {
                throw new Error(json.error || "Gagal memuat data");
            }
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRPSData();
    }, [id_rps]);

    // --- HANDLERS (SAVE GENERAL) ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/rps/${id_rps}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: editingSection, data: formData })
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.error || "Gagal update");

            await fetchRPSData(); 
            setEditingSection(null);
        } catch (error: any) {
            alert(`Gagal menyimpan: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- HANDLERS (PERTEMUAN) ---
    const openAddPertemuan = () => {
        // Auto increment minggu ke-
        const nextPekan = rpsData.pertemuan && rpsData.pertemuan.length > 0 
            ? Math.max(...rpsData.pertemuan.map((p: any) => p.pekan_ke)) + 1 
            : 1;
            
        setPertemuanForm({
            pekan_ke: nextPekan,
            kemampuan_akhir: "",
            bahan_kajian: "",
            metode_pembelajaran: "Kuliah & Diskusi",
            waktu: "TM: 2x50'",
            pengalaman_belajar: "",
            kriteria_penilaian: "",
            bobot_nilai: 0
        });
        setIsEditPertemuan(false);
        setShowPertemuanModal(true);
    };

    const openEditPertemuan = (pertemuan: any) => {
        setPertemuanForm({ ...pertemuan });
        setIsEditPertemuan(true);
        setShowPertemuanModal(true);
    };

    const handleSavePertemuan = async () => {
        setIsSaving(true);
        try {
            const url = isEditPertemuan 
                ? `/api/rps/pertemuan/${pertemuanForm.id}` // Perlu API PUT
                : `/api/rps/pertemuan`; // Perlu API POST
            
            const method = isEditPertemuan ? 'PUT' : 'POST';
            
            // Siapkan payload
            const payload = {
                ...pertemuanForm,
                rps_id: id_rps, // Penting untuk Create
                bobot_nilai: Number(pertemuanForm.bobot_nilai),
                pekan_ke: Number(pertemuanForm.pekan_ke)
            };

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.error || "Gagal menyimpan pertemuan");

            await fetchRPSData(); // Refresh list pertemuan
            setShowPertemuanModal(false);
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePertemuan = async (pertemuanId: number) => {
        if (!confirm("Hapus pertemuan ini? Data yang dihapus tidak bisa dikembalikan.")) return;
        try {
            const res = await fetch(`/api/rps/pertemuan/${pertemuanId}`, { method: 'DELETE' });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            await fetchRPSData();
        } catch (error: any) {
            alert(`Gagal menghapus: ${error.message}`);
        }
    };

    const handleDuplicatePertemuan = async (pertemuan: any) => {
        if (!confirm(`Duplikat pertemuan Minggu ke-${pertemuan.pekan_ke}?`)) return;
        
        const nextPekan = Math.max(...rpsData.pertemuan.map((p: any) => p.pekan_ke)) + 1;
        const newForm = { ...pertemuan, pekan_ke: nextPekan, rps_id: id_rps };
        delete newForm.id; 

        try {
            const res = await fetch(`/api/rps/pertemuan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newForm)
            });
            await fetchRPSData();
        } catch (error: any) {
            alert(`Gagal duplikat: ${error.message}`);
        }
    }

    // --- OPEN MODAL GENERAL HANDLERS ---
    const openEditOtorisasi = () => {
        setFormData({
            penyusun: rpsData.otorisasi.penyusun,
            koordinator: rpsData.otorisasi.koordinator,
            kaprodi: rpsData.otorisasi.kaprodi
        });
        setEditingSection('otorisasi');
    };
    const openEditDeskripsi = () => { setFormData(rpsData.deskripsi || ""); setEditingSection('deskripsi'); };
    const openEditMateri = () => { setFormData(rpsData.materi_pembelajaran || ""); setEditingSection('materi'); };
    const openEditPustaka = () => {
        setFormData({
            utama: rpsData.pustaka_utama || "",
            pendukung: rpsData.pustaka_pendukung || ""
        });
        setEditingSection('pustaka');
    };

    // --- OTHER HANDLERS ---
    const handleExportPDF = (lang: 'id' | 'en') => {
        window.open(`/api/rps/${id_rps}/export/pdf?lang=${lang}`, '_blank');
    };

    if (loading) return <DashboardLayout><div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="p-6 text-red-600 bg-red-50 m-6 rounded-lg border border-red-200">Error: {error}</div></DashboardLayout>;
    if (!rpsData) return null;

    const matkul = {
        nama: rpsData.nama_mk,
        kode: rpsData.kode_mk,
        sks: rpsData.sks,
        semester: rpsData.semester,
        sifat: rpsData.sifat,
        tanggal: new Date(rpsData.otorisasi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen print:bg-white print:p-0">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <div>
                        <Link href={`/rps/${id}/list/${id_matakuliah}`} className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-1">
                            <ChevronLeft size={16} /> Kembali ke List
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">Detail RPS</h1>
                        <p className="text-sm text-gray-500">{matkul.kode} • {matkul.nama}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="bg-gray-700 text-white px-4 py-2 rounded-lg flex gap-2 text-sm font-medium hover:bg-gray-800 transition-colors shadow">
                            <Printer size={16} /> Print
                        </button>
                    </div>
                </div>

                {/* INFO MATKUL */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 print:border-black print:shadow-none">
                    <div className="grid grid-cols-2 gap-6 p-6">
                        <div className="space-y-2">
                            <InfoRow label="MATA KULIAH" value={matkul.nama} />
                            <InfoRow label="KODE" value={matkul.kode} />
                            <InfoRow label="RUMPUN MK" value={matkul.sifat || "Wajib"} />
                        </div>
                        <div className="space-y-2">
                            <InfoRow label="BOBOT (SKS)" value={matkul.sks} />
                            <InfoRow label="SEMESTER" value={matkul.semester} />
                            <InfoRow label="TANGGAL" value={matkul.tanggal} />
                        </div>
                    </div>
                </div>

                {/* OTORISASI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden print:border-black print:shadow-none">
                    <SectionHeader title="Otorisasi" onEdit={openEditOtorisasi} />
                    <div className="p-6 grid grid-cols-3 gap-6 text-center">
                        {[
                            { title: "Pengembang RPS", nama: rpsData.otorisasi.penyusun },
                            { title: "Koordinator MK", nama: rpsData.otorisasi.koordinator },
                            { title: "Ketua Program Studi", nama: rpsData.otorisasi.kaprodi }
                        ].map((p, i) => (
                            <div key={i} className="border p-4 rounded print:border-black bg-gray-50/50 print:bg-white">
                                <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider font-semibold">{p.title}</p>
                                <div className="h-16"></div> 
                                <p className="font-bold underline text-gray-800">{p.nama}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CPL */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden print:border-black print:shadow-none">
                    <SectionHeader title="Capaian Pembelajaran (CPL-PRODI)" icon={<Target size={16}/>} />
                    <div className="p-6">
                        {rpsData.cpl_prodi.length > 0 ? (
                            <table className="w-full text-sm border border-gray-200 print:border-black">
                                <tbody>
                                    {rpsData.cpl_prodi.map((c: any, i: number) => (
                                        <tr key={i} className="border-b border-gray-200 print:border-black last:border-0">
                                            <td className="p-3 font-bold w-24 align-top bg-gray-50 print:bg-white border-r text-indigo-700">{c.kode}</td>
                                            <td className="p-3 align-top text-gray-700">{c.deskripsi}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="text-gray-500 italic text-center">Belum ada CPL yang dipetakan dari Kurikulum.</p>}
                    </div>
                </div>

                {/* DESKRIPSI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden print:border-black print:shadow-none print:break-inside-avoid">
                    <SectionHeader title="Deskripsi Mata Kuliah" onEdit={openEditDeskripsi} />
                    <div className="p-6 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {rpsData.deskripsi || <span className="text-gray-400 italic">Belum diisi. Klik icon pensil untuk mengisi deskripsi mata kuliah.</span>}
                    </div>
                </div>

                {/* MATERI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden print:border-black print:shadow-none print:break-inside-avoid">
                    <SectionHeader title="Materi Pembelajaran" icon={<BookOpen size={16}/>} onEdit={openEditMateri} />
                    <div className="p-6 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {rpsData.materi_pembelajaran || <span className="text-gray-400 italic">Belum diisi. Klik icon pensil untuk mengisi materi pembelajaran.</span>}
                    </div>
                </div>

                {/* PUSTAKA */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden print:border-black print:shadow-none print:break-inside-avoid">
                    <SectionHeader title="Pustaka / Referensi" icon={<Book size={16}/>} onEdit={openEditPustaka} />
                    <div className="p-6 text-sm text-gray-800 grid gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:p-0">
                            <strong className="block text-indigo-700 mb-2 font-semibold">Utama:</strong>
                            <p className="whitespace-pre-wrap pl-4 border-l-2 border-indigo-200">
                                {rpsData.pustaka_utama || <span className="text-gray-400 italic">Belum ada referensi utama.</span>}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:p-0">
                            <strong className="block text-indigo-700 mb-2 font-semibold">Pendukung:</strong>
                            <p className="whitespace-pre-wrap pl-4 border-l-2 border-indigo-200">
                                {rpsData.pustaka_pendukung || <span className="text-gray-400 italic">Belum ada referensi pendukung.</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {/* TABEL PERTEMUAN */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden print:border-black print:shadow-none">
                    <SectionHeader title="Rencana Pembelajaran Mingguan" icon={<ClipboardList size={16}/>} />
                    <div className="flex border-b border-gray-200 print:hidden bg-gray-50">
                         <button onClick={() => setActiveTab("pertemuan")} className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "pertemuan" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-600 hover:bg-gray-100"}`}>Rencana Pertemuan</button>
                         <button onClick={() => setActiveTab("evaluasi")} className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "evaluasi" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-600 hover:bg-gray-100"}`}>Evaluasi</button>
                    </div>

                    {activeTab === 'pertemuan' && (
                        <div className="p-6">
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-xs border-collapse border border-gray-300 print:border-black">
                                    <thead className="bg-gray-100 print:bg-gray-200 text-gray-700">
                                        <tr>
                                            <th className="border p-3 w-12 text-center font-bold">Mg</th>
                                            <th className="border p-3 text-left font-bold w-1/4">Sub-CPMK (Kemampuan Akhir)</th>
                                            <th className="border p-3 text-left font-bold w-1/4">Bahan Kajian (Materi)</th>
                                            <th className="border p-3 text-left font-bold">Metode Pembelajaran</th>
                                            <th className="border p-3 w-16 text-center font-bold">Bobot</th>
                                            <th className="border p-3 w-20 text-center print:hidden font-bold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {rpsData.pertemuan.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-50 print:break-inside-avoid">
                                                <td className="border p-3 text-center font-bold align-top bg-gray-50/30">{p.pekan_ke}</td>
                                                <td className="border p-3 align-top">{p.kemampuan_akhir || "-"}</td>
                                                <td className="border p-3 align-top whitespace-pre-wrap">{p.bahan_kajian || "-"}</td>
                                                <td className="border p-3 align-top">
                                                    <div className="font-semibold text-indigo-700 mb-1">Metode:</div>{p.metode_pembelajaran || "-"}
                                                    <div className="mt-1 text-gray-500 text-[10px]">Waktu: {p.waktu}</div>
                                                </td>
                                                <td className="border p-3 text-center align-top font-semibold">{p.bobot_nilai}%</td>
                                                <td className="border p-3 text-center print:hidden align-top">
                                                    <div className="flex flex-col gap-2">
                                                        <button onClick={() => openEditPertemuan(p)} className="flex items-center justify-center gap-1 bg-cyan-100 text-cyan-700 p-1.5 rounded hover:bg-cyan-200 transition-colors" title="Edit Pertemuan"><Edit size={14}/></button>
                                                        <button onClick={() => handleDuplicatePertemuan(p)} className="flex items-center justify-center gap-1 bg-orange-100 text-orange-700 p-1.5 rounded hover:bg-orange-200 transition-colors" title="Duplikat Pertemuan"><Copy size={14}/></button>
                                                        <button onClick={() => handleDeletePertemuan(p.id)} className="flex items-center justify-center gap-1 bg-red-100 text-red-700 p-1.5 rounded hover:bg-red-200 transition-colors" title="Hapus Pertemuan"><Trash2 size={14}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 print:hidden flex justify-between items-center">
                                <p className="text-sm text-gray-500">Total: {rpsData.pertemuan.length} pertemuan</p>
                                <button onClick={openAddPertemuan} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm transition-all"><Plus size={16}/> Tambah Pertemuan</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center text-xs text-gray-400 mt-8 pb-8 print:hidden">
                    RPS ID: {rpsData.id} • Dibuat pada: {new Date(rpsData.created_at).toLocaleString('id-ID')}
                </div>
            </div>

            {/* --- MODALS SECTION --- */}
            
            <Modal isOpen={editingSection === 'otorisasi'} onClose={() => setEditingSection(null)} title="Edit Otorisasi" onSave={handleSave} isSaving={isSaving}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold mb-1">Pengembang RPS</label><input type="text" className="w-full border rounded p-2" value={formData.penyusun || ''} onChange={(e) => setFormData({...formData, penyusun: e.target.value})} /></div>
                    <div><label className="block text-sm font-semibold mb-1">Koordinator MK</label><input type="text" className="w-full border rounded p-2" value={formData.koordinator || ''} onChange={(e) => setFormData({...formData, koordinator: e.target.value})} /></div>
                    <div><label className="block text-sm font-semibold mb-1">Ketua Prodi</label><input type="text" className="w-full border rounded p-2" value={formData.kaprodi || ''} onChange={(e) => setFormData({...formData, kaprodi: e.target.value})} /></div>
                </div>
            </Modal>
            <Modal isOpen={editingSection === 'deskripsi'} onClose={() => setEditingSection(null)} title="Edit Deskripsi" onSave={handleSave} isSaving={isSaving}>
                <textarea className="w-full border rounded p-3 h-64" value={formData} onChange={(e) => setFormData(e.target.value)}></textarea>
            </Modal>
            <Modal isOpen={editingSection === 'materi'} onClose={() => setEditingSection(null)} title="Edit Materi" onSave={handleSave} isSaving={isSaving}>
                <textarea className="w-full border rounded p-3 h-64" value={formData} onChange={(e) => setFormData(e.target.value)}></textarea>
            </Modal>
            <Modal isOpen={editingSection === 'pustaka'} onClose={() => setEditingSection(null)} title="Edit Pustaka" onSave={handleSave} isSaving={isSaving}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold mb-1">Utama</label><textarea className="w-full border rounded p-2 h-32" value={formData.utama || ''} onChange={(e) => setFormData({...formData, utama: e.target.value})} /></div>
                    <div><label className="block text-sm font-semibold mb-1">Pendukung</label><textarea className="w-full border rounded p-2 h-32" value={formData.pendukung || ''} onChange={(e) => setFormData({...formData, pendukung: e.target.value})} /></div>
                </div>
            </Modal>

            {/* --- MODAL KHUSUS PERTEMUAN (BARU DI SINI) --- */}
            <Modal isOpen={showPertemuanModal} onClose={() => setShowPertemuanModal(false)} title={isEditPertemuan ? "Edit Pertemuan" : "Tambah Pertemuan Baru"} onSave={handleSavePertemuan} isSaving={isSaving}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Minggu Ke-</label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5" value={pertemuanForm.pekan_ke || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, pekan_ke: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Bobot Nilai (%)</label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5" value={pertemuanForm.bobot_nilai || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, bobot_nilai: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-CPMK (Kemampuan Akhir)</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-2.5 h-20" value={pertemuanForm.kemampuan_akhir || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, kemampuan_akhir: e.target.value})} placeholder="Mahasiswa mampu..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Bahan Kajian (Materi)</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-2.5 h-20" value={pertemuanForm.bahan_kajian || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, bahan_kajian: e.target.value})} placeholder="Topik bahasan..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Metode Pembelajaran</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5" value={pertemuanForm.metode_pembelajaran || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, metode_pembelajaran: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu (Menit)</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5" value={pertemuanForm.waktu || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, waktu: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Indikator Penilaian</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-2.5 h-16" value={pertemuanForm.kriteria_penilaian || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, kriteria_penilaian: e.target.value})} />
                    </div>
                </div>
            </Modal>

        </DashboardLayout>
    );
}