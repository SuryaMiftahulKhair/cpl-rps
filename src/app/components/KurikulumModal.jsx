// components/KurikulumModal.jsx
import { X, Save } from "lucide-react";

export default function KurikulumModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const namaKurikulum = formData.get('namaKurikulum');
    
    // Simple validation
    if (namaKurikulum.trim()) {
        onSubmit(namaKurikulum);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300">
      
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 scale-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Tambah Data Kurikulum</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Form) */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="namaKurikulum" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Kurikulum
            </label>
            <input
              type="text"
              id="namaKurikulum"
              name="namaKurikulum"
              required
              placeholder="Contoh: Kurikulum Sarjana K-23"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Modal Footer (Action Buttons) */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              <Save size={16} /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}