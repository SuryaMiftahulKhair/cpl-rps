"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TambahUserModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4">

        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
          Tambah Akun Pengguna
        </h3>

        <div className="space-y-3 text-sm text-gray-900">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Nama Lengkap"
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Email"
          />

          <select className="w-full border rounded-lg px-3 py-2">
            <option>Admin</option>
            <option>Dosen</option>
          </select>

          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Password Awal"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100"
          >
            Batal
          </button>

          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
