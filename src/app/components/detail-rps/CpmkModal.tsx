"use client";

import { useForm } from "react-hook-form";
import { X, Save, Loader2, Target, CheckSquare } from "lucide-react";
import { useEffect } from "react";

interface CpmkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    isSaving: boolean;
    nextNo: number;
    availableIks: any[];
}

export default function CpmkModal({ isOpen, onClose, onSave, isSaving, nextNo, availableIks }: CpmkModalProps) {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: { kode: "", deskripsi: "", ik_id: "" }
    });

    useEffect(() => {
        if (isOpen) reset({ kode: `CPMK-${nextNo}`, deskripsi: "", ik_id: "" });
    }, [isOpen, nextNo, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-teal-50/50">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Target size={20} className="text-teal-600"/> Tambah CPMK</h3>
                    <button title="Buat" onClick={onClose} className="p-1 hover:bg-white rounded-full text-gray-500"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kode CPMK</label>
                        <input {...register("kode")} className="w-full border p-2 rounded-lg bg-gray-50 text-sm text-gray-900 border-slate-200" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deskripsi Capaian</label>
                        <textarea {...register("deskripsi", { required: true })} className="w-full border p-2 h-24 rounded-lg text-sm text-gray-900 border-slate-200" placeholder="Mahasiswa mampu..." />
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold mb-3 text-indigo-600 uppercase tracking-widest">Pilih Indikator Kinerja (IK):</p>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {availableIks?.map((ik: any) => (
                                <label key={ik.id} className="flex items-start gap-3 p-3 bg-white hover:bg-indigo-50 rounded-lg cursor-pointer border border-slate-200 transition-all group">
                                    <input type="radio" {...register("ik_id", { required: true })} value={ik.id} className="mt-1 accent-indigo-600" />
                                    <div className="text-[11px] leading-relaxed">
                                        <span className="font-black text-indigo-700 block mb-0.5">[{ik.cpl_kode}] {ik.kode}</span>
                                        <span className="text-gray-600 group-hover:text-gray-900">{ik.deskripsi}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 font-semibold hover:bg-gray-100 rounded-lg">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm font-bold shadow-md hover:bg-teal-700">
                            {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Simpan CPMK
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}