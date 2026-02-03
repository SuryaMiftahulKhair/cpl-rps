"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  Eye,
  ChevronRight,
  AlertCircle,
  Clock,
  BookOpen,
  Layers,
} from "lucide-react";
import { Semester } from "@prisma/client";
import DashboardLayout from "@/app/components/DashboardLayout";
import AddRPSModal from "@/app/components/AddRPSModal";

// --- Data Types ---
interface RPSVersion {
  id: number;
  nomor_dokumen: string | null;
  tanggal_penyusunan: string;
  updatedAt: string;
  deskripsi: string | null;
  is_locked: boolean;
  tahun?: string;
  semester?: Semester;
}

interface MataKuliah {
  id: number;
  nama: string;
  kode_mk: string;
}

// --- Komponen Utama Page ---
export default function RPSVersionHistoryPage({
  params,
}: {
  params: Promise<{ id: string; id_matakuliah: string }>;
}) {
  const { id, id_matakuliah } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId");

  const [rpsList, setRpsList] = useState<RPSVersion[]>([]);
  const [matakuliah, setMatakuliah] = useState<MataKuliah | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!prodiId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch mata kuliah info
        const mkRes = await fetch(`/api/kurikulum/${id}/matakuliah/${id_matakuliah}?prodiId=${prodiId}`);
        if (mkRes.ok) {
          const mkJson = await mkRes.json();
          setMatakuliah(mkJson.data || mkJson);
        }

        // Fetch RPS list
        const resList = await fetch(
          `/api/rps/matakuliah/${id_matakuliah}?mode=history&prodiId=${prodiId}`,
        );
        const jsonList = await resList.json();
        if (jsonList.success) {
          setRpsList(jsonList.data);
        } else {
          setRpsList([]);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal memuat data");
        setRpsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, id_matakuliah, prodiId]);

  const handleAddRPS = async (data: any) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/rps/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matakuliah_id: id_matakuliah,
          keterangan: data.keterangan,
          is_new_ta: data.is_new_ta,
          new_tahun: data.new_tahun,
          new_semester: data.new_semester,
          prodiId: prodiId,
        }),
      });

      const json = await res.json();
      if (json.success) {
        router.push(
          `/rps/${id}/list/${id_matakuliah}/detail/${json.data.id}?prodiId=${prodiId}`,
        );
      } else {
        alert("Gagal: " + json.error);
      }
    } catch (err) {
      alert("Kesalahan sistem");
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteRPS = async (rpsId: number) => {
    const confirmDelete = confirm(
      "Apakah Anda yakin ingin menghapus versi RPS ini? Data yang dihapus tidak dapat dikembalikan.",
    );
    if (!confirmDelete) return;

    setIsDeleting(rpsId);
    try {
      const res = await fetch(`/api/rps/delete/${rpsId}?prodiId=${prodiId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        setRpsList((prev) => prev.filter((item) => item.id !== rpsId));
        alert("RPS berhasil dihapus.");
      } else {
        alert("Gagal menghapus: " + json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen flex-col gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={2.5} />
          <p className="text-gray-600 font-semibold text-lg">Memuat Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        
        {/* ========== BREADCRUMB ========== */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href={`/rps?prodiId=${prodiId}`} className="hover:text-indigo-600 transition-colors">
            RPS
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <Link href={`/rps/${id}/list?prodiId=${prodiId}`} className="hover:text-indigo-600 transition-colors">
            Daftar Mata Kuliah
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Riwayat Versi RPS</span>
        </div>

        {/* ========== HEADER ========== */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <FileText size={28} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {matakuliah?.nama || "Mata Kuliah"}
                </h1>
                <p className="text-sm text-gray-600 mb-3">
                  Kelola berbagai versi dokumen RPS
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {matakuliah?.kode_mk && (
                    <div className="inline-flex items-center gap-1.5 bg-white border-2 border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold">
                      <BookOpen size={14} />
                      <span>{matakuliah.kode_mk}</span>
                    </div>
                  )}
                  {prodiId && (
                    <div className="inline-flex items-center gap-1.5 bg-white border-2 border-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold">
                      <Layers size={14} />
                      <span>Prodi: {prodiId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/rps/${id}/list?prodiId=${prodiId}`}>
                <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold group">
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  <span>Kembali</span>
                </button>
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold group">
                <Plus size={18} strokeWidth={2.5} />
                <span>Buat RPS Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========== STATS CARD ========== */}
        {rpsList.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 mb-6 border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-xl shadow-md">
                <Clock size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
                  Total Versi RPS
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {rpsList.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========== ERROR ========== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ========== CONTENT ========== */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Daftar Dokumen RPS</h2>
                <p className="text-sm text-gray-600">
                  {rpsList.length} versi dokumen tersedia
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {rpsList.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <FileText size={40} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Belum Ada RPS
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Belum ada dokumen RPS yang dibuat untuk mata kuliah ini. Klik tombol "Buat RPS Baru" untuk memulai.
                </p>
              </div>
            ) : (
              /* RPS Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rpsList.map((item) => (
                  <div 
                    key={item.id}
                    className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                  >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-5">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="60" cy="20" r="30" fill="currentColor" className="text-indigo-600" />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="relative">
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg shadow-sm">
                            {item.nomor_dokumen || `Draft #${item.id}`}
                          </span>
                          <div className="inline-flex items-center gap-1 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-2 border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                            <Calendar size={12} />
                            TA {item.tahun || "-"}
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-base leading-tight min-h-[40px]">
                          {item.deskripsi || "Tanpa Keterangan"}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-3">
                          <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                            <span>{item.semester || "-"}</span>
                          </div>
                          <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                            <Clock size={12} />
                            <span>
                              {new Date(item.updatedAt).toLocaleDateString("id-ID", { 
                                day: "numeric", 
                                month: "short", 
                                year: "numeric" 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t-2 border-gray-100 pt-4 mt-4">
                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2">
                          <Link 
                            href={`/rps/${id}/list/${id_matakuliah}/detail/${item.id}?prodiId=${prodiId}`}
                            className="flex-1"
                          >
                            <button className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-all font-semibold text-sm group/btn">
                              <Eye size={16} />
                              <span>Lihat</span>
                              <ChevronRight 
                                size={14} 
                                className="group-hover/btn:translate-x-1 transition-transform"
                              />
                            </button>
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteRPS(item.id)}
                            disabled={isDeleting === item.id}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Hapus">
                            {isDeleting === item.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hover Border Glow */}
                    <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========== INFO TIP ========== */}
        {!loading && !error && rpsList.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">💡</span>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-2 text-sm">Informasi</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Setiap versi RPS mewakili periode tahun ajaran dan semester yang berbeda. Anda dapat melihat detail, mengedit, atau menghapus versi RPS sesuai kebutuhan.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddRPSModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddRPS}
        isProcessing={isProcessing}
      />
    </DashboardLayout>
  );
}