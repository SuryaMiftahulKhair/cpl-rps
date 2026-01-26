"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, Save, Loader2 } from "lucide-react";

interface MataKuliah {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number;
}

interface FormValues {
  matakuliah_id: string;
  nama_kelas: string;
  sks: number;
}

interface KelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    kode_mk: string;
    nama_mk: string;
    nama_kelas: string;
    sks: number;
    matakuliah_id: number;
  }) => void;
  submitting: boolean;
}

export default function KelasModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: KelasModalProps) {
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [loadingMk, setLoadingMk] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      matakuliah_id: "",
      nama_kelas: "",
      sks: 3,
    },
  });

  const selectedMkId = watch("matakuliah_id");

  // ======================
  // Fetch Mata Kuliah
  // ======================
  useEffect(() => {
    if (!isOpen) return;

    setLoadingMk(true);
    fetch("/api/matakuliah")
      .then((res) => res.json())
      .then((json) => setMkList(json.data || []))
      .finally(() => setLoadingMk(false));
  }, [isOpen]);

  // ======================
  // Auto-fill SKS
  // ======================
  useEffect(() => {
    const mk = mkList.find((m) => String(m.id) === selectedMkId);
    if (mk) {
      setValue("sks", mk.sks);
    }
  }, [selectedMkId, mkList, setValue]);

  // ======================
  // Submit
  // ======================
  const submitHandler = (data: FormValues) => {
    const mk = mkList.find((m) => String(m.id) === data.matakuliah_id);
    if (!mk) return;

    onSubmit({
      kode_mk: mk.kode_mk,
      nama_mk: mk.nama,
      nama_kelas: data.nama_kelas,
      sks: Number(data.sks),
      matakuliah_id: mk.id,
    });

    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-lg text-gray-800">
            Tambah Kelas
          </h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(submitHandler)} className="p-6 space-y-4">

          {/* Mata Kuliah */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mata Kuliah <span className="text-red-500">*</span>
            </label>

            <select
              {...register("matakuliah_id", { required: true })}
              disabled={loadingMk}
              className="w-full mt-1 px-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-indigo-500 outline-none
                text-gray-900 bg-white"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {mkList.map((mk) => (
                <option key={mk.id} value={mk.id}>
                  {mk.kode_mk} - {mk.nama} (Smt {mk.semester})
                </option>
              ))}
            </select>

            {errors.matakuliah_id && (
              <p className="text-xs text-red-500 mt-1">
                Mata kuliah wajib dipilih
              </p>
            )}
          </div>

          {/* Nama Kelas & SKS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nama Kelas
              </label>
              <input
                {...register("nama_kelas", { required: true })}
                placeholder="A / B / C"
                className="w-full mt-1 px-3 py-2 border rounded-lg
                  focus:ring-2 focus:ring-indigo-500 outline-none
                  text-gray-900 uppercase"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                SKS
              </label>
              <input
                type="number"
                min={0}
                max={6}
                {...register("sks", { required: true })}
                className="w-full mt-1 px-3 py-2 border rounded-lg
                  focus:ring-2 focus:ring-indigo-500 outline-none
                  text-gray-900 bg-gray-50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg
                flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
