"use client";

import { useForm } from "react-hook-form";
import { X, Loader2, Key, Lock, User } from "lucide-react";

interface ResetPasswordFormData {
  password: string;
}

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: { id: number; nama: string } | null; // Data user yang akan direset
}

export default function ResetPasswordModal({
  open,
  onClose,
  user,
}: ResetPasswordModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetPasswordFormData>();

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!user) return;

    try {
      const res = await fetch(`/api/users/${user.id}/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        alert(`Password untuk ${user.nama} berhasil diperbarui!`);
        reset();
        onClose();
      } else {
        alert("Gagal: " + json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  if (!open || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header: Warna Amber (Khas Reset/Warning) */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-amber-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-lg shadow-md shadow-amber-100">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">
                  Reset Password
                </h3>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <User size={10} /> {user.nama}
                </p>
              </div>
            </div>
            <button
              title="Tutup"
              onClick={onClose}
              className="text-gray-400 hover:text-amber-600 p-1 hover:bg-white rounded-full transition-all">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Perhatian:</strong> Admin dapat mereset password dosen
                jika dosen lupa. Berikan password ini kepada dosen yang
                bersangkutan setelah disimpan.
              </p>
            </div>

            {/* Password Baru */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">
                <Lock size={12} className="text-amber-500" /> Password Baru
              </label>
              <input
                type="password"
                {...register("password", {
                  required: "Password wajib diisi",
                  minLength: { value: 6, message: "Minimal 6 karakter" },
                })}
                placeholder="Masukkan password baru..."
                className={`w-full border-2 rounded-xl p-3 focus:border-amber-500 focus:ring-4 focus:ring-amber-50 outline-none transition-all text-gray-900 placeholder:text-gray-300 ${
                  errors.password ? "border-red-300" : "border-slate-100"
                }`}
                autoFocus
              />
              {errors.password && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 disabled:opacity-50 flex justify-center items-center gap-3 transition-all shadow-xl shadow-amber-100 active:scale-95">
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Simpan Password Baru <Key size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
