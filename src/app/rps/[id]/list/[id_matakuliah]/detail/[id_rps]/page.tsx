"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
    Edit, Target, Loader2, Plus, X, Save,
    CheckSquare, PieChart, FileDown, ArrowLeft,
    ScrollText, Info
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- KOMPONEN HELPER ---
function InfoRow({ label, value }: any) {
    return (
        <div className="flex py-3 border-b border-gray-100 last:border-0">
            <div className="w-1/3 font-bold text-gray-500 text-[10px] uppercase tracking-wider">{label}</div>
            <div className="w-2/3 text-gray-800 text-sm font-semibold">{value || "-"}</div>
        </div>
    );
}

function SectionWrapper({ title, icon, action, children, bgColor = "bg-slate-700" }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className={`${bgColor} text-white px-6 py-4 flex justify-between items-center`}>
                <h3 className="font-bold text-sm flex items-center gap-3 uppercase tracking-widest">
                    {icon} {title}
                </h3>
                {action}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function Modal({ isOpen, onClose, title, children, onSave, isSaving }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b shrink-0 bg-white">
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <button title="Buka" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto grow bg-white">{children}</div>
                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg">Batal</button>
                    <button onClick={onSave} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Simpan Data
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---
export default function DetailRPSPage({ params }: { params: Promise<{ id_rps: string }> }) {
    const { id_rps } = use(params);
    const router = useRouter();
    
    const [rpsData, setRpsData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal Visibility
    const [showCpmkModal, setShowCpmkModal] = useState(false);
    const [showPertemuanModal, setShowPertemuanModal] = useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    
    // Form States
    const [cpmkForm, setCpmkForm] = useState({ kode: "", deskripsi: "", ik_id: "" });
    const [pertemuanForm, setPertemuanForm] = useState<any>({ pekan_ke: "1", bobot_nilai: 0, cpmk_id: "", kemampuan_akhir: "", kriteria_penilaian: "", metode_pembelajaran: "" });
    const [otorisasiForm, setOtorisasiForm] = useState<any>({ penyusun: [""], koordinator: "", kaprodi: "" });

    const fetchRPSData = async () => {
        try {
            const res = await fetch(`/api/rps/${id_rps}`); 
            const json = await res.json();
            if (json.success) {
                setRpsData(json.data);
                setOtorisasiForm({
                    penyusun: json.data.nama_penyusun ? json.data.nama_penyusun.split(', ') : [""],
                    koordinator: json.data.nama_koordinator || "",
                    kaprodi: json.data.nama_kaprodi || ""
                });
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRPSData(); }, [id_rps]);

    const handleSave = async (endpoint: string, data: any, closeModal: any) => {
        setIsSaving(true);
        try {
            const payload = endpoint.includes("otorisasi") 
                ? { ...data, penyusun: data.penyusun.join(', '), rps_id: Number(id_rps) }
                : { ...data, rps_id: Number(id_rps) };

            const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) { await fetchRPSData(); closeModal(false); }
        } finally { setIsSaving(false); }
    };

    if (loading) return <DashboardLayout><div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></DashboardLayout>;
    const totalBobot = rpsData?.pertemuan?.reduce((acc: number, curr: any) => acc + (curr.bobot_nilai || 0), 0) || 0;

    return (
        <DashboardLayout>
            <div className="p-8 bg-gray-50 min-h-screen">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Detail Master RPS</h1>
                        <p className="text-slate-500 text-sm font-medium">Nomor Dokumen: {rpsData?.nomor_dokumen || "-"}</p>
                    </div>
                    <button onClick={() => router.back()} className="flex items-center gap-2 bg-white border-2 px-4 py-2 rounded-xl font-bold text-slate-600"><ArrowLeft size={18} /> Kembali</button>
                </div>

                {/* 1. INFO MATA KULIAH & TIM PENGESAHAN */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold text-xs uppercase text-indigo-600 mb-4 border-b pb-2 flex gap-2"><Info size={16}/> Informasi Mata Kuliah</h3>
                        <InfoRow label="Mata Kuliah" value={rpsData?.matakuliah?.nama} />
                        <InfoRow label="Kode/SKS" value={`${rpsData?.matakuliah?.kode_mk} / ${rpsData?.matakuliah?.sks} SKS`} />
                        <InfoRow label="Semester" value={rpsData?.matakuliah?.semester} />
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="bg-slate-100 px-6 py-3 border-b flex justify-between items-center">
                            <h3 className="font-bold text-[10px] text-slate-600 uppercase tracking-widest">Otorisasi</h3>
                            <button title="Ubah" onClick={() => setEditingSection('otorisasi')} className="text-indigo-600 hover:text-indigo-800"><Edit size={16}/></button>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex flex-col border-b pb-2">
                                <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Dosen Penyusun</span>
                                <div className="flex flex-wrap gap-2">{otorisasiForm.penyusun.map((d: any, i: any) => <span key={i} className="text-xs font-bold bg-gray-100 px-2 py-1 rounded border">{d}</span>)}</div>
                            </div>
                            <div className="flex justify-between text-sm"><b>Koordinator:</b> <span>{rpsData?.nama_koordinator || "-"}</span></div>
                            <div className="flex justify-between text-sm"><b>Kaprodi:</b> <span>{rpsData?.nama_kaprodi || "-"}</span></div>
                        </div>
                    </div>
                </div>

                {/* 2. CPMK (URUTAN PERTAMA) */}
                <SectionWrapper title="CPMK & Integrasi IK" icon={<Target size={18}/>} bgColor="bg-teal-700" action={<button onClick={() => setShowCpmkModal(true)} className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-2"><Plus size={14}/> Tambah CPMK</button>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rpsData?.cpmk?.map((item: any) => (
                            <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-teal-600 text-white font-black px-2 py-0.5 rounded text-[10px]">{item.kode_cpmk}</span>
                                    {item.ik?.[0] && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">IK: {item.ik[0].kode}</span>}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">{item.deskripsi}</p>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>

                {/* 3. RENCANA MINGGUAN (URUTAN KEDUA) */}
                <SectionWrapper title="Rencana Pembelajaran Mingguan" icon={<ScrollText size={18}/>} action={<button onClick={() => setShowPertemuanModal(true)} className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-2"><Plus size={14}/> Tambah Pertemuan</button>}>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-100 text-gray-600 font-bold border-b uppercase">
                                <tr>
                                    <th className="p-4 w-12 text-center">MG</th>
                                    <th className="p-4">KEMAMPUAN AKHIR (SUB-CPMK)</th>
                                    <th className="p-4">INDIKATOR & KRITERIA PENILAIAN</th>
                                    <th className="p-4">METODE PEMBELAJARAN</th>
                                    <th className="p-4 w-20 text-center text-indigo-700">BOBOT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rpsData?.pertemuan?.map((p: any) => (
                                    <tr key={p.id} className={p.bobot_nilai > 0 ? "bg-indigo-50/30" : "hover:bg-gray-50"}>
                                        <td className="p-4 text-center font-black">{p.pekan_ke}</td>
                                        <td className="p-4 font-semibold text-gray-800">{p.kemampuan_akhir}</td>
                                        <td className="p-4 text-gray-500 italic leading-relaxed">{p.kriteria_penilaian || "-"}</td>
                                        <td className="p-4 text-gray-600">{p.metode_pembelajaran}</td>
                                        <td className="p-4 text-center font-black text-indigo-700">{p.bobot_nilai}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionWrapper>

                {/* 4. EVALUASI (URUTAN AKHIR) */}
                <SectionWrapper title="Ringkasan Bobot Nilai" icon={<PieChart size={18}/>} bgColor="bg-indigo-800">
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100">
                        <div className="text-center">
                            <div className={`text-6xl font-black ${totalBobot === 100 ? 'text-green-600' : 'text-orange-500'}`}>{totalBobot}%</div>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Total Akumulasi</p>
                        </div>
                        <div className="grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {rpsData?.pertemuan?.filter((p:any) => p.bobot_nilai > 0).map((p:any) => (
                                <div key={p.id} className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">MG {p.pekan_ke}</span>
                                    <span className="text-sm font-black text-indigo-700">{p.bobot_nilai}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            </div>

            {/* --- MODALS --- */}

            {/* Modal CPMK + IK (Integrasi IK Tetap Ada) */}
            <Modal isOpen={showCpmkModal} onClose={() => setShowCpmkModal(false)} title="Tambah CPMK" onSave={() => handleSave("/api/rps/cpmk", cpmkForm, setShowCpmkModal)} isSaving={isSaving}>
                <div className="space-y-4">
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Kode CPMK</label><input className="w-full border p-3 rounded-xl text-sm" placeholder="CPMK-1" value={cpmkForm.kode} onChange={(e) => setCpmkForm({...cpmkForm, kode: e.target.value})} /></div>
                    <div>
                        <label className="text-[10px] font-bold text-indigo-600 uppercase">Pilih Indikator Kinerja (IK)</label>
                        <select className="w-full border p-3 rounded-xl text-sm bg-indigo-50 outline-none focus:ring-2 focus:ring-indigo-500" value={cpmkForm.ik_id} onChange={(e) => setCpmkForm({...cpmkForm, ik_id: e.target.value})}>
                            <option value="">-- Hubungkan dengan IK Prodi --</option>
                            {rpsData?.available_iks?.map((ik: any) => (<option key={ik.id} value={ik.id}>[{ik.kode}] {ik.deskripsi.substring(0, 60)}...</option>))}
                        </select>
                    </div>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Deskripsi Capaian</label><textarea className="w-full border p-3 h-32 rounded-xl text-sm" value={cpmkForm.deskripsi} onChange={(e) => setCpmkForm({...cpmkForm, deskripsi: e.target.value})} /></div>
                </div>
            </Modal>

            {/* Modal Pertemuan (Dropdown 1-16) */}
            <Modal isOpen={showPertemuanModal} onClose={() => setShowPertemuanModal(false)} title="Tambah Rencana Mingguan" onSave={() => handleSave("/api/rps/pertemuan", pertemuanForm, setShowPertemuanModal)} isSaving={isSaving}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Pekan Ke</label>
                            <select className="w-full border p-3 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" value={pertemuanForm.pekan_ke} onChange={(e) => setPertemuanForm({...pertemuanForm, pekan_ke: e.target.value})}>
                                {[...Array(16)].map((_, i) => (<option key={i+1} value={i+1}>Minggu ke-{i+1}</option>))}
                            </select>
                        </div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase">Bobot Nilai (%)</label><input type="number" className="w-full border p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={pertemuanForm.bobot_nilai} onChange={(e) => setPertemuanForm({...pertemuanForm, bobot_nilai: e.target.value})} /></div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-indigo-600 uppercase">Acuan CPMK</label>
                        <select className="w-full border p-3 rounded-xl text-sm bg-indigo-50 outline-none focus:ring-2 focus:ring-indigo-500" value={pertemuanForm.cpmk_id} onChange={(e) => setPertemuanForm({...pertemuanForm, cpmk_id: e.target.value})}>
                            <option value="">-- Pilih CPMK --</option>
                            {rpsData?.cpmk?.map((c: any) => (<option key={c.id} value={c.id}>{c.kode_cpmk} - {c.deskripsi.substring(0, 40)}...</option>))}
                        </select>
                    </div>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Kemampuan Akhir (Sub-CPMK)</label><textarea className="w-full border p-3 h-16 rounded-xl text-sm" value={pertemuanForm.kemampuan_akhir} onChange={(e) => setPertemuanForm({...pertemuanForm, kemampuan_akhir: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Kriteria & Indikator Penilaian (Manual)</label><textarea className="w-full border p-3 h-16 rounded-xl text-sm" placeholder="Contoh: Ketepatan analisis dan kerapian laporan..." value={pertemuanForm.kriteria_penilaian} onChange={(e) => setPertemuanForm({...pertemuanForm, kriteria_penilaian: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Metode Pembelajaran</label><input className="w-full border p-3 rounded-xl text-sm" value={pertemuanForm.metode_pembelajaran} onChange={(e) => setPertemuanForm({...pertemuanForm, metode_pembelajaran: e.target.value})} /></div>
                </div>
            </Modal>

            {/* Modal Otorisasi (Multi-Dosen) */}
            <Modal isOpen={editingSection === 'otorisasi'} onClose={() => setEditingSection(null)} title="Edit Tim Pengesahan RPS" onSave={() => handleSave("/api/rps/otorisasi", otorisasiForm, () => setEditingSection(null))} isSaving={isSaving}>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Dosen Penyusun / Pengampu</label>
                            <button onClick={() => setOtorisasiForm({...otorisasiForm, penyusun: [...otorisasiForm.penyusun, ""]})} className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black flex items-center gap-1"><Plus size={12}/> Tambah Dosen</button>
                        </div>
                        <div className="space-y-2">
                            {otorisasiForm.penyusun.map((nama: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                    <input className="w-full border p-2.5 rounded-xl text-sm font-bold" value={nama} onChange={(e) => { const newP = [...otorisasiForm.penyusun]; newP[index] = e.target.value; setOtorisasiForm({...otorisasiForm, penyusun: newP}); }} />
                                    <button title="Ubah" onClick={() => { const newP = otorisasiForm.penyusun.filter((_: any, i: number) => i !== index); setOtorisasiForm({...otorisasiForm, penyusun: newP}); }} className="text-red-500 p-2 hover:bg-red-50 rounded-xl"><X size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase">Nama Koordinator</label><input className="w-full border p-2.5 rounded-xl text-sm font-bold" value={otorisasiForm.koordinator} onChange={(e) => setOtorisasiForm({...otorisasiForm, koordinator: e.target.value})} /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase">Nama Kaprodi</label><input className="w-full border p-2.5 rounded-xl text-sm font-bold" value={otorisasiForm.kaprodi} onChange={(e) => setOtorisasiForm({...otorisasiForm, kaprodi: e.target.value})} /></div>
                    </div>
                </div>
            </Modal>

        </DashboardLayout>
    );
}