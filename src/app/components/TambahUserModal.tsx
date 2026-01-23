"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // Refresh data tabel setelah simpan
}

export default function TambahUserModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    password: "",
    role: "DOSEN", // Default role
  });

  if (!open) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        alert("Akun berhasil dibuat!");
        setFormData({ nama: "", username: "", password: "", role: "DOSEN" });
        onSuccess();
        onClose();
      } else {
        alert("Gagal: " + json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-gray-900 border-b pb-3">Tambah Akun Pengguna</h3>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nama Lengkap</label>
            <input
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none transition-all"
              placeholder="Masukkan Nama Lengkap"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Username / Email</label>
            <input
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none transition-all"
              placeholder="Contoh: budi123"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Role Pengguna</label>
            <select 
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none transition-all bg-white"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="ADMIN">Admin Program Studi</option>
              <option value="DOSEN">Dosen Pengampu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password Awal</label>
            <input
              type="password"
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none transition-all"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t mt-4">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border-2 font-bold text-gray-500 hover:bg-gray-50 transition-all">
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Simpan Akun
          </button>
        </div>
      </div>
    </div>
  );
}