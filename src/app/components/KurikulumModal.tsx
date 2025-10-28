// components/KurikulumModal.jsx
import type { FormEvent } from "react";
import { X, Layers } from "lucide-react";

interface KurikulumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (namaKurikulum: string) => Promise<void> | void;
  submitting?: boolean;
}



export function KurikulumModal({ isOpen, onClose, onSubmit, submitting }: KurikulumModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const namaKurikulum = formData.get("namaKurikulum");

    if (typeof namaKurikulum === "string" && namaKurikulum.trim()) {
      await onSubmit(namaKurikulum.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-slideUp">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Layers size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Tambah Kurikulum</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />{/* desain tetap */}
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="namaKurikulum"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nama Kurikulum <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="namaKurikulum"
              name="namaKurikulum"
              required
              placeholder="e.g., Kurikulum Sarjana K-24"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Masukkan nama kurikulum yang akan ditambahkan
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
