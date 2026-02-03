"use client";
import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";

interface MahasiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MahasiswaModal({ isOpen, onClose, onSuccess }: MahasiswaModalProps) {
  const [formData, setFormData] = useState({
    nim: "",
    nama: "",
    
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/mahasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      
      alert("Berhasil menambah mahasiswa!");
      onSuccess(); 
      onClose();   
      setFormData({ ...formData, nim: "", nama: "" }); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Tambah Mahasiswa</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-500"
              value={formData.nim}
              onChange={e => setFormData({...formData, nim: e.target.value})}
              placeholder="Contoh: D12121001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-500"
              value={formData.nama}
              onChange={e => setFormData({...formData, nama: e.target.value})}
              placeholder="Nama sesuai KTM"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}