// file: src/app/components/KelasModal.tsx
"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";

// Tipe data RPS
interface RPS {
  id: number;
  tanggal_penyusunan: string;
  
}

// Tipe data Mata Kuliah (termasuk list RPS)
interface MataKuliah {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number;
  rps: RPS[]; // Array RPS
}

interface KelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Update tipe onSubmit untuk menerima rps_id
  onSubmit: (data: { kode_mk: string; nama_mk: string; nama_kelas: string; sks: number; matakuliah_id: number; rps_id: number | null }) => void;
  submitting: boolean;
}

export default function KelasModal({ isOpen, onClose, onSubmit, submitting }: KelasModalProps) {
  // State Form
  const [selectedMkId, setSelectedMkId] = useState<string>(""); 
  const [selectedRpsId, setSelectedRpsId] = useState<string>(""); // State baru untuk RPS
  const [namaKelas, setNamaKelas] = useState("");
  const [sks, setSks] = useState(3);

  // State Data Master
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [availableRps, setAvailableRps] = useState<RPS[]>([]); // List RPS filteran
  const [isLoadingMk, setIsLoadingMk] = useState(false);

  // 1. Fetch Data
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
      // Reset form
      setSelectedMkId("");
      setSelectedRpsId("");
      setNamaKelas("");
      setSks(3);
      setAvailableRps([]);
    }
  }, [isOpen]);

  // 2. Handle Ganti Mata Kuliah
  const handleMkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMkId(id);
    setSelectedRpsId(""); 

    const selectedMk = mkList.find((mk) => String(mk.id) === id);
    
    if (selectedMk) {
      setSks(selectedMk.sks);
      setAvailableRps(selectedMk.rps || []);
    } else {
      setAvailableRps([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMk = mkList.find((mk) => String(mk.id) === selectedMkId);
    
    if (!selectedMk) return alert("Pilih Mata Kuliah!");
    if (!selectedRpsId) return alert("Pilih RPS yang akan digunakan!");

    onSubmit({ 
      kode_mk: selectedMk.kode_mk, 
      nama_mk: selectedMk.nama, 
      nama_kelas: namaKelas, 
      sks: Number(sks),
      matakuliah_id: selectedMk.id,
      rps_id: Number(selectedRpsId) // Kirim ID RPS
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Tambah Kelas Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* 1. Pilih Mata Kuliah */}
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Matakuliah --</option>
                {mkList.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    {mk.kode_mk} - {mk.nama}
                  </option>
                ))}
              </select>
              {isLoadingMk && <div className="absolute right-8 top-2.5"><Loader2 size={16} className="animate-spin text-gray-400" /></div>}
            </div>
          </div>

          {/* 2. Pilih RPS (Muncul setelah MK dipilih) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Versi RPS <span className="text-red-500">*</span>
            </label>
            <select 
              required
              value={selectedRpsId} 
              onChange={(e) => setSelectedRpsId(e.target.value)}
              disabled={!selectedMkId || availableRps.length === 0}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-100 text-gray-500"
            >
              <option value="">-- Pilih RPS --</option>
              {availableRps.map((rps) => (
                <option key={rps.id} value={rps.id}>
                  {/* Format Tanggal Sederhana */}
                  RPS Tgl {new Date(rps.tanggal_penyusunan).toLocaleDateString("id-ID")} 
                </option>
              ))}
            </select>
            {selectedMkId && availableRps.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">Mata kuliah ini belum memiliki RPS.</p>
            )}
          </div>

          {/* 3. Detail Kelas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas <span className="text-red-500">*</span></label>
              <input 
                type="text" required
                value={namaKelas} onChange={e => setNamaKelas(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-500"
                placeholder="A, B, C..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKS</label>
              <input 
                type="number" min="0" required
                value={sks} onChange={e => setSks(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-gray-500"
                readOnly
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
            <button 
              type="submit" 
              disabled={submitting || !selectedRpsId}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}