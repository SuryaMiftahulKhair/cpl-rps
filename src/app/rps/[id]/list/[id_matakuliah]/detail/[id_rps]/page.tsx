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

// --- KOMPONEN HELPER ---

function Modal({ isOpen, onClose, title, children, onSave, isSaving }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <button title="Tutup" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto grow">{children}</div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl shrink-0 sticky bottom-0 z-10">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg">Batal</button>
                    <button onClick={onSave} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-50">
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, icon, onEdit, action }: any) {
    return (
        <div className="flex items-center justify-between bg-slate-600 text-white px-4 py-3 rounded-t-lg print:bg-white print:text-black print:border-b print:border-black">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide">{icon} {title}</h3>
            <div className="flex items-center gap-2">{action}{onEdit && <button title="Edit" onClick={onEdit} className="p-1.5 hover:bg-slate-700 rounded print:hidden"><Edit size={16}/></button>}</div>
        </div>
    );
}

function InfoRow({ label, value }: any) {
    return <div className="flex py-2 border-b border-gray-100"><div className="w-1/3 font-semibold text-gray-700 text-sm">{label}</div><div className="w-2/3 text-gray-800 text-sm">{value}</div></div>;
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

    // State Modals
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    
    const [showPertemuanModal, setShowPertemuanModal] = useState(false);
    const [pertemuanForm, setPertemuanForm] = useState<any>({});
    const [isEditPertemuan, setIsEditPertemuan] = useState(false);
    const [selectedCpmkId, setSelectedCpmkId] = useState<string>(""); 

    const [showCpmkModal, setShowCpmkModal] = useState(false);
    const [cpmkForm, setCpmkForm] = useState<any>({ kode: "", deskripsi: "", ik_id: "" });

    // --- FETCH DATA ---
    const fetchRPSData = async () => {
        try {
            const res = await fetch(`/api/rps/${id_rps}`); 
            const json = await res.json();
            if (json.success) setRpsData(json.data);
            else throw new Error(json.error);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRPSData(); }, [id_rps]);

    // --- LOGIC CPMK (SINGLE IK) ---
    const openAddCpmk = () => {
        const nextNo = rpsData.cpmk ? rpsData.cpmk.length + 1 : 1;
        setCpmkForm({ kode: `CPMK-${nextNo}`, deskripsi: "", ik_id: "" });
        setShowCpmkModal(true);
    };

    const handleSaveCpmk = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/rps/cpmk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rps_id: Number(id_rps),
                    kode_cpmk: cpmkForm.kode,
                    deskripsi: cpmkForm.deskripsi,
                    ik_id: cpmkForm.ik_id // Kirim Single ID
                })
            });
            if (res.ok) { await fetchRPSData(); setShowCpmkModal(false); } 
            else alert("Gagal simpan CPMK");
        } catch (e) { alert("Error sistem"); } finally { setIsSaving(false); }
    };

    const handleDeleteCpmk = async (id: number) => {
        if(!confirm("Hapus CPMK ini?")) return;
        alert("Fitur hapus CPMK akan segera aktif."); 
    };

    // --- LOGIC PERTEMUAN (AUTO FILL DARI CPMK & IK) ---
    const handleCpmkSelectForPertemuan = (cpmkId: string) => {
        setSelectedCpmkId(cpmkId);
        if(!cpmkId) return;

        const selected = rpsData.cpmk.find((c: any) => c.id === Number(cpmkId));
        if(selected) {
            // Ambil IK tunggal dari CPMK tersebut
            const ikInfo = selected.ik && selected.ik.length > 0 
                ? `[${selected.ik[0].kode_ik}] ${selected.ik[0].deskripsi}` 
                : "Belum ada IK diset";

            setPertemuanForm((prev: any) => ({
                ...prev,
                kemampuan_akhir: selected.deskripsi, // Sub-CPMK = Deskripsi CPMK
                kriteria_penilaian: ikInfo // Indikator = IK dari CPMK tersebut
            }));
        }
    };

    const openAddPertemuan = () => {
        const nextPekan = rpsData.pertemuan?.length > 0 ? Math.max(...rpsData.pertemuan.map((p: any) => p.pekan_ke)) + 1 : 1;
        setPertemuanForm({ pekan_ke: nextPekan, metode_pembelajaran: "Kuliah & Diskusi", waktu: "TM: 2x50'", bobot_nilai: 0, kemampuan_akhir: "", kriteria_penilaian: "" });
        setSelectedCpmkId(""); 
        setIsEditPertemuan(false); setShowPertemuanModal(true);
    };

    const handleSavePertemuan = async () => {
        setIsSaving(true);
        try {
            const url = isEditPertemuan ? `/api/rps/pertemuan/${pertemuanForm.id}` : `/api/rps/pertemuan`;
            const method = isEditPertemuan ? 'PUT' : 'POST';
            const payload = { ...pertemuanForm, rps_id: Number(id_rps), bobot_nilai: Number(pertemuanForm.bobot_nilai), pekan_ke: Number(pertemuanForm.pekan_ke) };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            await fetchRPSData();
            setShowPertemuanModal(false);
        } catch (error: any) { alert(`Error: ${error.message}`); } finally { setIsSaving(false); }
    };

    // --- LOGIC SAVE GENERAL ---
    const openEditOtorisasi = () => { 
        setFormData({
            penyusun: rpsData.otorisasi?.penyusun || rpsData.nama_penyusun,
            koordinator: rpsData.otorisasi?.koordinator || rpsData.nama_koordinator,
            kaprodi: rpsData.otorisasi?.kaprodi || rpsData.nama_kaprodi
        }); 
        setEditingSection('otorisasi'); 
    };
    const openEditDeskripsi = () => { setFormData(rpsData.deskripsi || ""); setEditingSection('deskripsi'); };
    const openEditMateri = () => { setFormData(rpsData.materi_pembelajaran || ""); setEditingSection('materi'); };
    const openEditPustaka = () => { setFormData({ utama: rpsData.pustaka_utama, pendukung: rpsData.pustaka_pendukung }); setEditingSection('pustaka'); };

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/rps/${id_rps}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: editingSection, data: formData })
            });
            if (res.ok) { await fetchRPSData(); setEditingSection(null); }
        } catch (error: any) { alert(`Gagal: ${error.message}`); } finally { setIsSaving(false); }
    };

    if (loading) return <DashboardLayout><div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="p-6 text-red-600 bg-red-50">{error}</div></DashboardLayout>;
    if (!rpsData) return null;

    const matkul = rpsData.matakuliah || {};
    const totalBobot = rpsData.pertemuan ? rpsData.pertemuan.reduce((acc: number, curr: any) => acc + (curr.bobot_nilai || 0), 0) : 0;

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* HEADER & INFO MATKUL */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Detail RPS: {matkul.nama}</h1>
                    <button onClick={() => window.print()} className="bg-gray-700 text-white px-4 py-2 rounded flex gap-2"><Printer size={16}/> Print</button>
                </div>

                {/* INFO MATKUL TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="grid grid-cols-2 gap-6 p-6">
                        <div className="space-y-2">
                            <InfoRow label="MATA KULIAH" value={matkul.nama} />
                            <InfoRow label="KODE" value={matkul.kode_mk} />
                            <InfoRow label="RUMPUN MK" value={matkul.sifat || "Wajib"} />
                        </div>
                        <div className="space-y-2">
                            <InfoRow label="BOBOT (SKS)" value={matkul.sks} />
                            <InfoRow label="SEMESTER" value={matkul.semester} />
                            <InfoRow label="TANGGAL" value={rpsData.otorisasi?.tanggal ? new Date(rpsData.otorisasi.tanggal).toLocaleDateString('id-ID') : '-'} />
                        </div>
                    </div>
                </div>

                {/* OTORISASI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Otorisasi (Koordinator & Kaprodi)" onEdit={openEditOtorisasi} />
                    <div className="p-6 grid grid-cols-3 gap-6 text-center">
                        {[
                            { title: "Pengembang RPS", nama: rpsData.otorisasi?.penyusun || rpsData.nama_penyusun || "-" },
                            { title: "Koordinator MK", nama: rpsData.otorisasi?.koordinator || rpsData.nama_koordinator || "-" },
                            { title: "Ketua Program Studi", nama: rpsData.otorisasi?.kaprodi || rpsData.nama_kaprodi || "-" }
                        ].map((p, i) => (
                            <div key={i} className="border p-4 rounded bg-gray-50/50">
                                <p className="text-xs text-gray-500 mb-6 uppercase font-bold">{p.title}</p>
                                <div className="h-10"></div> 
                                <p className="font-bold underline text-gray-800">{p.nama}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CPL (Tabel Capaian Pembelajaran Lulusan) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Capaian Pembelajaran Lulusan (CPL)" icon={<Target size={16}/>} />
                    <div className="p-6">
                        {(!matkul.cpl || matkul.cpl.length === 0) ? (
                            <p className="text-gray-500 italic text-center">Belum ada CPL yang dipetakan.</p>
                        ) : (
                            <table className="w-full text-sm border border-gray-200">
                                <tbody className="divide-y divide-gray-100">
                                    {matkul.cpl.map((cpl: any) => (
                                        <tr key={cpl.id} className="hover:bg-gray-50">
                                            <td className="p-3 w-24 font-bold bg-gray-50 border-r border-gray-200">{cpl.kode_cpl}</td>
                                            <td className="p-3">{cpl.deskripsi}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* CPMK */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="CPMK & Referensi IK" icon={<Target size={16}/>} 
                        action={<button onClick={openAddCpmk} className="bg-teal-600 text-white px-2 py-1 rounded text-xs flex gap-1"><Plus size={14}/> Tambah</button>}
                    />
                    <div className="p-6 grid gap-4">
                        {rpsData.cpmk?.map((item: any) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex justify-between font-bold text-indigo-700 mb-2">
                                    <span>{item.kode_cpmk}</span>
                                    {/* Tombol hapus */}
                                </div>
                                <p className="text-sm text-gray-800 mb-2">{item.deskripsi}</p>
                                <div className="text-xs bg-yellow-50 p-2 rounded border border-yellow-100 text-yellow-800">
                                    <strong>IK Referensi: </strong>
                                    {item.ik && item.ik.length > 0 ? (
                                        <span>[{item.ik[0].kode_ik}] {item.ik[0].deskripsi}</span>
                                    ) : "-"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DESKRIPSI, MATERI, PUSTAKA */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Deskripsi MK" onEdit={openEditDeskripsi} />
                    <div className="p-6 text-sm whitespace-pre-wrap">{rpsData.deskripsi || "-"}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Materi Pembelajaran" onEdit={openEditMateri} />
                    <div className="p-6 text-sm whitespace-pre-wrap">{rpsData.materi_pembelajaran || "-"}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Pustaka" onEdit={openEditPustaka} />
                    <div className="p-6 text-sm grid gap-4">
                        <div><strong>Utama:</strong><p className="whitespace-pre-wrap pl-2 border-l-2">{rpsData.pustaka_utama || "-"}</p></div>
                        <div><strong>Pendukung:</strong><p className="whitespace-pre-wrap pl-2 border-l-2">{rpsData.pustaka_pendukung || "-"}</p></div>
                    </div>
                </div>

                {/* PERTEMUAN & EVALUASI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Rencana Pembelajaran & Evaluasi" icon={<ClipboardList size={16}/>} />
                    
                    <div className="flex border-b border-gray-200 bg-gray-50">
                         <button onClick={() => setActiveTab("pertemuan")} className={`px-6 py-3 text-sm font-semibold ${activeTab === "pertemuan" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-600"}`}>Rencana Mingguan</button>
                         <button onClick={() => setActiveTab("evaluasi")} className={`px-6 py-3 text-sm font-semibold ${activeTab === "evaluasi" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-600"}`}>Evaluasi</button>
                    </div>

                    {activeTab === 'pertemuan' && (
                        <div className="p-6">
                            <table className="w-full text-xs border-collapse border border-gray-200 mb-4">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2 w-10">Mg</th>
                                        <th className="border p-2">Sub-CPMK</th>
                                        <th className="border p-2">Indikator</th>
                                        <th className="border p-2">Metode</th>
                                        <th className="border p-2">Bobot</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rpsData.pertemuan?.map((p: any) => (
                                        <tr key={p.id}>
                                            <td className="border p-2 text-center">{p.pekan_ke}</td>
                                            <td className="border p-2">{p.kemampuan_akhir}</td>
                                            <td className="border p-2 bg-yellow-50/50">{p.kriteria_penilaian}</td>
                                            <td className="border p-2">{p.metode_pembelajaran}</td>
                                            <td className="border p-2 text-center">{p.bobot_nilai}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={openAddPertemuan} className="bg-green-600 text-white px-4 py-2 rounded text-sm flex gap-2"><Plus size={16}/> Tambah Pertemuan</button>
                        </div>
                    )}

                    {activeTab === 'evaluasi' && (
                        <div className="p-6 flex gap-6">
                            <div className="w-1/3 bg-gray-50 p-5 rounded-xl text-center border">
                                <PieChart className="mx-auto text-indigo-500 mb-2" size={40}/>
                                <div className={`text-4xl font-bold ${totalBobot === 100 ? 'text-green-600' : 'text-orange-500'}`}>{totalBobot}%</div>
                                <p className="text-xs text-gray-500">Total Bobot Penilaian</p>
                            </div>
                            <div className="w-2/3">
                                <h4 className="font-bold mb-2">List Evaluasi</h4>
                                <ul className="text-sm border rounded divide-y">
                                    {rpsData.pertemuan?.filter((p:any) => p.bobot_nilai > 0).map((p:any) => (
                                        <li key={p.id} className="p-2 flex justify-between">
                                            <span>Minggu {p.pekan_ke}: {p.kemampuan_akhir}</span>
                                            <span className="font-bold">{p.bobot_nilai}%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            {/* Modal Otorisasi */}
            <Modal isOpen={editingSection === 'otorisasi'} onClose={() => setEditingSection(null)} title="Edit Otorisasi" onSave={handleSaveGeneral} isSaving={isSaving}>
                <div className="space-y-3">
                    <input className="w-full border p-2 rounded" placeholder="Nama Penyusun" value={formData.penyusun || ''} onChange={(e) => setFormData({...formData, penyusun: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Nama Koordinator" value={formData.koordinator || ''} onChange={(e) => setFormData({...formData, koordinator: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Nama Kaprodi" value={formData.kaprodi || ''} onChange={(e) => setFormData({...formData, kaprodi: e.target.value})} />
                </div>
            </Modal>

            {/* Modal Deskripsi, Materi, Pustaka */}
            <Modal isOpen={editingSection === 'deskripsi'} onClose={() => setEditingSection(null)} title="Edit Deskripsi" onSave={handleSaveGeneral} isSaving={isSaving}>
                <textarea className="w-full border p-2 h-40" value={formData} onChange={(e) => setFormData(e.target.value)} />
            </Modal>
            <Modal isOpen={editingSection === 'materi'} onClose={() => setEditingSection(null)} title="Edit Materi" onSave={handleSaveGeneral} isSaving={isSaving}>
                <textarea className="w-full border p-2 h-40" value={formData} onChange={(e) => setFormData(e.target.value)} />
            </Modal>
            <Modal isOpen={editingSection === 'pustaka'} onClose={() => setEditingSection(null)} title="Edit Pustaka" onSave={handleSaveGeneral} isSaving={isSaving}>
                <div className="space-y-3">
                    <div><label className="text-xs font-bold">Utama</label><textarea className="w-full border p-2 h-20" value={formData.utama || ''} onChange={(e) => setFormData({...formData, utama: e.target.value})} /></div>
                    <div><label className="text-xs font-bold">Pendukung</label><textarea className="w-full border p-2 h-20" value={formData.pendukung || ''} onChange={(e) => setFormData({...formData, pendukung: e.target.value})} /></div>
                </div>
            </Modal>

            {/* Modal CPMK (RADIO BUTTON - SINGLE IK) */}
            <Modal isOpen={showCpmkModal} onClose={() => setShowCpmkModal(false)} title="Tambah CPMK (Pilih 1 IK)" onSave={handleSaveCpmk} isSaving={isSaving}>
                <div className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Kode (CPMK-1)" value={cpmkForm.kode} onChange={(e) => setCpmkForm({...cpmkForm, kode: e.target.value})} />
                    <textarea className="w-full border p-2 h-20" placeholder="Deskripsi..." value={cpmkForm.deskripsi} onChange={(e) => setCpmkForm({...cpmkForm, deskripsi: e.target.value})} />
                    
                    <div className="border p-3 rounded bg-gray-50">
                        <p className="text-xs font-bold mb-2 text-indigo-700 uppercase">Pilih 1 Indikator Kinerja (IK):</p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {rpsData.available_iks?.map((ik: any) => (
                                <label key={ik.id} className="flex items-start gap-2 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200">
                                    <input 
                                        type="radio" 
                                        name="ik_selection" 
                                        className="mt-1"
                                        checked={String(cpmkForm.ik_id) === String(ik.id)}
                                        onChange={() => setCpmkForm({...cpmkForm, ik_id: ik.id})} 
                                    />
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-800">[{ik.cpl_kode}] {ik.kode}</span>
                                        <span className="text-gray-500 text-xs ml-1 block">{ik.deskripsi}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal Pertemuan (AUTO FILL CPMK) */}
            <Modal isOpen={showPertemuanModal} onClose={() => setShowPertemuanModal(false)} title="Tambah Pertemuan" onSave={handleSavePertemuan} isSaving={isSaving}>
                <div className="space-y-4">
                    <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                        <label className="block text-xs font-bold text-indigo-700 mb-1">PILIH CPMK (Otomatis isi Indikator)</label>
                        <select className="w-full border p-2 rounded text-sm" value={selectedCpmkId} onChange={(e) => handleCpmkSelectForPertemuan(e.target.value)}>
                            <option value="">-- Pilih --</option>
                            {rpsData.cpmk?.map((c: any) => <option key={c.id} value={c.id}>{c.kode_cpmk} - {c.deskripsi.substring(0, 40)}...</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold">Pekan Ke</label><input type="number" className="w-full border p-2 rounded" value={pertemuanForm.pekan_ke || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, pekan_ke: e.target.value})} /></div>
                        <div><label className="text-xs font-bold">Bobot (%)</label><input type="number" className="w-full border p-2 rounded" value={pertemuanForm.bobot_nilai || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, bobot_nilai: e.target.value})} /></div>
                    </div>
                    <div><label className="text-xs font-bold">Sub-CPMK (Kemampuan Akhir)</label><textarea className="w-full border p-2 h-16" value={pertemuanForm.kemampuan_akhir || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, kemampuan_akhir: e.target.value})} /></div>
                    <div><label className="text-xs font-bold">Indikator Penilaian (Sesuai IK)</label><textarea className="w-full border p-2 h-16 bg-gray-50" value={pertemuanForm.kriteria_penilaian || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, kriteria_penilaian: e.target.value})} /></div>
                    <div><label className="text-xs font-bold">Bahan Kajian</label><textarea className="w-full border p-2 h-16" value={pertemuanForm.bahan_kajian || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, bahan_kajian: e.target.value})} /></div>
                    <div><label className="text-xs font-bold">Metode</label><input className="w-full border p-2 rounded" value={pertemuanForm.metode_pembelajaran || ''} onChange={(e) => setPertemuanForm({...pertemuanForm, metode_pembelajaran: e.target.value})} /></div>
                </div>
            </Modal>

        </DashboardLayout>
    );
}