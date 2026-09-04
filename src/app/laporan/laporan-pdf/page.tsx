"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  FileText,
  Search,
  Loader2,
  ChevronRight,
  Eye,
  UploadCloud,
  X,
  Calendar
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { sortByText } from "@/../lib/sorting";

// Interface menyesuaikan database Prisma
interface Dokumen {
  id: number;
  judul: string;
  file_url: string;
  created_at: string;
}

function LaporanPdfContent() {
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfTerpilih, setPdfTerpilih] = useState<string | null>(null);
  
  // State untuk Modal Upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [judulUpload, setJudulUpload] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const sortedDokumenList = sortByText(dokumenList, (doc) => doc.judul);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/laporan/laporan-pdf?q=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      setDokumenList(json.data || []);
    } catch (err: any) {
      setError("Gagal memuat data laporan PDF.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUpload || !judulUpload) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", fileUpload);
    formData.append("judul", judulUpload);

    try {
      const res = await fetch("/api/laporan/laporan-pdf", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFileUpload(null);
        setJudulUpload("");
        loadData(); // Refresh daftar dokumen setelah sukses
      } else {
        const result = await res.json().catch(() => null);
        alert(result?.message || "Gagal mengunggah laporan PDF.");
      }
    } catch (error) {
      alert("Terjadi kesalahan pada server.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">
            Laporan
          </span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Laporan PDF</span>
        </div>

        {/* Hero Card */}
        <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <FileText size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Laporan PDF
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola dan pratinjau dokumen laporan CPL dalam format PDF •
                  <span className="font-semibold text-indigo-700 ml-1">
                    {dokumenList.length} Laporan Tersedia
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md font-semibold transition-colors">
                <UploadCloud size={20} strokeWidth={2.5} />
                <span>Upload Laporan PDF</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Grid Layout: Kiri (List), Kanan (Viewer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Kolom Kiri: Pencarian & Daftar Dokumen */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari judul laporan..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none shadow-sm text-gray-700 font-medium bg-white"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white p-4 rounded-xl border border-gray-200 h-24"></div>
                ))
              ) : dokumenList.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center flex flex-col items-center justify-center">
                  <FileText className="text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500 font-medium">Belum ada laporan.</p>
                </div>
              ) : (
                sortedDokumenList.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setPdfTerpilih(doc.file_url)}
                    className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                      pdfTerpilih === doc.file_url
                        ? "bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-200"
                        : "bg-white border-gray-200 hover:bg-indigo-50/50 hover:border-indigo-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pdfTerpilih === doc.file_url ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"}`}>
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold line-clamp-2 ${pdfTerpilih === doc.file_url ? "text-indigo-900" : "text-gray-900"}`}>
                        {doc.judul}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-2">
                        <Calendar size={12} />
                        <span>{new Date(doc.created_at || Date.now()).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <div className={`opacity-0 transition-opacity ${pdfTerpilih === doc.file_url ? "opacity-100 text-indigo-600" : "group-hover:opacity-100 text-gray-400"}`}>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kolom Kanan: PDF Viewer Area */}
          <div className="lg:col-span-8 bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden min-h-150 flex flex-col">
            <div className="border-b border-gray-200 bg-gray-50/50 p-4 px-6 flex items-center gap-3">
              <Eye className="text-gray-400" size={20} />
              <h2 className="font-semibold text-gray-700">
                {pdfTerpilih ? "Pratinjau Laporan" : "Area Pratinjau"}
              </h2>
            </div>
            
            <div className="flex-1 w-full h-full bg-gray-100/50 relative">
              {pdfTerpilih ? (
                <iframe 
                  src={pdfTerpilih} 
                  className="absolute inset-0 w-full h-full border-0"
                  title="PDF Viewer"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <div className="p-4 bg-gray-100 rounded-full mb-3">
                    <FileText size={48} className="text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-500">Pilih laporan di sebelah kiri untuk melihat isinya</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Upload PDF */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Upload Laporan PDF</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6">
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Laporan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Laporan CPL Semester 8"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    value={judulUpload}
                    onChange={(e) => setJudulUpload(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">File PDF</label>
                  <input
                    type="file"
                    required
                    accept="application/pdf"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                  {isUploading ? "Mengunggah..." : "Simpan Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function LaporanPdfPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-20 bg-gray-50">
          <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
        </div>
      }>
      <LaporanPdfContent />
    </Suspense>
  );
}