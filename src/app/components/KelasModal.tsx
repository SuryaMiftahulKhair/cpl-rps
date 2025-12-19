"use client";
import { useState } from "react";
import { X, Save } from "lucide-react";

interface KelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { kode_mk: string; nama_mk: string; nama_kelas: string; sks: number }) => void;
  submitting: boolean;
}

export default function KelasModal({ isOpen, onClose, onSubmit, submitting }: KelasModalProps) {
  const [kodeMK, setKodeMK] = useState("");
  const [namaMK, setNamaMK] = useState("");
  const [namaKelas, setNamaKelas] = useState("");
  const [sks, setSks] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ kode_mk: kodeMK, nama_mk: namaMK, nama_kelas: namaKelas, sks: Number(sks) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Tambah Kelas Manual</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Matakuliah</label>
            <input 
              type="text" required
              value={kodeMK} onChange={e => setKodeMK(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Contoh: IF1234"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Matakuliah</label>
            <input 
              type="text" required
              value={namaMK} onChange={e => setNamaMK(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Contoh: Pemrograman Web"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
              <input 
                type="text" required
                value={namaKelas} onChange={e => setNamaKelas(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="A, B, C..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKS</label>
              <input 
                type="number" min="0" max="6" required
                value={sks} onChange={e => setSks(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Batal
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}