"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, ChevronLeft, Plus, Layers, Settings, Database, FolderKanban } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useParams, useRouter } from "next/navigation";

// --- TIPE DATA ---
// Tipe data untuk Ringkasan (Tabel Asli)
type PIRow = {
  area: string;
  piCode: string;
  iloCode: string;
  ilo: string;
  indicators: string[];
};

// --- Komponen Modal ---
// Modal "Kompleks" yang kakak kirim
import TambahPIRowModal from "@/app/components/TambahPIModal"; 
// Modal Manajemen (BARU)
import CplManagementModal from "@/app/components/CplManagementModal";
import AreaManagementModal from "@/app/components/AreaManagementModal";
import PiGroupManagementModal from "@/app/components/PiGroupManagementModal";

// Helper
const parseApiError = async (res: Response) => {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP Error ${res.status}`;
  } catch {
    return `HTTP Error ${res.status}`;
  }
};


// --- 1. KONTEN TAB VISI MISI (Tidak Berubah) ---
const VisiMisiContent = () => (
  <div className="p-6 lg:p-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Visi, Misi, dan Profil Lulusan</h2>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <Edit size={18} /> <span>Edit</span>
        </button>
        <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <ChevronLeft size={18} /> <span>Kembali</span>
        </button>
      </div>
    </div>
    <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
       <div className="space-y-3 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded" />
          Visi
        </h3>
        <p className="text-gray-700 leading-relaxed pl-3">
          Pusat unggulan dalam pendidikan, penelitian dan penerapan teknologi informasi berbasis jaringan komputer dan sistem
          cerdas berlandaskan Benua Maritim Indonesia tahun 2025
        </p>
      </div>
      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
           <div className="w-1 h-6 bg-indigo-600 rounded" />
           Misi
         </h3>
         <ol className="space-y-4 pl-3">
          {[
            "Menghasilkan lulusan yang memiliki sikap dan tata nilai yang baik, serta memiliki kompetensi di bidang teknologi informasi berbasis jaringan komputer dan sistem cerdas",
            "Menghasilkan karya-karya ilmiah dibidang teknologi informasi berbasis jaringan komputer dan sistem cerdas yang bermanfaat bagi masyarakat",
            "Menyebarluaskan teknologi berdaya guna bagi masyarakat melalui pengabdian kepada masyarakat",
            "Menjalin dan mempererat kerjasama dengan institusi terkait dalam dan luar negeri untuk meningkatkan kualitas pendidikan",
          ].map((t, i) => (
            <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
              <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </span>
              <span className="pt-0.5">{t}</span>
            </li>
          ))}
         </ol>
       </div>
    </div>
  </div>
);


// --- 2. KONTEN TAB PERFORMANCE INDICATOR (Refaktor) ---
const PITableContent = () => {
  const params = useParams();
  
  // --- PERBAIKAN UNTUK ERROR "kurikulum id tidak valid" ---
  // Parse the dynamic route param defensively and ensure we only accept
  // a positive integer. This avoids sending invalid values to the API.
  const kurikulumIdRaw = (params as any)?.id;
  const kurikulumIdStr = Array.isArray(kurikulumIdRaw) ? kurikulumIdRaw[0] : (kurikulumIdRaw ?? "");
  const kurikulumId = Number.isInteger(Number(kurikulumIdStr))
    ? parseInt(kurikulumIdStr as string, 10)
    : NaN;
  // ----------------------------------------------------

  const [rows, setRows] = useState<PIRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // State untuk semua modal
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [isCplModalOpen, setIsCplModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isPiGroupModalOpen, setIsPiGroupModalOpen] = useState(false);

  const loadPI = async () => {
    setLoading(true);
    setErr(null);
    try {
      if (!Number.isInteger(kurikulumId) || Number.isNaN(kurikulumId) || kurikulumId <= 0) {
        setRows([]);
        // Perbarui pesan error agar lebih jelas
        setErr(`Kurikulum ID tidak valid (Nilai: ${kurikulumIdRaw}). Harus bilangan bulat positif.`);
        return;
      }

      // Use the integer value when calling the API to avoid sending unexpected
      // strings (e.g. array or slugs) which the API will reject.
      const res = await fetch(`/api/kurikulum/${kurikulumId}/VMCPL`);
      if (!res.ok) throw new Error(await parseApiError(res));
      const json = await res.json();
      setRows(Array.isArray(json) ? json : json?.data ?? []);
    } catch (e: any) {
      console.error("Fetch PI error:", e);
      setErr(e?.message ?? "Gagal memuat data PI.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hanya jalankan loadPI jika kurikulumId valid
    if (kurikulumId && !Number.isNaN(kurikulumId)) { 
      void loadPI(); 
    }
  }, [kurikulumId]); // Dependency array diubah ke kurikulumId yang sudah di-parse
  
  // Fungsi ini akan me-refresh tabel ringkasan
  const handleManagementSuccess = () => {
    setIsCplModalOpen(false);
    setIsAreaModalOpen(false);
    setIsPiGroupModalOpen(false);
    setIsTambahModalOpen(false);
    loadPI(); 
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Performance Indicator for ILO Measurement</h2>
      </div>

      {/* --- TOMBOL MANAJEMEN BARU --- */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-3">Manajemen Data</h3>
        <div className="flex flex-wrap gap-3">
          {/* Tombol "Kompleks" dari modal kakak */}
          <button onClick={() => setIsTambahModalOpen(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm">
            <Plus size={18} /> <span>Tambah Baris (Kompleks)</span>
          </button>
          
          <div className="border-l border-gray-300 mx-2"></div>

          {/* Tombol Manajemen Data Master */}
          <button onClick={() => setIsCplModalOpen(true)} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm">
            <Database size={18} /> <span>Kelola CPL (ILO)</span>
          </button>
          <button onClick={() => setIsAreaModalOpen(true)} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm">
            <Layers size={18} /> <span>Kelola Assasment Area</span>
          </button>
           <button onClick={() => setIsPiGroupModalOpen(true)} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm">
            <FolderKanban size={18} /> <span>Kelola PI Group & Indikator</span>
          </button>
        </div>
      </div>

      {err && <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded">{err}</div>}

      {/* --- TABEL RINGKASAN ASLI --- */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
              <tr>
                <th className="w-32 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">Area</th>
                <th className="w-24 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">PI Code</th>
                <th className="w-24 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">ILO Code</th>
                <th className="px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">Intended Learning Outcomes</th>
                <th className="px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">Performance Indicators</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">Memuat data...</td></tr>
              ) : err ? (
                // Tampilkan error di dalam tabel juga jika loading selesai tapi ada error
                <tr><td colSpan={5} className="px-4 py-8 text-center text-red-600 text-sm">{err}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">Belum ada data PI.</td></tr>
              ) : (
                rows.map((item, idx) => (
                  <tr key={`${item.piCode}-${item.iloCode}-${idx}`} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {item.area}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-indigo-700">{item.piCode}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-green-700">{item.iloCode}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-700 max-w-md leading-relaxed text-sm">{item.ilo}</td>
                    <td className="px-4 py-4 text-gray-700 max-w-md leading-relaxed text-sm">
                      <ul className="list-disc list-inside space-y-1">
                        {item.indicators.map((indicator, i) => (
                          <li key={i} className="text-sm">{indicator}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL-MODAL MANAJEMEN --- */}
      {!Number.isNaN(kurikulumId) && (
        <>
          {/* Modal "Kompleks" (dari file kakak) */}
          <TambahPIRowModal
            isOpen={isTambahModalOpen}
            onClose={() => setIsTambahModalOpen(false)}
            onSubmitSuccess={handleManagementSuccess}
            kurikulumId={kurikulumId}
          />
          {/* Modal Manajemen CPL (BARU) */}
          <CplManagementModal
            isOpen={isCplModalOpen}
            onClose={() => setIsCplModalOpen(false)}
            onSuccess={handleManagementSuccess} 
            kurikulumId={kurikulumId}
          />
          {/* Modal Manajemen Area (BARU) */}
          <AreaManagementModal
            isOpen={isAreaModalOpen}
            onClose={() => setIsAreaModalOpen(false)}
            onSuccess={handleManagementSuccess}
            kurikulumId={kurikulumId}
          />
           {/* Modal Manajemen PI Group (BARU) */}
          <PiGroupManagementModal
            isOpen={isPiGroupModalOpen}
            onClose={() => setIsPiGroupModalOpen(false)}
            onSuccess={handleManagementSuccess}
            kurikulumId={kurikulumId}
          />
        </>
      )}
    </div>
  );
};


// --- KOMPONEN UTAMA PAGE (Hanya 2 Tab) ---
export default function VisiMisiCPLPage() {
  const [activeTab, setActiveTab] = useState<"visi_misi" | "pi_data">("visi_misi");

  return (
    <DashboardLayout>
      <div className="px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Layers size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kurikulum Program Studi</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola visi, misi, target CPL, dan performance indicator program studi</p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8">
        <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
          <div className="flex space-x-8 px-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("visi_misi")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeTab === "visi_misi"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Visi, Misi, Profil Lulusan
            </button>
            <button
              onClick={() => setActiveTab("pi_data")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeTab === "pi_data"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Performance Indicator
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-8">
        <div className="bg-gray-50 rounded-b-xl shadow-sm border-x border-b border-gray-200">
          {activeTab === "visi_misi" && <VisiMisiContent />}
          {activeTab === "pi_data" && <PITableContent />}
        </div>
      </div>
    </DashboardLayout>
  );
}