"use client";

import { useState, useEffect, use } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    ChevronLeft, Edit, FileText, BookOpen, Target,
    ClipboardList, Loader2, Printer, Trash2, Copy, Plus, X, Save,
    Book, CheckSquare, GraduationCap, PieChart
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- TYPES ---
interface RubrikFormData {
    kode: string;
    nama: string;
    deskripsi: string;
}

interface OtorisasiFormData {
    penyusun: { nama: string }[]; 
    koordinator: string;
    kaprodi: string;
}

interface CpmkFormData {
    kode: string;
    deskripsi: string;
    ik_id: string;
}

interface PertemuanFormData {
    pekan_ke: number;
    bobot_nilai: number;
    rubrik_id: string;
    kemampuan_akhir: string;
    kriteria_penilaian: string;
    metode_pembelajaran: string;
}

// --- KOMPONEN HELPER ---
function Modal({ isOpen, onClose, title, children, onSave, isSaving }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                    <button title="Tutup" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto grow">{children}</div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl shrink-0 sticky bottom-0 z-10">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200 rounded-lg">Batal</button>
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
            <div className="flex items-center gap-2 print:hidden">{action}{onEdit && <button title="Edit" onClick={onEdit} className="p-1.5 hover:bg-slate-700 rounded"><Edit size={16}/></button>}</div>
        </div>
    );
}

function InfoRow({ label, value }: any) {
    return <div className="flex py-2 border-b border-gray-100"><div className="w-1/3 font-semibold text-gray-900 text-sm">{label}</div><div className="w-2/3 text-gray-900 text-sm">{value}</div></div>;
}

