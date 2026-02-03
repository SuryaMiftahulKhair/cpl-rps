import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  BarChart3, 
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  Download
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Props {
  params: { semester: string };
}

export const metadata = {
  title: "Rekap Metode Penilaian - Detail",
};

export default function SemesterDetail({ params }: Props) {
  const raw = params.semester;
  if (!raw) return notFound();

  // Convert slug back to display format: GANJIL-2025-2026 -> GANJIL 2025/2026
  const display = raw.replace(/-/g, " ").toUpperCase().replace(/ (\d{4}) (\d{4})$/, " $1/$2");
  
  // Extract semester type for color coding
  const isGanjil = display.toUpperCase().includes("GANJIL");
  const colors = isGanjil
    ? {
        bg: "from-blue-50 to-indigo-50",
        border: "border-blue-200",
        text: "text-blue-700",
        badge: "bg-blue-500"
      }
    : {
        bg: "from-orange-50 to-amber-50",
        border: "border-orange-200",
        text: "text-orange-700",
        badge: "bg-orange-500"
      };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/laporan/rekap-metode" className="hover:text-indigo-600 transition-colors">
            Rekap Kuisioner
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Detail Semester</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <BarChart3 size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Rekap Metode Penilaian
                </h1>
                <p className="text-sm text-gray-600">
                  Detail hasil kuisioner pembelajaran semester {display}
                </p>
              </div>
            </div>

            {/* Right: Back Button */}
            <div className="flex items-center gap-3">
              <Link href="/laporan/rekap-metode">
                <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group">
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Kembali</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ========== SEMESTER INFO CARD ========== */}
        <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 mb-6 border-2 ${colors.border} shadow-sm`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 ${colors.badge} rounded-xl shadow-md`}>
              <Calendar size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Semester Aktif
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {display}
              </p>
            </div>
          </div>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Responden */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Users size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Responden
              </p>
            </div>
            <p className="text-3xl font-bold text-indigo-900">0</p>
            <p className="text-xs text-indigo-600 mt-1">Mahasiswa</p>
          </div>

          {/* Total Kuisioner */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Kuisioner
              </p>
            </div>
            <p className="text-3xl font-bold text-blue-900">0</p>
            <p className="text-xs text-blue-600 mt-1">Total Soal</p>
          </div>

          {/* Response Rate */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                Response Rate
              </p>
            </div>
            <p className="text-3xl font-bold text-green-900">0%</p>
            <p className="text-xs text-green-600 mt-1">Partisipasi</p>
          </div>

          {/* Rata-rata Nilai */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Award size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Rata-rata
              </p>
            </div>
            <p className="text-3xl font-bold text-amber-900">0.0</p>
            <p className="text-xs text-amber-600 mt-1">Skor Kepuasan</p>
          </div>
        </div>

        {/* ========== MAIN CONTENT AREA ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Main Content (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Rekap Metode Penilaian */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BarChart3 size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Rekap Metode Penilaian</h3>
                    <p className="text-sm text-gray-600">
                      Hasil analisis kuisioner pembelajaran
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Empty State / Coming Soon */}
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <BarChart3 size={40} className="text-indigo-500" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Data Akan Segera Tersedia
                  </h4>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                    Tabel atau grafik rekap metode penilaian untuk semester {display} akan ditampilkan di sini.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                      <FileText size={18} />
                      Lihat Sample Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-600" />
                  Grafik Analisis
                </h3>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Grafik Visualisasi</p>
                  <p className="text-sm text-gray-500">
                    Chart akan ditampilkan di area ini
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar (1 column) */}
          <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">Quick Actions</h3>
                  <p className="text-indigo-200 text-sm">
                    Aksi cepat untuk semester ini
                  </p>
                </div>

                <div className="space-y-2">
                  <button className="w-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 font-semibold py-3 rounded-xl hover:bg-white hover:text-indigo-700 transition-all shadow-lg flex justify-center items-center gap-2 group">
                    <Download size={18} strokeWidth={2.5} />
                    <span>Export PDF</span>
                  </button>

                  <button className="w-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 font-semibold py-3 rounded-xl hover:bg-white hover:text-indigo-700 transition-all shadow-lg flex justify-center items-center gap-2 group">
                    <FileText size={18} strokeWidth={2.5} />
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                Informasi Semester
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Periode</span>
                  <span className="font-semibold text-gray-900">{display}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Aktif
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Total MK</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Dosen</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
              </div>
            </div>

            {/* Notice Card */}
            <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm mb-1">
                    Catatan Penting
                  </h4>
                  <p className="text-xs text-amber-800">
                    Pastikan semua data kuisioner telah terverifikasi sebelum melakukan export laporan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}