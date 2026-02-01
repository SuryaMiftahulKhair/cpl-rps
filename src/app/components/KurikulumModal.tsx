"use client";

import { useForm } from "react-hook-form";
import { X, Layers } from "lucide-react";
import { useEffect } from "react";

// ========================================
// SCHEMA & TYPES
// ========================================

interface KurikulumFormData {
  nama: string;
  tahunMulai: string; // Changed to string to support "2024" or "2024/2025"
}

interface KurikulumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nama: string, tahun: number) => Promise<void>;
  submitting: boolean;
}

// Validasi rules
const VALIDATION_RULES = {
  nama: {
    required: "Nama kurikulum wajib diisi",
    minLength: {
      value: 3,
      message: "Nama kurikulum minimal 3 karakter",
    },
    validate: {
      notOnlySpaces: (value: string) =>
        value.trim().length > 0 || "Nama kurikulum tidak boleh hanya spasi",
    },
  },
  tahunMulai: {
    required: "Tahun kurikulum wajib diisi",
    validate: {
      validFormat: (value: any) => {
        const str = String(value).trim();
        
        // Format 1: Single year (2024)
        if (/^\d{4}$/.test(str)) {
          const year = Number(str);
          const currentYear = new Date().getFullYear();
          
          if (year < 2000) return "Tahun tidak boleh kurang dari 2000";
          if (year > currentYear + 1) return `Tahun tidak boleh lebih dari ${currentYear + 1}`;
          
          return true;
        }
        
        // Format 2: Range year (2024/2025)
        if (/^\d{4}\/\d{4}$/.test(str)) {
          const [year1, year2] = str.split('/').map(Number);
          const currentYear = new Date().getFullYear();
          
          if (year1 < 2000) return "Tahun tidak boleh kurang dari 2000";
          if (year1 > currentYear + 1) return `Tahun tidak boleh lebih dari ${currentYear + 1}`;
          if (year2 !== year1 + 1) return "Format tahun harus n/n+1 (contoh: 2024/2025)";
          
          return true;
        }
        
        return "Format tahun tidak valid. Gunakan format: 2024 atau 2024/2025";
      },
    },
  },
};

// ========================================
// COMPONENT
// ========================================

export function KurikulumModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: KurikulumModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<KurikulumFormData>({
    mode: "onChange", // Validasi realtime
    defaultValues: {
      nama: "",
      tahunMulai: "",
    },
  });

  // Watch tahunMulai untuk menampilkan format n/n+1
  const tahunMulai = watch("tahunMulai");

  // Reset form saat modal dibuka/ditutup
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Handle form submission
  const handleFormSubmit = async (data: KurikulumFormData) => {
    // Parse tahun: jika format "2024/2025" ambil tahun pertama, jika "2024" langsung ambil
    const tahunValue = data.tahunMulai.includes('/') 
      ? Number(data.tahunMulai.split('/')[0]) 
      : Number(data.tahunMulai);
    
    await onSubmit(data.nama.trim(), tahunValue);
  };

  // Handle cancel
  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Layers size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Tambah Kurikulum
            </h2>
          </div>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Nama Kurikulum */}
          <div>
            <label
              htmlFor="nama"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nama Kurikulum <span className="text-red-500">*</span>
            </label>
            <input
              id="nama"
              type="text"
              {...register("nama", VALIDATION_RULES.nama)}
              placeholder="e.g., Kurikulum Sarjana K-24"
              disabled={submitting}
              className={`
                w-full px-4 py-2.5 rounded-lg border 
                text-black placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                disabled:bg-gray-50 disabled:cursor-not-allowed
                transition-all duration-200
                ${errors.nama ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            <p className="mt-1 text-xs text-gray-500">
              Masukkan nama kurikulum yang akan ditambahkan
            </p>
            {errors.nama && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                {errors.nama.message}
              </p>
            )}
          </div>

          {/* Tahun Kurikulum */}
          <div>
            <label
              htmlFor="tahunMulai"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Tahun Kurikulum <span className="text-red-500">*</span>
            </label>
            <input
              id="tahunMulai"
              type="text"
              {...register("tahunMulai", VALIDATION_RULES.tahunMulai)}
              placeholder="e.g., 2024 atau 2024/2025"
              disabled={submitting}
              className={`
                w-full px-4 py-2.5 rounded-lg border 
                text-black placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                disabled:bg-gray-50 disabled:cursor-not-allowed
                transition-all duration-200
                ${errors.tahunMulai ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            
            {/* Preview Format Tahun */}
            {tahunMulai && !errors.tahunMulai && (
              <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-xs text-indigo-700 font-medium">
                  ✓ Format valid: <span className="font-bold">
                    {tahunMulai.includes('/') 
                      ? tahunMulai 
                      : `${tahunMulai}/${Number(tahunMulai) + 1}`}
                  </span>
                </p>
              </div>
            )}
            
            <p className="mt-1.5 text-xs text-gray-500">
              Masukkan tahun kurikulum (contoh: 2024 atau 2024/2025)
            </p>
            {errors.tahunMulai && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                {errors.tahunMulai.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className={`
                flex-1 px-4 py-2.5 rounded-lg font-medium text-white
                transition-all duration-200
                ${
                  !isValid || submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-sm hover:shadow"
                }
              `}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}