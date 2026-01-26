// file: src/app/components/TahunAjaranModal.tsx
"use client";

import { X } from "lucide-react";
import { useForm } from "react-hook-form";

// ==================
// TIPE DATA FORM
// ==================
interface TahunAjaranForm {
  tahun: string;
  semester: "GANJIL" | "GENAP";
  kode_neosia: string;
}

// ==================
// PROPS
// ==================
interface TahunAjaranModalProps {
  isOpen: boolean;
  onClose: () => void;
<<<<<<< HEAD
  onSubmit: (data: TahunAjaranForm) => void;
=======
  onSubmit: (data: { tahun: string; semester: "GANJIL" | "GENAP" ; }) => void;
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
  submitting: boolean;
}

// ==================
// KOMPONEN
// ==================
export default function TahunAjaranModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: TahunAjaranModalProps) {

  const form = useForm<TahunAjaranForm>({
    defaultValues: {
      semester: "GANJIL",
    },
  });

  if (!isOpen) return null;

<<<<<<< HEAD
=======
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tahun = formData.get("tahun") as string;
    const semester = formData.get("semester") as "GANJIL" | "GENAP";

    if (tahun.trim() && semester) {
      onSubmit({
        tahun: tahun.trim(),
        semester,
        
      });
    }
  };


>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-slideUp">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Tambah Tahun Ajaran
          </h2>

          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >

          {/* ===== Tahun Ajaran (SELECT) ===== */}
          <div>
<<<<<<< HEAD
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tahun Ajaran <span className="text-red-500">*</span>
            </label>

            <select
              {...form.register("tahun", {
                required: "Tahun ajaran wajib dipilih",
              })}
              className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Tahun Ajaran --</option>

              {Array.from({ length: 11 }, (_, i) => {
                const start = 2020 + i;
                const end = start + 1;
                const value = `${start}/${end}`;

                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>

            {form.formState.errors.tahun && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.tahun.message}
              </p>
            )}
=======
            <label htmlFor="tahun" className="block text-sm font-semibold text-gray-700 mb-2">Tahun Ajaran <span className="text-red-500">*</span></label>
            <input type="text" id="tahun" name="tahun" required placeholder="Contoh: 2024/2025" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-500" />
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
          </div>

          {/* ===== Semester ===== */}
          <div>
<<<<<<< HEAD
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Semester <span className="text-red-500">*</span>
            </label>

            <select
              {...form.register("semester", {
                required: "Semester wajib dipilih",
              })}
              className="w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
            >
=======
            <label htmlFor="semester" className="block text-sm font-semibold text-gray-700 mb-2">Semester <span className="text-red-500">*</span></label>
            <select id="semester" name="semester" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-500">
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
              <option value="GANJIL">GANJIL</option>
              <option value="GENAP">GENAP</option>
            </select>
          </div>
<<<<<<< HEAD

          {/* ===== Kode Neosia ===== */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Kode Semester Neosia
            </label>

            <input
              {...form.register("kode_neosia", {
                required: "Kode Neosia wajib diisi",
              })}
              placeholder="Contoh: 20241 / 20242"
              className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
            />

            {form.formState.errors.kode_neosia && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.kode_neosia.message}
              </p>
            )}

            <p className="text-xs text-gray-500 mt-1">
              *Digunakan untuk sinkronisasi nilai otomatis.
            </p>
          </div>

          {/* ===== BUTTON ===== */}
=======
          <div className="mb-4">       
       </div>
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                form.reset();
                onClose();
              }}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

export default TahunAjaranModal;
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
