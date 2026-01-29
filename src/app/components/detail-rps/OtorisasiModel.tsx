"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface OtorisasiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    isSaving: boolean;
    dosenList: { id: number; nama: string }[];
    initialData: any;
}

export default function OtorisasiModal({ isOpen, onClose, onSave, isSaving, dosenList, initialData }: OtorisasiModalProps) {
    const { register, control, handleSubmit, reset } = useForm({
        defaultValues: { penyusun: [{ nama: "" }], koordinator: "", kaprodi: "" }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "penyusun" });

    // Sinkronkan data saat modal dibuka
    useEffect(() => {
        if (isOpen && initialData) {
            const existingPenyusun = Array.isArray(initialData.nama_penyusun) 
                ? initialData.nama_penyusun.map((nama: string) => ({ nama }))
                : [{ nama: "" }];
            
            reset({
                penyusun: existingPenyusun,
                koordinator: initialData.nama_koordinator || "",
                kaprodi: initialData.nama_kaprodi || ""
            });
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg text-gray-900">Edit Otorisasi</h3>
                    <button title="Tutup" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dosen Penyusun RPS</label>
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-center">
                                <select {...register(`penyusun.${index}.nama` as const)} className="flex-1 border p-2 rounded-lg text-sm bg-white text-gray-900 border-slate-200">
                                    <option value="">-- Pilih Dosen {index + 1} --</option>
                                    {dosenList.map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
                                </select>
                                {fields.length > 1 && (
                                    <button title="simpan" type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => append({ nama: "" })} className="flex items-center gap-2 text-indigo-600 text-xs font-bold"><Plus size={14}/> Tambah Penyusun</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Koordinator MK</label>
                            <select {...register("koordinator")} className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900 border-slate-200">
                                <option value="">-- Pilih Dosen --</option>
                                {dosenList.map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Ketua Program Studi</label>
                            <select {...register("kaprodi")} className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900 border-slate-200">
                                <option value="">-- Pilih Kaprodi --</option>
                                {dosenList.map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm font-bold">
                            {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}