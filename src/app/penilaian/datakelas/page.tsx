"use client";

import { useState, useEffect, Suspense } from "react"; // Tambah Suspense
import Link from "next/link";
import {
  Eye,
  Loader2,
  RefreshCw,
  Plus,
  Calendar,
  BookOpen,
  GraduationCap,
  AlertCircle,
  X,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import TahunAjaranModal from "@/app/components/TahunAjaranModal";
import { TahunAjaran, Semester } from "./types";

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {}
  if (parsed?.error) {
    if (Array.isArray(parsed.error)) return parsed.error.join(", ");
    if (typeof parsed.error === "string") return parsed.error;
    if (Array.isArray(parsed.error.issues)) {
      return parsed.error.issues
        .map((i: any) => `${i.path[0]}: ${i.message}`)
        .join(", ");
    }
    return JSON.stringify(parsed.error);
  }
  return text || `HTTP ${res.status}`;
}

// ============================================================
// 1. KOMPONEN KONTEN UTAMA
// ============================================================
function DataNilaiContent() {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tahunAjaran?page=1&limit=50");
      if (!res.ok) throw new Error(await parseApiError(res));
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json?.data ?? []);
      setSemesterList(data);
    } catch (err: any) {
      setError(
        `Gagal mengambil data semester: ${err.message || "Error tidak diketahui"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTahunAjaran = async (data: {
    tahun: string;
    semester: "GANJIL" | "GENAP";
  }) => {
    setSubmitting(true);
    setError(null);
    const optimisticId = -Date.now();
    const optimisticItem: TahunAjaran = {
      id: optimisticId,
      tahun: data.tahun,
      semester: data.semester as Semester,
    };
    setSemesterList((prev) =>
      [optimisticItem, ...prev].sort(
        (a, b) =>
          b.tahun.localeCompare(a.tahun) ||
          b.semester.localeCompare(a.semester),
      ),
    );
    setIsModalOpen(false);

    try {
      const res = await fetch("/api/tahunAjaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await parseApiError(res));
      const created = await res.json();

      setSemesterList((prev) =>
        prev.map((item) => (item.id === optimisticId ? created : item)),
      );
    } catch (err: any) {
      console.error("Create Tahun Ajaran error:", err);
      setError(err?.message || "Gagal menambahkan. Coba lagi.");
      setSemesterList((prev) => prev.filter((p) => p.id !== optimisticId));
    } finally {
      setSubmitting(false);
    }
  };

  const ganjilCount = semesterList.filter(
    (s) => s.semester === "GANJIL",
  ).length;
  const genapCount = semesterList.filter((s) => s.semester === "GENAP").length;

  const getSemesterColors = (semester: Semester) => {
    return semester === Semester.GANJIL
      ? {
          bg: "from-blue-50 to-indigo-50",
          border: "border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-500",
          hover: "hover:border-blue-400",
        }
      : {
          bg: "from-emerald-50 to-green-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          badge: "bg-emerald-500",
          hover: "hover:border-emerald-400",
        };
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">
            Penilaian
          </span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Data Nilai</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <BookOpen size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Data Nilai Mahasiswa
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola dan monitoring data nilai per semester
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={isLoading || submitting}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                <RefreshCw
                  size={18}
                  className={isLoading ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading || submitting}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={20} strokeWidth={2.5} />
                <span>Tambah Semester</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-xl shadow-md">
                <Calendar size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
                  Total Semester
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {semesterList.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                <GraduationCap
                  size={24}
                  className="text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
                  Semester Ganjil
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {ganjilCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl shadow-md">
                <GraduationCap
                  size={24}
                  className="text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                  Semester Genap
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {genapCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Pilih Semester
                </h2>
                <p className="text-sm text-gray-600">
                  {isLoading
                    ? "Memuat data..."
                    : `${semesterList.length} semester tersedia`}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : semesterList.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={40} className="text-indigo-500 mx-auto mb-5" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Belum Ada Data Semester
                </h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">
                  Tambah Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesterList.map((semester) => {
                  const colors = getSemesterColors(semester.semester);
                  return (
                    <Link
                      key={semester.id}
                      href={`/penilaian/datakelas/${semester.id}`}
                      className="group block">
                      <div
                        className={`relative bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ${colors.hover} rounded-2xl p-6 hover:shadow-xl transition-all h-full overflow-hidden`}>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`${colors.badge} text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide`}>
                              {semester.semester}
                            </div>
                            <div className="p-2 bg-white/50 rounded-lg group-hover:bg-white transition-all">
                              <Eye size={20} className={colors.text} />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {semester.tahun}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium mb-4">
                            Tahun Ajaran {semester.tahun}
                          </p>
                          <div className="border-t-2 border-white/50 pt-4 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-600 uppercase">
                              Lihat Detail
                            </span>
                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                              <span>Buka</span>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <TahunAjaranModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTahunAjaran}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}

// ============================================================
// 2. WRAPPER UTAMA
// ============================================================
export default function DataNilaiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-20 bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-gray-500 font-bold animate-pulse uppercase">
              MENYIAPKAN DATA PENILAIAN...
            </p>
          </div>
        </div>
      }>
      <DataNilaiContent />
    </Suspense>
  );
}
