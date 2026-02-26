"use client";

import { useForm } from "react-hook-form";
import { X, Save, Loader2, Target, Percent, Check } from "lucide-react";
import { useEffect } from "react";

interface CpmkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isSaving: boolean;
  nextNo: number;
  availableIks: any[]; // List IK yang belum terikat ke CPMK lain
}

export default function CpmkModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  nextNo,
  availableIks,
}: CpmkModalProps) {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      kode: "",
      deskripsi: "",
      ik_ids: [] as number[], // Array untuk menampung banyak IK terpilih
      bobot: 0,
    },
  });

  // Memantau perubahan pada ik_ids untuk update UI secara realtime
  const selectedIks = watch("ik_ids") || [];

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      reset({
        kode: `CPMK-${nextNo}`,
        deskripsi: "",
        ik_ids: [],
        bobot: 0,
      });
    }
  }, [isOpen, nextNo, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ========== HEADER ========== */}
        <div className="flex justify-between items-center p-4 border-b bg-teal-50/50">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Target size={20} className="text-teal-600" /> Tambah CPMK Baru
          </h3>
          <button
            title="Tutup"
            onClick={onClose}
            className="p-1 hover:bg-white rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSave)}
          className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* ========== KODE & BOBOT ========== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Kode CPMK
              </label>
              <input
                {...register("kode", { required: true })}
                className="w-full border p-2.5 rounded-lg bg-gray-50 text-sm text-gray-900 border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Percent size={10} /> Bobot ke CPL
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register("bobot", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  className="w-full border p-2.5 rounded-lg bg-white text-sm text-gray-900 border-slate-200 pr-8 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="0"
                />
                <span className="absolute right-3 top-3 text-xs text-gray-400 font-bold">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* ========== DESKRIPSI ========== */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Deskripsi Capaian Pembelajaran
            </label>
            <textarea
              {...register("deskripsi", { required: true })}
              className="w-full border p-3 h-28 rounded-lg text-sm text-gray-900 border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
              placeholder="Contoh: Mahasiswa mampu menganalisis struktur data..."
            />
          </div>

          {/* ========== PEMETAAN IK (BANYAK PILIHAN) ========== */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  Petakan ke Indikator Kinerja (IK)
                </p>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  *Anda dapat memilih lebih dari satu IK
                </p>
              </div>
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all ${
                  selectedIks.length > 0
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-200 text-gray-500"
                }`}>
                {selectedIks.length} Terpilih
              </span>
            </div>

            {!availableIks || availableIks.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-sm text-gray-400 italic">
                  Tidak ada IK yang tersedia untuk dipetakan.
                </p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                {availableIks.map((ik: any) => {
                  const isSelected = selectedIks
                    .map(Number)
                    .includes(Number(ik.id));
                  return (
                    <label
                      key={ik.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-500 shadow-sm"
                          : "bg-white border-slate-100 hover:border-slate-300 hover:bg-gray-50"
                      }`}>
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          value={ik.id}
                          {...register("ik_ids", {
                            required: "Minimal pilih satu IK",
                          })}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                        />
                      </div>
                      <div className="text-[11px] leading-relaxed flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`font-black tracking-tight ${
                              isSelected ? "text-indigo-700" : "text-slate-700"
                            }`}>
                            [{ik.cpl_kode || "N/A"}] {ik.kode}
                          </span>
                          {isSelected && (
                            <Check
                              size={14}
                              className="text-indigo-600"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <span
                          className={`${
                            isSelected
                              ? "text-indigo-900/80 font-medium"
                              : "text-gray-500"
                          } block line-clamp-2`}>
                          {ik.deskripsi}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========== FOOTER ACTIONS ========== */}
          <div className="flex justify-end gap-3 pt-5 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || selectedIks.length === 0}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 hover:shadow-teal-200 transition-all">
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Simpan CPMK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
