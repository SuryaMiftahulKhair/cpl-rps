// VisiMisiCPLPage.jsx (atau tsx)
"use client";

import { useState } from "react";
import { Edit, Trash2, ChevronLeft, Plus, Layers } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// Placeholder data for the CPL Target Table
const cplData = [
  {
    no: 1,
    kelompok: "Pengetahuan",
    kode: "CPL 1",
    cpl: "Memiliki dasar pengetahuan Teknik Informatika yang meliputi teori dan konsep dasar dari Ilmu Komputer...",
    lo: "Have the knowledge of fundamental in Computing Science that includes basic theory and concepts...",
  },
  {
    no: 2,
    kelompok: "Pengetahuan",
    kode: "CPL 2",
    cpl: "Memiliki pengetahuan kewirausahaan, pengetahuan terhadap dasar-dasar pemanfaatan teknologi...",
    lo: "Have the knowledge of basic entrepreneurship, full technology stack and web development.",
  },
];

// --- Visi Misi Tab Content ---
const VisiMisiContent = () => (
  <div className="p-6 lg:p-8">
    {/* Header dan Aksi */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
        Visi, Misi, dan Profil Lulusan
      </h2>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <Edit size={18} />
          <span>Edit</span>
        </button>
        <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <ChevronLeft size={18} />
          <span>Kembali</span>
        </button>
      </div>
    </div>

    {/* Konten Visi Misi */}
    <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
      {/* Visi */}
      <div className="space-y-3 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded"></div>
          Visi
        </h3>
        <p className="text-gray-700 leading-relaxed pl-3">
          Pusat unggulan dalam pendidikan, penelitian dan penerapan teknologi informasi 
          berbasis jaringan komputer dan sistem cerdas berlandaskan Benua Maritim Indonesia 
          tahun 2025
        </p>
      </div>

      {/* Misi */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded"></div>
          Misi
        </h3>
        <ol className="space-y-4 pl-3">
          <li className="flex gap-3 text-gray-700 leading-relaxed">
            <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </span>
            <span className="pt-0.5">
              Menghasilkan lulusan yang memiliki sikap dan tata nilai yang baik, 
              serta memiliki kompetensi di bidang teknologi informasi berbasis 
              jaringan komputer dan sistem cerdas
            </span>
          </li>
          <li className="flex gap-3 text-gray-700 leading-relaxed">
            <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </span>
            <span className="pt-0.5">
              Menghasilkan karya-karya ilmiah dibidang teknologi informasi berbasis 
              jaringan komputer dan sistem cerdas yang bermanfaat bagi masyarakat
            </span>
          </li>
          <li className="flex gap-3 text-gray-700 leading-relaxed">
            <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </span>
            <span className="pt-0.5">
              Menyebarluaskan teknologi berdaya guna bagi masyarakat melalui 
              pengabdian kepada masyarakat
            </span>
          </li>
          <li className="flex gap-3 text-gray-700 leading-relaxed">
            <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
              4
            </span>
            <span className="pt-0.5">
              Menjalin dan mempererat kerjasama dengan institusi terkait dalam 
              dan luar negeri untuk meningkatkan kualitas pendidikan
            </span>
          </li>
        </ol>
      </div>
    </div>
  </div>
);

// --- CPL Data Table Tab Content ---
const CPLTableContent = () => (
  <div className="p-6 lg:p-8">
    {/* Header dan Aksi */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
          Data Target CPL Prodi
        </h2>
        <span className="bg-indigo-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-sm">
          80
        </span>
      </div>

      <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
        <Plus size={18} />
        <span>Tambah Baru</span>
      </button>
    </div>

    {/* Tabel CPL */}
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
            <tr>
              <th className="w-20 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                No
              </th>
              <th className="w-36 px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                Kelompok
              </th>
              <th className="w-24 px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                Kode
              </th>
              <th className="px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                CPL (Capaian Pembelajaran Lulusan)
              </th>
              <th className="px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                LO (Learning Outcome)
              </th>
              <th className="w-28 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {cplData.map((item, index) => (
              <tr
                key={item.no}
                className={`hover:bg-indigo-50/30 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="px-4 py-4 text-center text-gray-600 font-medium">
                  {item.no}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {item.kelompok}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-bold text-indigo-700">{item.kode}</span>
                </td>
                <td className="px-4 py-4 text-gray-700 max-w-md leading-relaxed text-sm">
                  {item.cpl}
                </td>
                <td className="px-4 py-4 text-gray-600 max-w-md leading-relaxed text-sm">
                  {item.lo}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-150 group"
                      title="Edit"
                    >
                      <Edit size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150 group"
                      title="Hapus"
                    >
                      <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Pagination atau Info Tambahan */}
    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
      <span>Menampilkan 2 dari 80 data</span>
      <div className="flex gap-2">
        <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Sebelumnya
        </button>
        <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Selanjutnya
        </button>
      </div>
    </div>
  </div>
);

// --- Komponen Utama VMCPL ---
export default function VisiMisiCPLPage() {
  const [activeTab, setActiveTab] = useState("visi_misi");

  return (
    <DashboardLayout>
      {/* Main Title Area */}
      <div className="px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Layers size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Kurikulum Program Studi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola visi, misi, dan target CPL program studi
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 lg:px-8">
        <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
          <div className="flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab("visi_misi")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium ${
                activeTab === "visi_misi"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Visi, Misi, Profil Lulusan
            </button>
            <button
              onClick={() => setActiveTab("cpl_data")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium ${
                activeTab === "cpl_data"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Target CPL Prodi
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="bg-gray-50 rounded-b-xl shadow-sm border-x border-b border-gray-200">
          {activeTab === "visi_misi" && <VisiMisiContent />}
          {activeTab === "cpl_data" && <CPLTableContent />}
        </div>
      </div>
    </DashboardLayout>
  );
}