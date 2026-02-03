"use client";

import { useState, FormEvent } from "react";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  Save, 
  ClipboardList,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronRight
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Data Types ---
interface JenisPenilaian {
  id: number;
  nama: string;
  basis: string;
  dipilih: boolean;
}

interface JPModalData {
  nama: string;
  basis: string;
  dipilih: boolean;
}

// --- Basis Penilaian Options ---
const BasisPenilaianOptions = [
  "Aktivitas Partisipatif",
  "Hasil Proyek",
  "Tugas",
  "Quiz",
  "Ujian Tengah Semester",
  "Ujian Akhir Semester"
];

// --- Modal Component ---
interface JPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JPModalData) => void;
  editMode?: boolean;
  initialData?: JPModalData;
}

function JenisPenilaianModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editMode = false,
  initialData 
}: JPModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newJPData: JPModalData = {
      nama: formData.get("namaPenilaian") as string,
      basis: formData.get("basisPenilaian") as string,
      dipilih: formData.get("dapatDipilih") === 'Ya', 
    };
    
    if (newJPData.nama && newJPData.basis) {
      onSubmit(newJPData);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ClipboardList size={20} className="text-indigo-600" />
              </div>
              <h2 id="modal-title" className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit' : 'Tambah'} Jenis Penilaian
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Nama Penilaian */}
            <div>
              <label 
                htmlFor="namaPenilaian" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Jenis Penilaian <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="namaPenilaian" 
                name="namaPenilaian" 
                required 
                defaultValue={initialData?.nama}
                placeholder="Contoh: Quiz, Tugas, UTS"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm 
                          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                          transition-all outline-none"
              />
            </div>

            {/* Basis Penilaian */}
            <div>
              <label 
                htmlFor="basisPenilaian" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Basis Penilaian <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  id="basisPenilaian" 
                  name="basisPenilaian" 
                  required 
                  defaultValue={initialData?.basis}
                  className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-xl text-sm 
                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                            transition-all outline-none appearance-none bg-white cursor-pointer"
                >
                  {BasisPenilaianOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronRight 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" 
                  size={18}
                />
              </div>
            </div>

            {/* Dapat Dipilih */}
            <div>
              <label 
                htmlFor="dapatDipilih" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Dapat Dipilih <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  id="dapatDipilih" 
                  name="dapatDipilih" 
                  required 
                  defaultValue={initialData?.dipilih ? "Ya" : "Tidak"}
                  className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-xl text-sm 
                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                            transition-all outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="Ya">Ya - Dapat dipilih oleh dosen</option>
                  <option value="Tidak">Tidak - Tidak dapat dipilih</option>
                </select>
                <ChevronRight 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" 
                  size={18}
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-blue-800">
                Jenis penilaian yang dapat dipilih akan muncul sebagai pilihan saat dosen membuat RPS.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button 
                type="button"
                onClick={onClose} 
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 
                          bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400
                          transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white 
                          bg-gradient-to-r from-indigo-600 to-blue-600 
                          hover:from-indigo-700 hover:to-blue-700
                          shadow-md hover:shadow-lg
                          transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Save size={18} />
                <span>{editMode ? 'Update' : 'Simpan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// --- Main Page Component ---
export default function JenisPenilaianPage() {
  const [data, setData] = useState<JenisPenilaian[]>([
    { id: 1, nama: "Tugas", basis: "Tugas", dipilih: true },
    { id: 2, nama: "Quiz", basis: "Quiz", dipilih: true },
    { id: 3, nama: "Mid Tes", basis: "Ujian Tengah Semester", dipilih: true },
    { id: 4, nama: "Final Tes", basis: "Ujian Akhir Semester", dipilih: true },
    { id: 5, nama: "Partisipasi", basis: "Aktivitas Partisipatif", dipilih: true },
    { id: 6, nama: "Observasi", basis: "Aktivitas Partisipatif", dipilih: true },
    { id: 7, nama: "Tes Tertulis", basis: "Quiz", dipilih: true },
    { id: 8, nama: "Praktikum", basis: "Tugas", dipilih: true },
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBasis, setFilterBasis] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter data based on search and filter
  const filteredData = data.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.basis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterBasis === "all" || item.basis === filterBasis;
    return matchesSearch && matchesFilter;
  });

  const handleAddJenisPenilaian = (newJPData: JPModalData) => {
    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
    
    const newJenis: JenisPenilaian = {
      id: maxId + 1,
      nama: newJPData.nama,
      basis: newJPData.basis,
      dipilih: newJPData.dipilih,
    };
    
    setData([newJenis, ...data]);
    setIsModalOpen(false);
  };

  // Get unique basis for filter
  const uniqueBasis = Array.from(new Set(data.map(item => item.basis)));

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Referensi</span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Jenis Penilaian</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <ClipboardList size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Jenis Penilaian
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola jenis-jenis penilaian yang tersedia untuk RPS Matakuliah
                </p>
              </div>
            </div>

            {/* Right: Add Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Tambah Data</span>
            </button>
          </div>
        </div>

        {/* ========== MAIN CARD ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          
          {/* Search and Filter Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search 
                    size={20} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan nama atau basis penilaian..."
                    className="w-full py-2.5 pl-11 pr-4 text-sm bg-white border-2 border-gray-300 rounded-xl 
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                              transition-all"
                  />
                </div>
              </div>

              {/* Filter Dropdown */}
              <div className="lg:w-64">
                <div className="relative">
                  <Filter 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <select
                    value={filterBasis}
                    onChange={(e) => setFilterBasis(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-10 text-sm bg-white border-2 border-gray-300 rounded-xl 
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                              transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Semua Basis Penilaian</option>
                    {uniqueBasis.map(basis => (
                      <option key={basis} value={basis}>{basis}</option>
                    ))}
                  </select>
                  <ChevronRight 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" 
                    size={18}
                  />
                </div>
              </div>
            </div>

            {/* Results Counter */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredData.length}</span>
              <span>dari</span>
              <span className="font-semibold text-gray-900">{data.length}</span>
              <span>jenis penilaian</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              
              {/* Table Head */}
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Penilaian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Basis Penilaian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Search size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                          {searchQuery 
                            ? "Tidak ada hasil yang sesuai dengan pencarian" 
                            : "Belum ada data jenis penilaian"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="group hover:bg-indigo-50/40 transition-all duration-150"
                    >
                      {/* No */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-500">
                          {index + 1}
                        </span>
                      </td>

                      {/* Nama Penilaian */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 text-base">
                          {item.nama}
                        </span>
                      </td>

                      {/* Basis Penilaian */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                          {item.basis}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        {item.dipilih ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg font-semibold text-sm border border-green-200">
                            <CheckCircle2 size={16} className="text-green-600" />
                            <span>Dapat Dipilih</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-lg font-semibold text-sm border border-red-200">
                            <XCircle size={16} className="text-red-600" />
                            <span>Tidak Aktif</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            className="p-2.5 text-indigo-600 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all group/btn"
                            title="Edit"
                          >
                            <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button 
                            className="p-2.5 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-all group/btn"
                            title="Hapus"
                          >
                            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{filteredData.length}</span> jenis penilaian
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <JenisPenilaianModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddJenisPenilaian}
      />
    </DashboardLayout>
  );
}