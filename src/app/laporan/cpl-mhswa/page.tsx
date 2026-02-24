"use client";

import React, { Suspense } from "react"; // Tambah Suspense
import {
  X,
  Printer,
  Loader2,
  Search,
  Users,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  Filter,
  BarChart3,
  Target,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCPLMahasiswa } from "@/hooks/useCPLMahasiswa";

// ============================================================
// 1. KOMPONEN KONTEN UTAMA
// Pindahkan seluruh logika asli Kakak ke sini tanpa ubah apa pun
// ============================================================
function CPLMahasiswaContent() {
  // Panggil Hook (Isi hook ini yang bikin Vercel error kalau gak pake Suspense)
  const {
    semesterList,
    uniqueYears,
    filteredStudents,
    selectedStudent,
    studentCPLData,
    loading,
    loadingCPL,
    activeTab,
    setActiveTab,
    filterType,
    setFilterType,
    selectedYear,
    setSelectedYear,
    selectedSemesterId,
    setSelectedSemesterId,
    searchNim,
    setSearchNim,
    searchName,
    setSearchName,
    loadStudents,
    handleOpenCPL,
    handleCloseModal,
  } = useCPLMahasiswa();

  // Helper untuk format data Recharts
  const radarData = studentCPLData.map((item) => ({
    subject: item.code,
    value: item.nilai,
    fullMark: 100,
  }));
  const barData = studentCPLData.map((item) => ({
    name: item.code,
    nilai: item.nilai,
  }));

  // Calculate average
  const averageCPL =
    studentCPLData.length > 0
      ? (
          studentCPLData.reduce((sum, item) => sum + item.nilai, 0) /
          studentCPLData.length
        ).toFixed(1)
      : "0";

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col lg:flex-row">
        {/* ================= MAIN CONTENT ================= */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto min-h-screen bg-gray-50">
          {/* HEADER WITH GRADIENT */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    CPL Mahasiswa
                  </h1>
                  <p className="text-sm text-gray-600">
                    Analisis capaian pembelajaran individual mahasiswa
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FILTER SECTION - Enhanced ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Filter Data Mahasiswa
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
                  <select
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-sm bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium appearance-none cursor-pointer transition-all"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}>
                    <option value="SEMESTER">📅 Per Semester</option>
                    <option value="TAHUN">📆 1 Tahun Ajaran</option>
                    <option value="SEMUA">🌐 Keseluruhan</option>
                  </select>
                </div>

                {/* Dropdown 2: Konteks */}
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

                {/* Button */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider opacity-0 pointer-events-none">
                    Action
                  </label>
                  <button
                    onClick={loadStudents}
                    disabled={loading}
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
                        <span>Tampilkan Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= TABLE SECTION ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Daftar Mahasiswa
                </h2>
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                  {filteredStudents.length} Mahasiswa
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Search Inputs - Enhanced */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan NIM..."
                    value={searchNim}
                    onChange={(e) => setSearchNim(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan Nama..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                          No
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                          NIM
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                          Nama Mahasiswa
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-16">
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Users size={36} className="text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Belum Ada Data
                              </h3>
                              <p className="text-sm text-gray-500 max-w-sm">
                                Silakan pilih filter dan klik "Tampilkan Data"
                                untuk melihat daftar mahasiswa
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s, idx) => (
                          <tr
                            key={s.nim}
                            className="group hover:bg-indigo-50/40 transition-all duration-150">
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-500">
                                {idx + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                {s.nim}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900 text-sm">
                                {s.nama}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleOpenCPL(s)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                                <Award size={16} strokeWidth={2.5} />
                                Lihat CPL
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL (Info Sidebar) ================= */}
        <div className="hidden xl:block w-80 bg-white border-l border-gray-200 overflow-y-auto h-screen sticky top-0">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Panduan
            </h3>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2 text-sm">
                    Filter Periode
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Pilih cakupan data untuk melihat CPL mahasiswa berdasarkan
                    periode tertentu
                  </p>
                </div>
              </div>
            </div>

            {/* List Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Jenis Filter
              </h4>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">
                      Per Semester
                    </p>
                    <p className="text-xs text-gray-600">
                      CPL dari mata kuliah semester tertentu saja
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">
                      1 Tahun Ajaran
                    </p>
                    <p className="text-xs text-gray-600">
                      Akumulasi semester Ganjil & Genap dalam satu tahun
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">
                      Keseluruhan
                    </p>
                    <p className="text-xs text-gray-600">
                      Total akumulasi dari semua mata kuliah yang pernah diambil
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL DETAIL CPL ================= */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Award className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Capaian Pembelajaran Lulusan
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">
                        {selectedStudent.nama}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                        {selectedStudent.nim}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="p-2.5 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {loadingCPL ? (
                <div className="flex h-96 items-center justify-center">
                  <div className="text-center">
                    <Loader2
                      className="animate-spin text-indigo-600 mx-auto mb-4"
                      size={48}
                    />
                    <p className="text-sm font-medium text-gray-600">
                      Memuat data CPL...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Target
                            className="w-6 h-6 text-white"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Total CPL
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {studentCPLData.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <TrendingUp
                            className="w-6 h-6 text-white"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Rata-rata
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {averageCPL}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Award
                            className="w-6 h-6 text-white"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </p>
                          <p className="text-lg font-bold text-emerald-600">
                            {parseFloat(String(averageCPL)) >= 75
                              ? "Sangat Baik"
                              : parseFloat(String(averageCPL)) >= 60
                                ? "Baik"
                                : "Perlu Peningkatan"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart Tabs */}
                  <div className="flex justify-center">
                    <div className="bg-white p-1.5 rounded-lg border-2 border-gray-200 shadow-sm inline-flex">
                      <button
                        onClick={() => setActiveTab("radar")}
                        className={`px-5 py-2.5 text-sm font-bold rounded-md transition-all ${
                          activeTab === "radar"
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}>
                        📊 Radar Chart
                      </button>
                      <button
                        onClick={() => setActiveTab("bar")}
                        className={`px-5 py-2.5 text-sm font-bold rounded-md transition-all ${
                          activeTab === "bar"
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}>
                        📈 Bar Chart
                      </button>
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                      <h4 className="font-bold text-gray-900">
                        Visualisasi Data CPL
                      </h4>
                    </div>
                    <div className="p-6 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {activeTab === "radar" ? (
                          <RadarChart data={radarData}>
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
                              name="Nilai CPL"
                              dataKey="value"
                              stroke="#4f46e5"
                              fill="#4f46e5"
                              fillOpacity={0.5}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "8px 12px",
                              }}
                            />
                            <Legend />
                          </RadarChart>
                        ) : (
                          <BarChart
                            data={barData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: "#6b7280", fontSize: 12 }}
                            />
                            <YAxis
                              domain={[0, 100]}
                              tick={{ fill: "#6b7280", fontSize: 12 }}
                            />
                            <Tooltip
                              cursor={{ fill: "rgba(79, 70, 229, 0.05)" }}
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "8px 12px",
                              }}
                            />
                            <Bar
                              dataKey="nilai"
                              fill="#4f46e5"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Detail Table */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                      <h4 className="font-bold text-gray-900">
                        Detail Capaian Per CPL
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                              Kode
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                              Deskripsi CPL
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                              Nilai
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {studentCPLData.map((item, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 w-24">
                                <span className="font-mono font-bold text-indigo-700 text-sm bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                                  {item.code}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-700 leading-relaxed">
                                  {item.description}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center w-32">
                                <span className="text-2xl font-bold text-gray-900">
                                  {item.nilai}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center w-40">
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                    item.nilai >= 75
                                      ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200"
                                      : item.nilai >= 60
                                        ? "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200"
                                        : "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200"
                                  }`}>
                                  {item.nilai >= 75
                                    ? "✓ Sangat Baik"
                                    : item.nilai >= 60
                                      ? "⚠ Baik"
                                      : "✗ Perlu Ditingkatkan"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ============================================================
// 2. WRAPPER UTAMA (Penjaga Build Vercel)
// Hanya membungkus konten di atas agar Suspense bekerja
// ============================================================
export default function CPLMahasiswaPage() {
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
              MENYIAPKAN DATA LAPORAN...
            </p>
          </div>
        </div>
      }>
      <CPLMahasiswaContent />
    </Suspense>
  );
}
