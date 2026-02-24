"use client";

import React, { Suspense } from "react"; // Tambahkan Suspense
import {
  Loader2,
  Filter,
  BarChart3,
  Search,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useCPLProdi } from "@/hooks/useCPLProdi";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ============================================================
// 1. KOMPONEN KONTEN UTAMA
// Pindahkan seluruh logika asli Kakak ke sini tanpa ubah apa pun
// ============================================================
function LaporanCplProdiContent() {
  const {
    semesterList,
    uniqueYears,
    radarData,
    courseList,
    loading,
    hasSearched,
    filterType,
    setFilterType,
    selectedYear,
    setSelectedYear,
    selectedSemesterId,
    setSelectedSemesterId,
    loadReport,
  } = useCPLProdi();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Laporan Capaian CPL Prodi
                </h1>
                <p className="text-sm text-gray-600">
                  Analisis performa capaian pembelajaran lulusan program studi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FILTER SECTION - Enhanced Design ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Filter Laporan
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dropdown 1: Tipe Filter */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cakupan Data
                </label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-sm bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium appearance-none cursor-pointer transition-all"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}>
                    <option value="SEMESTER">📅 Per Semester</option>
                    <option value="TAHUN">
                      📆 1 Tahun Ajaran (Ganjil + Genap)
                    </option>
                    <option value="SEMUA">🌐 Keseluruhan (Semua Data)</option>
                  </select>
                </div>
              </div>

              {/* Dropdown 2: Konteks (Dinamis) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {filterType === "TAHUN"
                    ? "Pilih Tahun"
                    : filterType === "SEMESTER"
                      ? "Pilih Semester"
                      : "Periode"}
                </label>

                {filterType === "SEMUA" ? (
                  <div className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-sm bg-gray-50 text-gray-500 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Semua Data Terpilih
                  </div>
                ) : filterType === "TAHUN" ? (
                  <select
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-sm bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium appearance-none cursor-pointer transition-all"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}>
                    {uniqueYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-sm bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium appearance-none cursor-pointer transition-all"
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}>
                    {semesterList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.semester} {s.tahun}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tombol Search */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider opacity-0 pointer-events-none">
                  Action
                </label>
                <button
                  onClick={loadReport}
                  disabled={loading || semesterList.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  {loading ? (
                    <>
                      <Loader2
                        className="animate-spin"
                        size={18}
                        strokeWidth={2.5}
                      />
                      <span>Memuat...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} strokeWidth={2.5} />
                      <span>Tampilkan Laporan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT SECTION ================= */}
        {!hasSearched ? (
          /* Empty State - Enhanced */
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-20">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Filter size={36} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Data Ditampilkan
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Silakan pilih filter cakupan data dan periode, lalu klik tombol
                "Tampilkan Laporan" untuk melihat grafik dan analisis CPL
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ================= STATS CARDS - Top Summary ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Total MK */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <BookOpen className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                      Total Mata Kuliah
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {courseList.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Total CPL */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Award className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                      Total CPL Diukur
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {radarData.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Avg Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <TrendingUp
                      className="w-7 h-7 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                      Rata-rata Capaian
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {radarData.length > 0
                        ? (
                            radarData.reduce(
                              (sum, r) => sum + (r.prodi || 0),
                              0,
                            ) / radarData.length
                          ).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= CHART & DETAIL ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* RADAR CHART - 3 columns */}
              <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Peta Capaian Pembelajaran Lulusan
                    </h3>
                    <span className="inline-flex items-center gap-1.5 bg-linear-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {filterType === "SEMUA"
                        ? "ALL TIME"
                        : filterType === "TAHUN"
                          ? selectedYear
                          : "SEMESTER"}
                    </span>
                  </div>
                </div>

                {/* Chart Content */}
                <div className="p-6">
                  {radarData.length > 0 ? (
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius="75%" data={radarData}>
                          <PolarGrid stroke="#e5e7eb" strokeWidth={1.5} />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{
                              fill: "#374151",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                          />

                          <Radar
                            name="Target"
                            dataKey="target"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.15}
                            strokeWidth={2}
                          />
                          <Radar
                            name="Capaian Prodi"
                            dataKey="prodi"
                            stroke="#4f46e5"
                            fill="#4f46e5"
                            fillOpacity={0.4}
                            strokeWidth={3}
                          />

                          <Legend
                            wrapperStyle={{ paddingTop: "20px" }}
                            iconType="circle"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              padding: "8px 12px",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                      <BarChart3 size={48} className="mb-3 opacity-20" />
                      <p className="text-sm font-medium">
                        Data grafik tidak tersedia
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CPL BREAKDOWN - 2 columns */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    Detail CPL
                  </h3>
                </div>

                {/* Content - Scrollable List */}
                <div className="p-4 max-h-[468px] overflow-y-auto">
                  <div className="space-y-3">
                    {radarData.length > 0 ? (
                      radarData.map((item, idx) => {
                        const achievement = item.prodi || 0;
                        const target = item.target || 0;
                        const percentage =
                          target > 0 ? (achievement / target) * 100 : 0;

                        return (
                          <div
                            key={idx}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm mb-1">
                                  {item.subject}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-600">
                                    Capaian:{" "}
                                    <span className="font-bold text-indigo-600">
                                      {achievement.toFixed(1)}%
                                    </span>
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-600">
                                    Target:{" "}
                                    <span className="font-bold text-red-600">
                                      {target}%
                                    </span>
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                                  percentage >= 100
                                    ? "bg-green-100 text-green-700"
                                    : percentage >= 75
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}>
                                {percentage >= 100
                                  ? "✓"
                                  : percentage >= 75
                                    ? "⚠"
                                    : "✗"}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  percentage >= 100
                                    ? "bg-green-500"
                                    : percentage >= 75
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Award size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Tidak ada data CPL</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= TABLE - Modern Design ================= */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Rincian Kontribusi Mata Kuliah
                </h4>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        Kode MK
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        Mata Kuliah
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        Kelas
                      </th>
                      {/* Header Dinamis CPL */}
                      {radarData.map((r) => (
                        <th
                          key={r.subject}
                          className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 min-w-20">
                          {r.subject}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {courseList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3 + radarData.length}
                          className="px-6 py-16">
                          <div className="flex flex-col items-center justify-center text-center">
                            <BookOpen
                              size={48}
                              className="text-gray-300 mb-3"
                            />
                            <p className="text-sm font-medium text-gray-500">
                              Tidak ada data mata kuliah
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      courseList.map((c, idx) => (
                        <tr
                          key={idx}
                          className="group hover:bg-indigo-50/40 transition-all duration-150">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {c.code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900 text-sm">
                              {c.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {c.class_name}
                            </span>
                          </td>
                          {radarData.map((r) => {
                            const val = c.scores[r.subject];
                            return (
                              <td
                                key={r.subject}
                                className="px-4 py-4 text-center">
                                {val ? (
                                  <span
                                    className={`inline-flex items-center justify-center min-w-[50px] px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                      val >= 75
                                        ? "bg-linear-to-r from-green-50 to-green-100 text-green-700 border-green-200"
                                        : val >= 50
                                          ? "bg-linear-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200"
                                          : "bg-linear-to-r from-red-50 to-red-100 text-red-700 border-red-200"
                                    }`}>
                                    {val.toFixed(0)}
                                  </span>
                                ) : (
                                  <span className="text-gray-300 text-sm">
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ============================================================
// 2. WRAPPER UTAMA (Penyedia Suspense Boundary)
// Hanya membungkus konten di atas agar proses Build Vercel Sukses
// ============================================================
export default function LaporanCplProdiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2
              className="animate-spin text-indigo-600"
              size={56}
              strokeWidth={2.5}
            />
            <p className="text-gray-500 font-bold tracking-widest animate-pulse uppercase">
              MENYIAPKAN LAPORAN PRODI...
            </p>
          </div>
        </div>
      }>
      <LaporanCplProdiContent />
    </Suspense>
  );
}
