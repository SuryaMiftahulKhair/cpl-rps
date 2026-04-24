"use client";

import { Suspense } from "react";
import { useCPLMatakuliah } from "@/hooks/useCPLMatakuliah";
import DashboardLayout from "@/app/components/DashboardLayout";
import { BarChart3, Filter, Calendar, BookOpen, Loader2 } from "lucide-react";
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

function LaporanCplMatakuliahContent() {
  const {
    semesterList,
    matakuliahList,
    uniqueYears,
    radarData,
    classDetails,
    loading,
    hasSearched,
    filterType,
    setFilterType,
    selectedYear,
    setSelectedYear,
    selectedSemesterId,
    setSelectedSemesterId,
    selectedCourseId,
    setSelectedCourseId,
    loadReport,
  } = useCPLMatakuliah();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* ================= HEADER ================= */}
        <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Laporan Capaian CPL Matakuliah
                </h1>
                <p className="text-sm text-gray-600">
                  Analisis performa capaian pembelajaran per matakuliah dan kelas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FILTER SECTION ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Filter Laporan
              </h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Matakuliah <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-sm bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium appearance-none cursor-pointer transition-all"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}>
                    <option value="">-- Pilih Matakuliah --</option>
                    {/* PERBAIKAN DI SINI: Penambahan ': any' dan pemanggilan 'kode_mk' dan 'nama' */}
                    {matakuliahList.map((course: any) => (
                      <option key={course.id} value={String(course.id)}>
                        {course.kode_mk || course.code || "-"} - {course.nama || course.name || "Tanpa Nama"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cakupan Data
                </label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-sm bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium appearance-none cursor-pointer transition-all"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}>
                    <option value="SEMUA">Semua Periode</option>
                    <option value="TAHUN">Per Tahun</option>
                    <option value="SEMESTER">Per Semester</option>
                  </select>
                </div>
              </div>

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
                    <option value="">-- Pilih Tahun --</option>
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-sm bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium appearance-none cursor-pointer transition-all"
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}>
                    <option value="">-- Pilih Semester --</option>
                    {semesterList.map((s: any) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.tahun} - {s.semester}
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
                  disabled={loading || !selectedCourseId || semesterList.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Tampilkan Laporan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT SECTION ================= */}
        {!hasSearched ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-20">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Filter size={36} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Data Ditampilkan
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Silakan pilih matakuliah, filter cakupan data dan periode, lalu
                klik tombol "Tampilkan Laporan" untuk melihat grafik dan analisis CPL
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ================= STATS CARDS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Kelas</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {classDetails.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total CPL Diukur</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {radarData.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Rata-rata Pencapaian
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {radarData.length > 0
                        ? (
                            radarData.reduce((acc: any, item: any) => acc + (item.prodi || 0), 0) /
                            radarData.length
                          ).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= CHART & BREAKDOWN ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Radar Capaian CPL Matakuliah
                  </h4>
                </div>
                <div className="p-6">
                  {radarData.length > 0 ? (
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius="75%" data={radarData}>
                          <PolarGrid stroke="#e5e7eb" strokeWidth={1.5} />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
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
                            name="Capaian Mata Kuliah"
                            dataKey="prodi"
                            stroke="#4f46e5"
                            fill="#4f46e5"
                            fillOpacity={0.4}
                            strokeWidth={3}
                          />
                          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                      <BarChart3 size={48} className="mb-3 opacity-20" />
                      <p className="text-sm font-medium">Data grafik tidak tersedia</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CPL BREAKDOWN - 2 columns */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
                  <h4 className="font-bold text-gray-900">Detail CPL</h4>
                </div>
                <div className="p-4 max-h-[468px] overflow-y-auto">
                  {radarData.length > 0 ? (
                    <div className="space-y-3">
                      {/* PERBAIKAN DI SINI: Penambahan ': any' */}
                      {radarData.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                          <span className="text-sm font-medium text-gray-700">
                            {item.subject}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.prodi >= 75 ? "bg-green-500" : item.prodi >= 60 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${Math.min(item.prodi, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900 w-10 text-right">
                              {item.prodi.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                       <p className="text-sm">Tidak ada data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= TABLE - Detail Kelas ================= */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Rincian Per Kelas
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Kelas
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                        Jumlah Peserta
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                        Rata-rata Pencapaian
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classDetails.length > 0 ? (
                      /* PERBAIKAN DI SINI: Penambahan ': any' */
                      classDetails.map((cls: any, idx: number) => {
                        const scoreValues = cls.scores ? Object.values(cls.scores) as number[] : [];
                        const avgScore = scoreValues.length > 0
                          ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1)
                          : 0;

                        return (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700 border border-gray-200">
                                {cls.class_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 text-center">
                              {cls.total_students || 0} Mhs
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">
                              {avgScore}%
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                  Number(avgScore) >= 75
                                    ? "bg-green-100 text-green-700"
                                    : Number(avgScore) >= 60
                                      ? "bg-yellow-100 text-yellow-700"
                                      : Number(avgScore) > 0 
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-500"
                                }`}>
                                {Number(avgScore) >= 75
                                  ? "Tercapai"
                                  : Number(avgScore) >= 60
                                    ? "Perlu Perbaikan"
                                    : Number(avgScore) > 0 
                                      ? "Kurang" 
                                      : "Belum Dinilai"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                          Tidak ada rincian data kelas untuk periode ini.
                        </td>
                      </tr>
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

export default function LaporanCplMatakuliahPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2
              className="animate-spin text-emerald-600"
              size={56}
              strokeWidth={2.5}
            />
            <p className="text-gray-500 font-bold tracking-widest animate-pulse uppercase">
              MENYIAPKAN LAPORAN MATAKULIAH...
            </p>
          </div>
        </div>
      }>
      <LaporanCplMatakuliahContent />
    </Suspense>
  );
}