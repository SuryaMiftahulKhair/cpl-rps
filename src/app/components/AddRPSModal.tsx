"use client";

import { useForm } from "react-hook-form";
import { X, Loader2, Plus } from "lucide-react";
import { Semester } from "@prisma/client";

// Definisi tipe data untuk form
interface RPSFormData {
    keterangan: string;
    tahun: string;
    semester: Semester;
}

interface AddRPSModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isProcessing: boolean;
}

export default function AddRPSModal({ isOpen, onClose, onSubmit, isProcessing }: AddRPSModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<RPSFormData>({
        defaultValues: {
            tahun: "2025/2026",
            semester: Semester.GANJIL,
            keterangan: ""
        }
    });

    const onFormSubmit = (data: RPSFormData) => {
        onSubmit({ 
            keterangan: data.keterangan, 
            new_tahun: data.tahun, 
            new_semester: data.semester,
            is_new_ta: true 
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={handleClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">Buat RPS Baru</h3>
                        <button title="tutup" onClick={handleClose} className="text-gray-400 hover:text-gray-900">
                            <X size={24}/>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">
                                Tahun Ajaran
                            </label>
                            <input 
                                type="text" 
                                {...register("tahun", { 
                                    required: "Tahun ajaran wajib diisi",
                                    pattern: {
                                        value: /^\d{4}\/\d{4}$/,
                                        message: "Format: 2025/2026"
                                    }
                                })}
                                placeholder="Contoh: 2025/2026"
                                className={`w-full border-2 rounded-lg p-2.5 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 ${
                                    errors.tahun ? 'border-red-300' : 'border-slate-100'
                                }`}
                            />
                            {errors.tahun && <p className="text-red-500 text-xs mt-1">{errors.tahun.message}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">
                                Semester
                            </label>
                            <select 
                                {...register("semester", { required: "Semester wajib dipilih" })}
                                className={`w-full border-2 rounded-lg p-2.5 bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 ${
                                    errors.semester ? 'border-red-300' : 'border-slate-100'
                                }`}
                            >
                                <option value={Semester.GANJIL}>GANJIL</option>
                                <option value={Semester.GENAP}>GENAP</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">
                                Keterangan / Deskripsi
                            </label>
                            <textarea
                                {...register("keterangan", { 
                                    required: "Keterangan wajib diisi",
                                    minLength: { value: 10, message: "Minimal 10 karakter" }
                                })}
                                placeholder="Contoh: RPS Kurikulum Baru"
                                className={`w-full border-2 rounded-lg p-2.5 focus:border-indigo-500 outline-none transition-all text-sm min-h-20 text-gray-900 placeholder:text-gray-400 ${
                                    errors.keterangan ? 'border-red-300' : 'border-slate-100'
                                }`}
                            />
                            {errors.keterangan && <p className="text-red-500 text-xs mt-1">{errors.keterangan.message}</p>}
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