// --- MAIN PAGE ---
export default function DetailRPSPage({ params }: { params: Promise<{ id: string; id_matakuliah: string; id_rps: string }> }) {
    const { id, id_matakuliah, id_rps } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const prodiId = searchParams.get("prodiId");
    
    // State Data Utama
    const [activeTab, setActiveTab] = useState<"pertemuan" | "rubrik" | "evaluasi">("pertemuan");
    const [rpsData, setRpsData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State Modals
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [showPertemuanModal, setShowPertemuanModal] = useState(false);
    const [isEditPertemuan, setIsEditPertemuan] = useState(false);
    const [selectedCpmkId, setSelectedCpmkId] = useState<string>(""); 

    const [showCpmkModal, setShowCpmkModal] = useState(false);
    const [showRubrikModal, setShowRubrikModal] = useState(false);

    const [dosenList, setDosenList] = useState<{ id: number; nama: string }[]>([]);

    // React Hook Forms
    const rubrikForm = useForm<RubrikFormData>({
        defaultValues: { kode: "", nama: "", deskripsi: "" }
    });

    const cpmkForm = useForm<CpmkFormData>({
        defaultValues: { kode: "", deskripsi: "", ik_id: "" }
    });

    const pertemuanForm = useForm<PertemuanFormData>({
        defaultValues: {
            pekan_ke: 1,
            bobot_nilai: 0,
            rubrik_id: "",
            kemampuan_akhir: "",
            kriteria_penilaian: "",
            metode_pembelajaran: "Kuliah & Diskusi"
        }
    });

    const otorisasiForm = useForm<OtorisasiFormData>({
        defaultValues: { penyusun: [{ nama: "" }], koordinator: "", kaprodi: "" }
    });
    
    const { fields, append, remove } = useFieldArray({
        control: otorisasiForm.control,
        name: "penyusun"
    });

    // --- FETCH DATA ---
    const fetchRPSData = async () => {
        try {
            const res = await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`); 
            const json = await res.json();
            if (json.success) setRpsData(json.data);
            else throw new Error(json.error);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const fetchDosen = async () => {
        try {
            const res = await fetch(`/api/users/dosen?prodiId=${prodiId}`);
            const json = await res.json();
            if (json.success) setDosenList(json.data);
        } catch (err) {
            console.error("Gagal load dosen:", err);
        }
    };

    useEffect(() => { 
        if(prodiId) {
            fetchRPSData();
            fetchDosen();
        }
    }, [id_rps, prodiId]);

    // --- LOGIC RUBRIK ---
    const openAddRubrik = () => {
        const nextNo = rpsData.rubriks?.length ? rpsData.rubriks.length + 1 : 1;
        rubrikForm.reset({ kode: `R-${nextNo}`, nama: "", deskripsi: "" });
        setShowRubrikModal(true);
    };

    const handleSaveRubrik = async (data: RubrikFormData) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/rps/rubrik", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    rps_id: Number(id_rps), 
                    kode_rubrik: data.kode, 
                    nama_rubrik: data.nama, 
                    deskripsi: data.deskripsi,
                    prodiId: prodiId
                })
            });
            if (res.ok) { 
                await fetchRPSData(); 
                setShowRubrikModal(false); 
                rubrikForm.reset();
            } else alert("Gagal simpan Rubrik");
        } catch (e) { alert("Error sistem"); } finally { setIsSaving(false); }
    };

    // --- LOGIC CPMK ---
    const openAddCpmk = () => {
        const nextNo = rpsData.cpmk ? rpsData.cpmk.length + 1 : 1;
        cpmkForm.reset({ kode: `CPMK-${nextNo}`, deskripsi: "", ik_id: "" });
        setShowCpmkModal(true);
    };

    const handleSaveCpmk = async (data: CpmkFormData) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/rps/cpmk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    rps_id: Number(id_rps), 
                    kode_cpmk: data.kode, 
                    deskripsi: data.deskripsi, 
                    ik_id: data.ik_id,
                    prodiId: prodiId
                })
            });
            if (res.ok) { 
                await fetchRPSData(); 
                setShowCpmkModal(false); 
                cpmkForm.reset();
            } else alert("Gagal simpan CPMK");
        } catch (e) { alert("Error sistem"); } finally { setIsSaving(false); }
    };

    // --- LOGIC PERTEMUAN ---
    const handleCpmkSelectForPertemuan = (cpmkId: string) => {
        setSelectedCpmkId(cpmkId);
        if(!cpmkId) return;
        const selected = rpsData.cpmk.find((c: any) => c.id === Number(cpmkId));
        if(selected) {
            const ik = selected.ik && selected.ik.length > 0 ? selected.ik[0] : null;
            pertemuanForm.setValue('kemampuan_akhir', selected.deskripsi);
            pertemuanForm.setValue('kriteria_penilaian', ik ? `Indikator: ${ik.kode_ik} - ${ik.deskripsi}\nKriteria: Ketepatan dan Penguasaan.` : "Belum ada IK diset");
        }
    };

    const openAddPertemuan = () => {
        const nextPekan = rpsData.pertemuan?.length > 0 ? Math.max(...rpsData.pertemuan.map((p: any) => p.pekan_ke)) + 1 : 1;
        pertemuanForm.reset({ 
            pekan_ke: nextPekan, 
            metode_pembelajaran: "Kuliah & Diskusi", 
            bobot_nilai: 0, 
            kemampuan_akhir: "", 
            kriteria_penilaian: "", 
            rubrik_id: "" 
        });
        setSelectedCpmkId(""); 
        setIsEditPertemuan(false); 
        setShowPertemuanModal(true);
    };

    const handleSavePertemuan = async (data: PertemuanFormData) => {
        setIsSaving(true);
        try {
            const url = isEditPertemuan ? `/api/rps/pertemuan/${(pertemuanForm.getValues() as any).id}` : `/api/rps/pertemuan`;
            const payload = { 
                ...data, 
                rps_id: Number(id_rps), 
                bobot_nilai: Number(data.bobot_nilai), 
                pekan_ke: Number(data.pekan_ke), 
                rubrik_id: data.rubrik_id ? Number(data.rubrik_id) : null,
                prodiId: prodiId
            };
            const res = await fetch(url, { 
                method: isEditPertemuan ? 'PUT' : 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
            if (res.ok) { 
                await fetchRPSData(); 
                setShowPertemuanModal(false); 
                pertemuanForm.reset();
            } else throw new Error("Gagal simpan");
        } catch (error: any) { alert(`Error: ${error.message}`); } finally { setIsSaving(false); }
    };

    const handleSaveOtorisasi = async (formData: OtorisasiFormData) => {
        setIsSaving(true);
        try {
            const listNamaPenyusun = formData.penyusun.map(p => p.nama).filter(n => n !== "");

            const payload = {
                section: 'otorisasi',
                data: {
                    nama_penyusun: listNamaPenyusun,
                    nama_koordinator: formData.koordinator,
                    nama_kaprodi: formData.kaprodi
                }
            };

            const res = await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });

            if (res.ok) { 
                await fetchRPSData(); 
                setEditingSection(null); 
            }
        } catch (error) {
            alert("Gagal menyimpan data");
        } finally {
            setIsSaving(false);
        }
    };

    const openEditOtorisasi = () => {
        const existingPenyusun = Array.isArray(rpsData.nama_penyusun) 
            ? rpsData.nama_penyusun.map((nama: string) => ({ nama }))
            : [{ nama: "" }];

        otorisasiForm.reset({
            penyusun: existingPenyusun,
            koordinator: rpsData.nama_koordinator || "",
            kaprodi: rpsData.nama_kaprodi || ""
        });

        setEditingSection('otorisasi');
    };

    if (loading) return <DashboardLayout><div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="p-6 text-red-600 bg-red-50">{error}</div></DashboardLayout>;
    if (!rpsData) return null;

    const matkul = rpsData.matakuliah || {};
    const totalBobot = rpsData.pertemuan ? rpsData.pertemuan.reduce((acc: number, curr: any) => acc + (curr.bobot_nilai || 0), 0) : 0;

    return (
        <DashboardLayout>
            {/* CSS untuk Print/PDF */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #pdf-area,
                    #pdf-area * {
                        visibility: visible !important;
                    }
                    #pdf-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    * {
                        font-family: "Arial", sans-serif !important;
                        color: black !important;
                    }
                    .pdf-sampul {
                        height: 98vh;
                        display: flex !important;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        page-break-after: always;
                        text-align: center;
                    }
                    .pdf-page {
                        display: block !important;
                        page-break-after: always;
                        padding: 20mm;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        border: 1px solid black !important;
                        margin-top: 10px;
                    }
                    th,
                    td {
                        border: 1px solid black !important;
                        padding: 8px !important;
                        font-size: 11pt !important;
                    }
                    th {
                        background-color: #f2f2f2 !important;
                        font-weight: bold;
                    }
                }
            `}</style>

            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen print:hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detail RPS: {matkul.nama}</h1>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase mt-1">Konteks Prodi ID: {prodiId}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/rps/${id}/list/${id_matakuliah}?prodiId=${prodiId}`} className="bg-white border text-gray-600 px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-gray-50 shadow-sm transition-all">
                           <ChevronLeft size={16}/> Kembali
                        </Link>
                        <button onClick={() => window.print()} className="bg-red-600 text-white px-4 py-2 rounded flex gap-2 shadow-md text-sm font-bold hover:bg-red-700 transition-all"><Printer size={16}/> Export PDF</button>
                    </div>
                </div>

                {/* INFO & OTORISASI (Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-2">
                        <InfoRow label="MATA KULIAH" value={matkul.nama} />
                        <InfoRow label="KODE" value={matkul.kode_mk} />
                        <InfoRow label="BOBOT (SKS)" value={matkul.sks} />
                        <InfoRow label="SEMESTER" value={matkul.semester} />
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <SectionHeader title="Otorisasi" onEdit={openEditOtorisasi} />
                        <div className="border p-2 rounded">
                            <div>
                                <strong className="text-gray-900 text-xs uppercase tracking-wider">Penyusun:</strong>
                                <div className="text-gray-900 text-[11px] mt-1 space-y-1 ml-2">
                                    {Array.isArray(rpsData.nama_penyusun) ? (
                                        rpsData.nama_penyusun.map((nama: string, idx: number) => (
                                            <p key={idx}>{idx + 1}. {nama}</p>
                                        ))
                                    ) : (
                                        <p>{rpsData.nama_penyusun || "-"}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-50">
                                <strong className="text-gray-900 text-xs uppercase tracking-wider">Koordinator MK:</strong>
                                <p className="text-gray-900 text-[11px] mt-1 ml-2">
                                    {rpsData.nama_koordinator || "-"}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-gray-50">
                                <strong className="text-gray-900 text-xs uppercase tracking-wider">Ketua Program Studi:</strong>
                                <p className="text-gray-900 text-[11px] mt-1 ml-2">
                                    {rpsData.nama_kaprodi || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CPMK MAPPING */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="CPMK & Referensi IK" icon={<Target size={16}/>} action={<button onClick={openAddCpmk} className="bg-teal-600 text-white px-2 py-1 rounded text-xs flex gap-1 hover:bg-teal-700 transition-all shadow-sm"><Plus size={14}/> Tambah</button>} />
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rpsData.cpmk?.map((item: any) => (
                            <div key={item.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/30">
                                <span className="font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{item.kode_cpmk}</span>
                                <p className="text-gray-900 text-sm my-2 leading-relaxed">{item.deskripsi}</p>
                                <div className="text-[10px] text-green-700 font-medium bg-green-50 p-2 rounded border border-green-100 flex gap-2">
                                    <CheckSquare size={12}/> {item.ik?.[0] ? `[${item.ik[0].kode_ik}] ${item.ik[0].deskripsi}` : "No IK Mapping"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TABS (PERTEMUAN, RUBRIK, EVALUASI) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-gray-50">
                         <button onClick={() => setActiveTab("pertemuan")} className={`px-6 py-3 text-sm font-semibold transition-all ${activeTab === "pertemuan" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-900 hover:text-indigo-600"}`}>Rencana Mingguan</button>
                         <button onClick={() => setActiveTab("rubrik")} className={`px-6 py-3 text-sm font-semibold transition-all ${activeTab === "rubrik" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-900 hover:text-indigo-600"}`}>Rubrik Penilaian</button>
                         <button onClick={() => setActiveTab("evaluasi")} className={`px-6 py-3 text-sm font-semibold transition-all ${activeTab === "evaluasi" ? "bg-white text-indigo-700 border-t-2 border-indigo-500" : "text-gray-900 hover:text-indigo-600"}`}>Evaluasi</button>
                    </div>

                    {/* CONTENT: PERTEMUAN */}
                    {activeTab === 'pertemuan' && (
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse border border-gray-200 mb-4">
                                    <thead className="bg-gray-100 text-gray-900 uppercase">
                                        <tr>
                                            <th className="border p-2 w-10">Mg</th>
                                            <th className="border p-2">Kemampuan Akhir (Sub-CPMK)</th>
                                            <th className="border p-2">Indikator & Kriteria</th>
                                            <th className="border p-2">Metode</th>
                                            <th className="border p-2 w-16">Bobot</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rpsData.pertemuan?.map((p: any) => (
                                            <tr key={p.id} className={`${p.bobot_nilai > 0 ? "bg-indigo-50/40" : "hover:bg-gray-50/50"}`}>
                                                <td className="border p-2 text-center font-bold text-gray-900">{p.pekan_ke}</td>
                                                <td className="border p-2">
                                                    {p.bobot_nilai > 0 && <span className="inline-block bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded mb-1 uppercase font-bold">Asesmen</span>}
                                                    <p className="text-gray-900 leading-normal">{p.kemampuan_akhir}</p>
                                                </td>
                                                <td className="border p-2 text-gray-900 italic whitespace-pre-wrap">{p.kriteria_penilaian}</td>
                                                <td className="border p-2 text-gray-900">{p.metode_pembelajaran}</td>
                                                <td className={`border p-2 text-center font-bold ${p.bobot_nilai > 0 ? "text-indigo-700" : "text-gray-400"}`}>{p.bobot_nilai > 0 ? `${p.bobot_nilai}%` : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={openAddPertemuan} className="bg-green-600 text-white px-4 py-2 rounded text-sm flex gap-2 shadow-sm hover:bg-green-700 transition-colors"><Plus size={16}/> Tambah Pertemuan</button>
                        </div>
                    )}

                    {/* CONTENT: RUBRIK */}
                    {activeTab === 'rubrik' && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-gray-900">Rubrik Penilaian</h4>
                                <button onClick={openAddRubrik} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 items-center hover:bg-indigo-700 shadow-sm transition-all"><Plus size={16}/> Tambah Rubrik</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rpsData.rubriks?.length > 0 ? rpsData.rubriks.map((r: any) => (
                                    <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-indigo-300 transition-all shadow-sm">
                                        <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-2">
                                            <div>
                                                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-indigo-100">{r.kode_rubrik}</span>
                                                <h5 className="font-bold text-gray-900 mt-1">{r.nama_rubrik}</h5>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-900 whitespace-pre-wrap line-clamp-4 leading-relaxed">{r.deskripsi}</p>
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-10 text-center border-2 border-dashed rounded-xl border-gray-200">
                                        <BookOpen className="mx-auto text-gray-300 mb-2" size={40}/>
                                        <p className="text-gray-500 text-sm">Belum ada rubrik penilaian yang dibuat.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CONTENT: EVALUASI */}
                    {activeTab === 'evaluasi' && (
                        <div className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-xl text-center border shadow-inner">
                                <PieChart className="mx-auto text-indigo-500 mb-2" size={48}/>
                                <div className={`text-5xl font-extrabold ${totalBobot === 100 ? 'text-green-600' : 'text-orange-500'}`}>{totalBobot}%</div>
                                <p className="text-xs text-gray-500 mt-2">Total Akumulasi Bobot Nilai</p>
                            </div>
                            <div className="w-full md:w-2/3">
                                <h4 className="font-bold mb-4 text-gray-900">Ringkasan Komponen Nilai</h4>
                                <ul className="text-sm border rounded-xl divide-y overflow-hidden shadow-sm">
                                    {rpsData.pertemuan?.filter((p:any) => p.bobot_nilai > 0).map((p:any) => (
                                        <li key={p.id} className="p-3 flex justify-between bg-white hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">Minggu {p.pekan_ke}: {p.kemampuan_akhir}</span>
                                                {p.rubrik && <span className="text-[10px] text-indigo-600 font-bold uppercase mt-1">Rubrik: {p.rubrik.kode_rubrik}</span>}
                                            </div>
                                            <span className="font-bold text-indigo-700 text-lg">{p.bobot_nilai}%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- AREA PDF --- */}
            <div id="pdf-area" className="hidden print:block">
                {/* Halaman Sampul */}
                <div className="pdf-sampul">
                    <h1 className="text-3xl font-bold uppercase">
                        RENCANA PEMBELAJARAN SEMESTER (RPS)
                    </h1>
                    <h2 className="text-xl font-bold mt-4 uppercase">
                        MATA KULIAH: {matkul.nama} ({matkul.kode_mk})
                    </h2>
                    <div className="my-12">
                        <img src="/logo-unhas.png" alt="Logo UNHAS" width="250" />
                    </div>
                    <div className="mt-auto text-lg font-bold uppercase">
                        UNIVERSITAS HASANUDDIN
                        <br />
                        FAKULTAS TEKNIK
                        <br />
                        PRODI TEKNIK INFORMATIKA
                        <br />
                        TAHUN {new Date().getFullYear()}
                    </div>
                </div>

                {/* Halaman 1: Kurikulum & Otorisasi */}
                <div className="pdf-page">
                    <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
                        I. KURIKULUM & VISI MISI
                    </h2>
                    <p>
                        <strong>Kurikulum:</strong> {rpsData?.kurikulum_nama || "K23"} - Berbasis OBE
                    </p>
                    <div className="mt-10">
                        <h3 className="font-bold uppercase text-center mb-4 underline">
                            OTORISASI / PENGESAHAN
                        </h3>
                        <table className="text-center">
                            <thead>
                                <tr>
                                    <th>Penyusun</th>
                                    <th>Koordinator MK</th>
                                    <th>Ketua Prodi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="h-24">
                                    <td>
                                        {Array.isArray(rpsData.nama_penyusun)
                                            ? rpsData.nama_penyusun.join(", ")
                                            : rpsData.nama_penyusun}
                                    </td>
                                    <td>{String(rpsData.nama_koordinator || "-")}</td>
                                    <td>{String(rpsData.nama_kaprodi || "-")}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Halaman 2: CPMK */}
                <div className="pdf-page">
                    <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
                        II. CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK)
                    </h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Deskripsi</th>
                                <th>Indikator Kinerja</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rpsData.cpmk?.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="text-center font-bold">{item.kode_cpmk}</td>
                                    <td>{item.deskripsi}</td>
                                    <td>{item.ik?.[0] ? `${item.ik[0].kode_ik} - ${item.ik[0].deskripsi}` : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Halaman 3: Rencana Mingguan */}
                <div className="pdf-page">
                    <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
                        III. RENCANA PEMBELAJARAN MINGGUAN
                    </h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Mg</th>
                                <th>Kemampuan Akhir</th>
                                <th>Indikator</th>
                                <th>Metode</th>
                                <th>Bobot</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rpsData.pertemuan?.map((p: any) => (
                                <tr key={p.id}>
                                    <td className="text-center">{p.pekan_ke}</td>
                                    <td>{p.kemampuan_akhir}</td>
                                    <td>{p.kriteria_penilaian}</td>
                                    <td>{p.metode_pembelajaran}</td>
                                    <td className="text-center">{p.bobot_nilai}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Halaman 4: Rubrik Penilaian */}
                {rpsData.rubriks?.length > 0 && (
                    <div className="pdf-page">
                        <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
                            IV. RUBRIK PENILAIAN
                        </h2>
                        {rpsData.rubriks.map((r: any) => (
                            <div key={r.id} className="mb-6">
                                <h3 className="font-bold text-sm mb-2">[{r.kode_rubrik}] {r.nama_rubrik}</h3>
                                <p className="text-xs whitespace-pre-wrap">{r.deskripsi}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            <Modal isOpen={showRubrikModal} onClose={() => { setShowRubrikModal(false); rubrikForm.reset(); }} title="Tambah Rubrik Baru" onSave={rubrikForm.handleSubmit(handleSaveRubrik)} isSaving={isSaving}>
                <form className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Kode</label>
                            <input {...rubrikForm.register("kode", { required: "Kode wajib diisi" })} className="w-full border p-2 rounded-lg bg-gray-50 font-mono text-sm text-gray-900" placeholder="R-1" />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Nama Rubrik</label>
                            <input {...rubrikForm.register("nama", { required: "Nama rubrik wajib diisi" })} className="w-full border p-2 rounded-lg text-sm text-gray-900" placeholder="Contoh: Rubrik Makalah" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Deskripsi & Kriteria</label>
                        <textarea {...rubrikForm.register("deskripsi", { required: "Deskripsi wajib diisi" })} className="w-full border p-2 h-40 rounded-lg text-sm text-gray-900" placeholder="Masukkan detail kriteria penilaian..." />
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showCpmkModal} onClose={() => { setShowCpmkModal(false); cpmkForm.reset(); }} title="Tambah CPMK" onSave={cpmkForm.handleSubmit(handleSaveCpmk)} isSaving={isSaving}>
                <form className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kode CPMK</label>
                        <input {...cpmkForm.register("kode", { required: "Kode wajib diisi" })} className="w-full border p-2 rounded-lg text-sm text-gray-900" placeholder="Kode (CPMK-1)" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Deskripsi</label>
                        <textarea {...cpmkForm.register("deskripsi", { required: "Deskripsi wajib diisi" })} className="w-full border p-2 h-20 rounded-lg text-sm text-gray-900" placeholder="Deskripsi Capaian..." />
                    </div>
                    <div className="border p-3 rounded-xl bg-gray-50">
                        <p className="text-[10px] font-bold mb-2 text-indigo-700 uppercase">Pilih Indikator Kinerja (IK):</p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {rpsData.available_iks?.map((ik: any) => (
                                <label key={ik.id} className="flex items-start gap-2 p-2 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-gray-200">
                                    <input type="radio" {...cpmkForm.register("ik_id", { required: "IK wajib dipilih" })} value={ik.id} className="mt-1" />
                                    <div className="text-[11px]">
                                        <span className="font-bold text-gray-900">[{ik.cpl_kode}] {ik.kode}</span>
                                        <span className="text-gray-900 block">{ik.deskripsi}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showPertemuanModal} onClose={() => { setShowPertemuanModal(false); pertemuanForm.reset(); }} title="Tambah Pertemuan" onSave={pertemuanForm.handleSubmit(handleSavePertemuan)} isSaving={isSaving}>
                <form className="space-y-4">
                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                        <label className="block text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">Acuan CPMK (Otomatis)</label>
                        <select className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900" value={selectedCpmkId} onChange={(e) => handleCpmkSelectForPertemuan(e.target.value)}>
                            <option value="">-- Pilih CPMK --</option>
                            {rpsData.cpmk?.map((c: any) => <option key={c.id} value={c.id}>{c.kode_cpmk} - {c.deskripsi.substring(0, 40)}...</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Pekan Ke</label>
                            <input type="number" min={1} max={16} {...pertemuanForm.register("pekan_ke", { required: "Pekan wajib diisi", valueAsNumber: true })} className="w-full border p-2 rounded-lg text-sm text-gray-900" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Bobot (%)</label>
                            <input type="number" min={0} max={100} {...pertemuanForm.register("bobot_nilai", { required: "Bobot wajib diisi", valueAsNumber: true })} className="w-full border p-2 rounded-lg text-sm text-gray-900" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Pilih Rubrik</label>
                        <select {...pertemuanForm.register("rubrik_id")} className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900">
                            <option value="">-- Tanpa Rubrik --</option>
                            {rpsData.rubriks?.map((r: any) => <option key={r.id} value={r.id}>{r.kode_rubrik} - {r.nama_rubrik}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Kemampuan Akhir</label>
                        <textarea {...pertemuanForm.register("kemampuan_akhir", { required: "Kemampuan akhir wajib diisi" })} className="w-full border p-2 h-16 rounded-lg text-sm text-gray-900" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Indikator Penilaian</label>
                        <textarea {...pertemuanForm.register("kriteria_penilaian")} className="w-full border p-2 h-16 rounded-lg text-sm bg-gray-50 text-gray-900" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Metode</label>
                        <input {...pertemuanForm.register("metode_pembelajaran", { required: "Metode wajib diisi" })} className="w-full border p-2 rounded-lg text-sm text-gray-900" />
                    </div>
                </form>
            </Modal>

            <Modal 
                isOpen={editingSection === 'otorisasi'} 
                onClose={() => { setEditingSection(null); otorisasiForm.reset(); }} 
                title="Edit Otorisasi" 
                onSave={otorisasiForm.handleSubmit(handleSaveOtorisasi)} 
                isSaving={isSaving}
            >
                <form className="space-y-4">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Dosen Penyusun RPS
                        </label>
                        
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <select 
                                        {...otorisasiForm.register(`penyusun.${index}.nama` as const, { required: "Wajib diisi" })}
                                        className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">-- Pilih Dosen {index + 1} --</option>
                                        {dosenList.map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
                                    </select>
                                </div>
                                
                                {fields.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => remove(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus Penyusun"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button 
                            type="button" 
                            onClick={() => append({ nama: "" })}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-xs font-bold py-1"
                        >
                            <Plus size={14} /> Tambah Dosen Penyusun
                        </button>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Koordinator MK / Rumpun</label>
                        <select 
                            {...otorisasiForm.register("koordinator", { required: "Koordinator wajib dipilih" })}
                            className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900"
                        >
                            <option value="">-- Pilih Dosen --</option>
                            {dosenList.map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ketua Program Studi</label>
                        <select 
                            {...otorisasiForm.register("kaprodi", { required: "Kaprodi wajib dipilih" })}
                            className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900"
                        >
                            <option value="">-- Pilih Kaprodi --</option>
                            {dosenList.map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
                        </select>
                    </div>
                </form>
            </Modal>

        </DashboardLayout>
    );
}