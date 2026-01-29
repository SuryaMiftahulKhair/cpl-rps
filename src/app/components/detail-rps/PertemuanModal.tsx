"use client";

import { useForm } from "react-hook-form";
import { X, Save, Loader2, Calendar, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";

interface PertemuanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    isSaving: boolean;
    nextPekan: number;
    cpmkList: any[];
    rubrikList: any[];
    isEdit: boolean;
}

export default function PertemuanModal({ isOpen, onClose, onSave, isSaving, nextPekan, cpmkList, rubrikList, isEdit }: PertemuanModalProps) {
    const [selectedCpmk, setSelectedCpmk] = useState("");
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        if (isOpen && !isEdit) {
            reset({ pekan_ke: nextPekan, bobot_nilai: 0, metode_pembelajaran: "Kuliah & Diskusi" });
            setSelectedCpmk("");
        }
    }, [isOpen, isEdit, nextPekan, reset]);

    const handleAutoFill = (cpmkId: string) => {
        setSelectedCpmk(cpmkId);
        const selected = cpmkList.find(c => c.id === Number(cpmkId));
        if (selected) {
            setValue("kemampuan_akhir", selected.deskripsi);
            const ik = selected.ik?.[0];
            setValue("kriteria_penilaian", ik ? `Indikator: ${ik.kode} - ${ik.deskripsi}` : "");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="flex justify-between items-center p-4 border-b bg-green-50/50">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Calendar size={20} className="text-green-600"/> {isEdit ? 'Edit' : 'Tambah'} Pertemuan</h3>
                    <button title="Buat" onClick={onClose} className="p-1 hover:bg-white rounded-full text-gray-500"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4 overflow-y-auto">
                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-2">
                        <label className="block text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-widest">Referensi CPMK (Auto-fill)</label>
                        <select className="w-full border p-2 rounded-lg text-sm bg-white border-indigo-200" value={selectedCpmk} onChange={(e) => handleAutoFill(e.target.value)}>
                            <option value="">-- Pilih CPMK --</option>
                            {cpmkList?.map(c => <option key={c.id} value={c.id}>{c.kode_cpmk} - {c.deskripsi.substring(0, 50)}...</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pekan Ke</label>
                            <input type="number" {...register("pekan_ke")} className="w-full border p-2 rounded-lg text-sm text-gray-900 border-slate-200" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Bobot Nilai (%)</label>
                            <input type="number" {...register("bobot_nilai")} className="w-full border p-2 rounded-lg text-sm text-gray-900 border-slate-200" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Metode & Pengalaman Belajar</label>
                        <input {...register("metode_pembelajaran")} className="w-full border p-2 rounded-lg text-sm text-gray-900 border-slate-200" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kemampuan Akhir (Sub-CPMK)</label>
                        <textarea {...register("kemampuan_akhir")} className="w-full border p-2 h-16 rounded-lg text-sm text-gray-900 border-slate-200" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Indikator & Kriteria Penilaian</label>
                        <textarea {...register("kriteria_penilaian")} className="w-full border p-2 h-16 rounded-lg text-sm text-gray-900 border-slate-200" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hubungkan ke Rubrik (Opsional)</label>
                        <select {...register("rubrik_id")} className="w-full border p-2 rounded-lg text-sm bg-white border-slate-200 text-gray-900">
                            <option value="">-- Tanpa Rubrik --</option>
                            {rubrikList?.map(r => <option key={r.id} value={r.id}>{r.kode_rubrik} - {r.nama_rubrik}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm font-bold shadow-md hover:bg-green-700 transition-all">
                            {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Simpan Pertemuan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}