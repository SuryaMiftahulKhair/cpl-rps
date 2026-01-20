// file: src/app/components/KelasModal.tsx
"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";

// Tipe data untuk Mata Kuliah dari Database
interface MataKuliah {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number;
}

interface KelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Perhatikan: kita tambahkan matakuliah_id agar relasi database terjaga (opsional tapi disarankan)
  onSubmit: (data: { kode_mk: string; nama_mk: string; nama_kelas: string; sks: number; matakuliah_id?: number }) => void;
  submitting: boolean;
}

export default function KelasModal({ isOpen, onClose, onSubmit, submitting }: KelasModalProps) {
  // State Form
  const [selectedMkId, setSelectedMkId] = useState<string>(""); // ID untuk value select
  const [namaKelas, setNamaKelas] = useState("");
  const [sks, setSks] = useState(3);

  // State Data Master
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [isLoadingMk, setIsLoadingMk] = useState(false);

  // 1. Fetch Data Mata Kuliah saat Modal Dibuka
  useEffect(() => {
    if (isOpen) {
      setIsLoadingMk(true);
      fetch("/api/matakuliah")
        .then((res) => res.json())
        .then((json) => {
          setMkList(json.data || []);
        })
        .catch((err) => console.error("Gagal ambil MK:", err))
        .finally(() => setIsLoadingMk(false));
    } else {
      // Reset form saat tutup
      setSelectedMkId("");
      setNamaKelas("");
      setSks(3);
    }
  }, [isOpen]);

  // 2. Handle saat User Memilih Mata Kuliah dari Dropdown
  const handleMkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMkId(id);

    // Cari detail MK berdasarkan ID yang dipilih untuk auto-fill SKS
    const selectedMk = mkList.find((mk) => String(mk.id) === id);
    if (selectedMk) {
      setSks(selectedMk.sks);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi: Pastikan MK terpilih dari list
    const selectedMk = mkList.find((mk) => String(mk.id) === selectedMkId);
    
    if (!selectedMk) {
      alert("Silakan pilih Mata Kuliah yang terdaftar!");
      return;
    }

    onSubmit({ 
      kode_mk: selectedMk.kode_mk, 
      nama_mk: selectedMk.nama, 
      nama_kelas: namaKelas, 
      sks: Number(sks),
      matakuliah_id: selectedMk.id // Kirim ID untuk relasi backend
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Tambah Kelas</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Dropdown Mata Kuliah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Mata Kuliah <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                required
                value={selectedMkId} 
                onChange={handleMkChange}
                disabled={isLoadingMk}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-100"
              >
                <option value="">-- Pilih Matakuliah --</option>
                {mkList.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    {mk.kode_mk} - {mk.nama} (Smt {mk.semester})
                  </option>
                ))}
              </select>
              
              {/* Indikator Loading di pojok kanan select */}
              {isLoadingMk && (
                <div className="absolute right-8 top-2.5">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {mkList.length === 0 && !isLoadingMk && (
              <p className="text-xs text-red-500 mt-1">Data mata kuliah kosong atau gagal dimuat.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Input Nama Kelas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kelas <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" required
                value={namaKelas} onChange={e => setNamaKelas(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                placeholder="A, B, C..."
              />
            </div>

            {/* Input SKS (Auto-filled but editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKS</label>
              <input 
                type="number" min="0" max="6" required
                value={sks} onChange={e => setSks(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Batal
            </button>
            <button 
              type="submit" 
              disabled={submitting || isLoadingMk || !selectedMkId}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}