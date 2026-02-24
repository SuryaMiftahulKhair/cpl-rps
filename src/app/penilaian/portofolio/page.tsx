"use client";

import { useState, useEffect, Suspense } from "react"; // Tambah Suspense
import Link from "next/link";
import {
  Eye,
  Plus,
  RefreshCw,
  Loader2,
  Calendar,
  FolderOpen,
  ChevronRight,
  FileText,
  Award,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import TahunAjaranModal from "@/app/components/TahunAjaranModal";

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

interface TahunAjaran {
  id: number;
  tahun: string;
  semester: "GANJIL" | "GENAP";
}

// --- KOMPONEN KONTEN UTAMA ---
function PortofolioContent() {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tahunAjaran?page=1&limit=50");
      if (!res.ok) throw new Error(await parseApiError(res));
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json?.data ?? []);
      setSemesterList(data);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
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
    const optimisticItem: TahunAjaran = { id: optimisticId, ...data };
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

  const getSemesterColors = (semester: "GANJIL" | "GENAP") => {
    return semester === "GANJIL"
      ? {
          bg: "from-purple-50 to-indigo-50",
          border: "border-purple-200",
          text: "text-purple-700",
          badge: "bg-purple-500",
          hover: "hover:border-purple-400",
        }
      : {
          bg: "from-pink-50 to-rose-50",
          border: "border-pink-200",
          text: "text-pink-700",
          badge: "bg-pink-500",
          hover: "hover:border-pink-400",
        };
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">
            Penilaian
          </span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Portofolio</span>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <FolderOpen size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Portofolio Mahasiswa
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola dan monitoring portofolio per semester
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border-2 border-gray-200 font-semibold">
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />{" "}
                Refresh
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold">
                <Plus size={20} /> Tambah Semester
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 flex items-center gap-4">
            <div className="p-3 bg-indigo-500 rounded-xl">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase">
                Total Semester
              </p>
              <p className="text-3xl font-bold">{semesterList.length}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase">
                Semester Ganjil
              </p>
              <p className="text-3xl font-bold">{ganjilCount}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-200 flex items-center gap-4">
            <div className="p-3 bg-pink-500 rounded-xl">
              <Award size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-pink-600 uppercase">
                Semester Genap
              </p>
              <p className="text-3xl font-bold">{genapCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Pilih Semester
              </h2>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-100 rounded-2xl h-32"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesterList.map((semester) => {
                  const colors = getSemesterColors(semester.semester);
                  return (
                    <Link
                      key={semester.id}
                      href={`/penilaian/portofolio/${semester.id}`}
                      className="group block">
                      <div
                        className={`relative bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ${colors.hover} rounded-2xl p-6 transition-all h-full`}>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`${colors.badge} text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase`}>
                            {semester.semester}
                          </div>
                          <Eye size={20} className={colors.text} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {semester.tahun}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mb-4">
                          Tahun Ajaran {semester.tahun}
                        </p>
                        <div className="border-t-2 border-white/50 pt-4 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">
                            Lihat Portofolio
                          </span>
                          <ChevronRight size={16} className="text-indigo-600" />
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

// --- WRAPPER UTAMA ---
export default function PortofolioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-20 bg-gray-50">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      }>
      <PortofolioContent />
    </Suspense>
  );
}
