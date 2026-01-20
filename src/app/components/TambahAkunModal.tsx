"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TambahAkunModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    role: "dosen",
    password: "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 animate-fadeIn">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Tambah Akun Baru
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </button>
        </div>

        {/* FORM */}
        <div className="mt-4 space-y-4">

          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={form.nama}
            onChange={(e) =>
              setForm({ ...form, nama: e.target.value })
            }
          />

          <Input
            label="Email"
            placeholder="contoh@unhas.ac.id"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <div>
            <label className="text-sm text-gray-600">Role</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="admin">Admin Program Studi</option>
              <option value="dosen">Dosen</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="Password awal"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Simpan Akun
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Reusable Input ===== */

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}
