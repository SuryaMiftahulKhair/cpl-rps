// file: src/app/components/DosenModal.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { X, Loader2, Save } from "lucide-react";

interface DosenOption {
  username: string; // NIP
  nama: string;
}

interface DosenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nip: string; nama: string; posisi: string }) => void;
  submitting: boolean;
}

export default function DosenModal({ isOpen, onClose, onSubmit, submitting }: DosenModalProps) {
  // State untuk daftar pilihan dosen
  const [dosenOptions, setDosenOptions] = useState<DosenOption[]>([]);
  const [loadingDosen, setLoadingDosen] = useState(false);
  
  // State untuk data terpilih (agar nama otomatis terisi saat NIP dipilih)
  const [selectedNip, setSelectedNip] = useState("");

  // Fetch data dosen saat modal dibuka
  useEffect(() => {
    if (isOpen && dosenOptions.length === 0) {
      setLoadingDosen(true);
      fetch('/api/dosen/list')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setDosenOptions(data);
        })
        .catch(err => console.error("Gagal ambil dosen:", err))
        .finally(() => setLoadingDosen(false));
    }
    // Reset form saat dibuka
    if (isOpen) {
        setSelectedNip("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nip = formData.get("nip") as string;
    const posisi = formData.get("posisi") as string;

    // Cari nama dosen berdasarkan NIP yang dipilih
    const selectedDosen = dosenOptions.find(d => d.username === nip);
    const nama = selectedDosen ? selectedDosen.nama : "";

    if (nip && nama) {
      onSubmit({
        nip,
        nama,
        posisi: posisi || "Pengampu",
      });
    } else {
        alert("Silakan pilih dosen terlebih dahulu.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-slideUp">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Tambah Dosen Pengampu</h2>
          <button onClick={onClose} disabled={submitting} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Dropdown Pilih Dosen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Dosen <span className="text-red-500">*</span>
            </label>
            {loadingDosen ? (
                 <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                    <Loader2 size={16} className="animate-spin" /> Memuat daftar dosen...
                </div>
            ) : (
                <select 
                    name="nip" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white outline-none text-gray-900"
                    disabled={submitting}
                    value={selectedNip}
                    onChange={(e) => setSelectedNip(e.target.value)}
                >
                    <option value="" disabled>-- Pilih Nama Dosen --</option>
                    {dosenOptions.map((dosen) => (
                        <option key={dosen.username} value={dosen.username}>
                            {dosen.nama} ({dosen.username})
                        </option>
                    ))}
                </select>
            )}
            {dosenOptions.length === 0 && !loadingDosen && (
                <p className="text-xs text-red-500 mt-1">
                    Belum ada data user dengan role Dosen. Tambahkan user Dosen terlebih dahulu.
                </p>
            )}
          </div>

          {/* Input Posisi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Posisi</label>
            <select 
                name="posisi" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" 
                disabled={submitting}
            >
                <option value="Koordinator">Koordinator</option>
                <option value="Pengampu">Anggota Pengampu</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
            <button type="submit" disabled={submitting || !selectedNip} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}