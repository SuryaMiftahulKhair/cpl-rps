"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Edit,
  Target,
  Loader2,
  Printer,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CheckSquare,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Layers,
  Calendar,
  Award,
  FileText,
  Users,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- IMPORT MODAL KOMPONEN ---
import CpmkModal from "@/app/components/detail-rps/CpmkModal";
import PertemuanModal from "@/app/components/detail-rps/PertemuanModal";
import OtorisasiModal from "@/app/components/detail-rps/OtorisasiModel";

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface Pertemuan {
  id: number;
  pekan_ke: number;
  bahan_kajian: string;
  pengalaman_belajar: string;
  waktu: string;
  bobot_cpmk: number;
}

interface CPMK {
  id: number;
  kode_cpmk: string;
  deskripsi: string;
  bobot_to_cpl: number;
  ik?: Array<{
    kode_ik: string;
    deskripsi: string;
  }>;
}

interface RPSData {
  id: number;
  nama_penyusun: string;
  nama_koordinator: string;
  nama_kaprodi: string;
  kurikulum_nama?: string;
  cpmk: CPMK[];
  pertemuan: Pertemuan[];
  available_iks: any[];
  matakuliah: {
    nama: string;
    kode_mk: string;
    sks: string;
  };
}

// ==========================================
// HELPER COMPONENTS
// ==========================================
function SectionHeader({ title, icon, onEdit, action }: any) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl no-print shadow-sm">
      <h3 className="font-bold text-base flex items-center gap-2 uppercase tracking-wide">
        {icon} {title}
      </h3>
      <div className="flex items-center gap-2">
        {action}
        {onEdit && (
          <button
            title="Edit"
            onClick={onEdit}
            className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <Edit size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex py-3 border-b border-gray-100 last:border-0">
      <div className="w-1/3 font-bold text-gray-700 text-sm uppercase tracking-wide">
        {label}
      </div>
      <div className="w-2/3 text-gray-900 text-sm font-medium">{String(value || "-")}</div>
    </div>
  );
}

function BobotProgressBar({
  totalBobot,
  sisaBobot,
}: {
  totalBobot: number;
  sisaBobot: number;
}) {
  const percentage = Math.min((totalBobot / 100) * 100, 100);
  const isOverLimit = totalBobot > 100;
  const isComplete = totalBobot === 100;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 mb-6 shadow-sm no-print">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          <Award size={18} className="text-indigo-600" />
          Total Bobot Penilaian (Target 100%)
        </span>
        <div className="flex items-center gap-2">
          {isComplete && <CheckCircle2 size={20} className="text-green-600" strokeWidth={2.5} />}
          {isOverLimit && <AlertTriangle size={20} className="text-red-600" strokeWidth={2.5} />}
          <span
            className={`text-2xl font-black ${isOverLimit ? "text-red-600" : isComplete ? "text-green-600" : "text-indigo-600"}`}>
            {totalBobot}%
          </span>
        </div>
      </div>
      <div className="relative w-full bg-gray-100 rounded-full h-5 overflow-hidden border-2 border-gray-200 shadow-inner">
        <div
          className={`h-full transition-all duration-500 ease-out shadow-sm ${isOverLimit ? "bg-gradient-to-r from-red-500 to-red-600" : isComplete ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-indigo-500 to-blue-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-3 text-xs flex justify-between font-semibold">
        <span className="text-gray-600 tracking-wide">
          SISA ALOKASI: <span className="text-indigo-600 font-bold">{sisaBobot}%</span>
        </span>
        {isOverLimit && (
          <span className="text-red-600 animate-pulse font-bold uppercase flex items-center gap-1">
            <AlertTriangle size={14} /> Melebihi Batas!
          </span>
        )}
        {isComplete && (
          <span className="text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={14} /> Bobot Ideal
          </span>
        )}
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  pertemuan,
  isDeleting,
}: any) {
  if (!isOpen || !pertemuan) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto border-4 border-red-100">
            <AlertTriangle className="text-red-600" size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-gray-900 text-center mb-2">
            Hapus Pertemuan?
          </h3>
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            Anda akan menghapus rencana pertemuan{" "}
            <span className="font-bold text-gray-900">
              Minggu Ke-{pertemuan.pekan_ke}
            </span>
            . Bobot{" "}
            <span className="font-bold text-red-600">
              {pertemuan.bobot_cpmk}%
            </span>{" "}
            akan dikembalikan ke sisa alokasi.
          </p>
        </div>
        <div className="flex border-t-2 border-gray-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 border-r-2 border-gray-100 transition-all disabled:opacity-50">
            BATAL
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting ? (
              <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
            ) : (
              "YA, HAPUS"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DetailRPSPage({
  params,
}: {
  params: Promise<{ id: string; id_matakuliah: string; id_rps: string }>;
}) {
  const { id, id_matakuliah, id_rps } = use(params);
  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId");

  const [rpsData, setRpsData] = useState<RPSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPertemuanModal, setShowPertemuanModal] = useState(false);
  const [showCpmkModal, setShowCpmkModal] = useState(false);
  const [dosenList, setDosenList] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pertemuanToDelete, setPertemuanToDelete] = useState<Pertemuan | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const totalBobot = useMemo(() => {
    if (!rpsData?.pertemuan) return 0;
    return rpsData.pertemuan.reduce(
      (sum, p) => sum + (Number(p.bobot_cpmk) || 0),
      0,
    );
  }, [rpsData?.pertemuan]);

  const sisaBobot = useMemo(() => Math.max(0, 100 - totalBobot), [totalBobot]);
  const isBobotValid = useMemo(() => totalBobot <= 100, [totalBobot]);

  const fetchRPSData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`);
      const json = await res.json();
      if (json.success) {
        setRpsData(json.data);
      } else {
        setError(json.error || "Gagal memuat data RPS");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prodiId) {
      fetchRPSData();
      const fetchDosen = async () => {
        const res = await fetch(`/api/users/dosen?prodiId=${prodiId}`);
        const json = await res.json();
        if (json.success) setDosenList(json.data);
      };
      fetchDosen();
    }
  }, [id_rps, prodiId]);

  const renderPenyusunList = (rawData: any) => {
    if (!rawData)
      return <p className="text-gray-400 italic text-sm">Belum ada penyusun</p>;
    try {
      if (typeof rawData === "string" && rawData.startsWith("[")) {
        const parsed = JSON.parse(rawData);
        return (
          <div className="flex flex-col gap-1.5 mt-2">
            {parsed.map((nama: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="font-bold text-indigo-600">{idx + 1}.</span>
                <span className="text-gray-900 font-medium">{nama}</span>
              </div>
            ))}
          </div>
        );
      }
      return <p className="text-sm text-gray-900 font-medium">{rawData}</p>;
    } catch (e) {
      return <p className="text-sm text-gray-900 font-medium">{String(rawData)}</p>;
    }
  };

  const handleSaveOtorisasi = async (formData: any) => {
    setIsSaving(true);
    try {
      const listPenyusun = (formData.penyusun || [])
        .map((p: any) => p.nama)
        .filter((n: string) => n && n.trim() !== "");
      const payload = {
        section: "otorisasi",
        data: {
          nama_penyusun: JSON.stringify(listPenyusun),
          nama_koordinator: formData.koordinator || "",
          nama_kaprodi: formData.kaprodi || "",
        },
      };
      const res = await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal simpan");
      await fetchRPSData();
      setEditingSection(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePertemuan = async (formData: any) => {
    const bBaru = Number(formData.bobot_nilai);
    if (!isBobotValid || bBaru > sisaBobot) {
      alert(`❌ Gagal! Sisa alokasi bobot hanya ${sisaBobot}%.`);
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/rps/pertemuan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rps_id: Number(id_rps),
          pekan_ke: Number(formData.pekan_ke),
          bobot_nilai: bBaru,
        }),
      });
      if (!res.ok) throw new Error("Gagal simpan");
      await fetchRPSData();
      setShowPertemuanModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCpmk = async (formData: any) => {
    setIsSaving(true);
    try {
      const payload = {
        rps_id: Number(id_rps),
        kode_cpmk: formData.kode,
        deskripsi: formData.deskripsi,
        ik_id: formData.ik_id ? Number(formData.ik_id) : null,
        bobot: formData.bobot ? Number(formData.bobot) : 0,
        prodiId: prodiId,
      };

      const res = await fetch("/api/rps/cpmk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan CPMK");

      await fetchRPSData();
      setShowCpmkModal(false);
    } catch (error: any) {
      alert("Kesalahan: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePertemuan = async () => {
    if (!pertemuanToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/rps/pertemuan/${pertemuanToDelete.id}?prodiId=${prodiId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        await fetchRPSData();
        setDeleteDialogOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen flex-col gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={2.5} />
          <p className="text-gray-600 font-semibold text-lg">Memuat Data RPS...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!rpsData) return null;
  const matkul = rpsData.matakuliah;

  return (
    <DashboardLayout>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #pdf-area,
          #pdf-area * {
            visibility: visible !important;
          }
          #pdf-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
          .no-print,
          nav,
          aside,
          button,
          header {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
          .pdf-page {
            page-break-after: always;
            display: block !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1px solid black !important;
          }
          th,
          td {
            border: 1px solid black !important;
            padding: 8px !important;
            color: black !important;
          }
          th {
            background-color: #f2f2f2 !important;
            font-weight: bold !important;
          }
        }
      `}</style>

      {/* --- DASHBOARD WEB VIEW --- */}
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen no-print">
        
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
          <Link href={`/rps/${id}/list/${id_matakuliah}?prodiId=${prodiId}`} className="hover:text-indigo-600 transition-colors">
            Riwayat Versi
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Detail RPS</span>
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
                  {matkul.nama}
                </h1>
                <p className="text-sm text-gray-600 mb-3">
                  Rencana Pembelajaran Semester
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 bg-white border-2 border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    <BookOpen size={14} />
                    <span>{matkul.kode_mk}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-white border-2 border-emerald-200 text-emerald-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    <Award size={14} />
                    <span>{matkul.sks} SKS</span>
                  </div>
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
              <Link href={`/rps/${id}/list/${id_matakuliah}?prodiId=${prodiId}`}>
                <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold group">
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  <span>Kembali</span>
                </button>
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold group">
                <Printer size={18} strokeWidth={2.5} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

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

        {/* ========== INFO MATA KULIAH & OTORISASI ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Info Mata Kuliah */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-gray-100">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BookOpen size={20} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Informasi Mata Kuliah</h3>
            </div>
            <div className="space-y-1">
              <InfoRow label="MATA KULIAH" value={matkul.nama} />
              <InfoRow label="KODE" value={matkul.kode_mk} />
              <InfoRow label="BOBOT" value={matkul.sks + " SKS"} />
            </div>
          </div>

          {/* Otorisasi */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <SectionHeader
              title="Otorisasi"
              icon={<Users size={20} />}
              onEdit={() => setEditingSection("otorisasi")}
            />
            <div className="p-6 space-y-4">
              <div>
                <strong className="text-gray-700 text-xs uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Ketua Program Studi
                </strong>
                <p className="text-gray-900 text-sm font-semibold ml-3.5">
                  {String(rpsData.nama_kaprodi || "-")}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <strong className="text-gray-700 text-xs uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Koordinator Mata Kuliah
                </strong>
                <p className="text-gray-900 text-sm font-semibold ml-3.5">
                  {String(rpsData.nama_koordinator || "-")}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <strong className="text-gray-700 text-xs uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Dosen Penyusun
                </strong>
                <div className="ml-3.5">
                  {renderPenyusunList(rpsData.nama_penyusun)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== CPMK SECTION ========== */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden mb-6">
          <SectionHeader
            title="Capaian Pembelajaran (CPMK)"
            icon={<Target size={20} />}
            action={
              <button
                onClick={() => setShowCpmkModal(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all">
                <Plus size={16} strokeWidth={2.5} /> Tambah CPMK
              </button>
            }
          />
          <div className="p-6 bg-gray-50/50">
            {rpsData.cpmk && rpsData.cpmk.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rpsData.cpmk.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all">
                    
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-5">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="60" cy="20" r="30" fill="currentColor" className="text-indigo-600" />
                      </svg>
                    </div>

                    <div className="relative">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-white text-xs bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1.5 rounded-lg shadow-sm uppercase">
                          {item.kode_cpmk}
                        </span>
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border-2 border-emerald-200">
                          Bobot: {item.bobot_to_cpl || 0}%
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm leading-relaxed font-medium min-h-[60px]">
                        {item.deskripsi}
                      </p>
                      {item.ik && item.ik.length > 0 && (
                        <div className="mt-4 pt-4 border-t-2 border-gray-100">
                          <p className="text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
                            <CheckSquare size={14} /> Indikator Kinerja
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.ik.map((ik, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                                {ik.kode_ik}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover Border Glow */}
                    <div className="absolute inset-0 border-2 border-indigo-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Target size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Belum Ada CPMK
                </h3>
                <p className="text-sm text-gray-500">
                  Klik tombol "Tambah CPMK" untuk mulai menambahkan capaian pembelajaran.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========== BOBOT PROGRESS BAR ========== */}
        <BobotProgressBar totalBobot={totalBobot} sisaBobot={sisaBobot} />

        {/* ========== RENCANA MINGGUAN ========== */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-base uppercase tracking-wide flex items-center gap-2">
              <ClipboardList size={20} strokeWidth={2.5} /> Rencana Pembelajaran Mingguan
            </h3>
            <button
              onClick={() =>
                isBobotValid && sisaBobot > 0
                  ? setShowPertemuanModal(true)
                  : alert("Bobot sudah mencapai 100% atau melebihi batas!")
              }
              disabled={!isBobotValid || sisaBobot === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${
                !isBobotValid || sisaBobot === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}>
              <Plus size={16} strokeWidth={2.5} /> Tambah Pertemuan
            </button>
          </div>
          <div className="overflow-x-auto">
            {rpsData.pertemuan && rpsData.pertemuan.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase text-center w-16">
                      Mg
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">
                      Kemampuan Akhir
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">
                      Indikator & Kriteria
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">
                      Metode
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase text-center w-24">
                      Bobot
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase text-center w-20">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rpsData.pertemuan.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-gray-900">
                        {p.pekan_ke}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 leading-relaxed font-medium">
                        {p.bahan_kajian}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 italic leading-relaxed">
                        {p.pengalaman_belajar}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {p.waktu}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border-2 border-indigo-200 font-bold text-sm">
                          {p.bobot_cpmk}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          title="Hapus Pertemuan"
                          onClick={() => {
                            setPertemuanToDelete(p);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 bg-gray-50">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <ClipboardList size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Belum Ada Pertemuan
                </h3>
                <p className="text-sm text-gray-500">
                  Klik tombol "Tambah Pertemuan" untuk mulai merencanakan pembelajaran mingguan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========== INFO TIP ========== */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">💡</span>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2 text-sm">Informasi</h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Pastikan total bobot penilaian mencapai 100% sebelum mengekspor dokumen RPS. 
                Setiap pertemuan harus memiliki alokasi bobot yang jelas untuk memenuhi standar akreditasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {editingSection === "otorisasi" && (
        <OtorisasiModal
          isOpen={true}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveOtorisasi}
          isSaving={isSaving}
          dosenList={dosenList}
          initialData={rpsData}
        />
      )}
      <CpmkModal
        isOpen={showCpmkModal}
        onClose={() => setShowCpmkModal(false)}
        onSave={handleSaveCpmk}
        isSaving={isSaving}
        availableIks={rpsData.available_iks}
        nextNo={rpsData.cpmk.length + 1}
      />
      <PertemuanModal
        isOpen={showPertemuanModal}
        onClose={() => setShowPertemuanModal(false)}
        onSave={handleSavePertemuan}
        isSaving={isSaving}
        cpmkList={rpsData.cpmk}
        nextPekan={rpsData.pertemuan.length + 1}
        isEdit={false}
        rubrikList={[]}
      />
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeletePertemuan}
        pertemuan={pertemuanToDelete}
        isDeleting={isDeleting}
      />

      {/* ============================================================
      --- AREA KHUSUS PDF (TAMPILAN BERSIH ISI RPS) ---
      ============================================================ */}
      <div id="pdf-area" className="hidden print:block bg-white p-0 text-black">
        {/* HALAMAN 1: SAMPUL */}
        <div className="pdf-sampul flex flex-col items-center justify-center text-center min-h-[95vh] border-4 border-double border-black m-4">
          <h1 className="text-3xl font-black uppercase mb-2">
            RENCANA PEMBELAJARAN SEMESTER (RPS)
          </h1>
          <div className="w-24 h-1 bg-black mb-6"></div>
          <h2 className="text-xl font-bold uppercase mb-12 px-10">
            MATA KULIAH: {matkul.nama} ({matkul.kode_mk})
          </h2>
          <div className="my-10">
            <img
              src="/logo-unhas.png"
              alt="Logo UNHAS"
              width="220"
              className="mx-auto"
            />
          </div>
          <div className="mt-auto mb-10 text-lg font-bold uppercase leading-tight">
            UNIVERSITAS HASANUDDIN
            <br />
            FAKULTAS TEKNIK
            <br />
            PRODI TEKNIK INFORMATIKA
            <br />
            TAHUN {new Date().getFullYear()}
          </div>
        </div>

        {/* HALAMAN 2: OTORISASI & KURIKULUM */}
        <div className="pdf-page p-[20mm]">
          <h2 className="font-bold border-b-2 border-black pb-1 mb-6 uppercase text-lg">
            I. KURIKULUM & PENGESAHAN
          </h2>
          <div className="mb-8">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-black p-3 bg-gray-50 w-1/3 font-bold uppercase text-xs">
                    Kurikulum
                  </td>
                  <td className="border border-black p-3 text-sm">
                    {rpsData?.kurikulum_nama || "K23"} - Berbasis OBE
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-3 bg-gray-50 font-bold uppercase text-xs">
                    Mata Kuliah
                  </td>
                  <td className="border border-black p-3 text-sm font-bold">
                    {matkul.nama} ({matkul.kode_mk})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-bold uppercase text-center mb-4 text-sm underline">
            OTORISASI / PENGESAHAN
          </h3>
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-xs uppercase w-1/3">
                  Dosen Penyusun
                </th>
                <th className="border border-black p-2 text-xs uppercase w-1/3">
                  Koordinator MK
                </th>
                <th className="border border-black p-2 text-xs uppercase w-1/3">
                  Ketua Prodi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-32">
                <td className="border border-black p-3 text-left align-top text-[11px]">
                  {renderPenyusunList(rpsData.nama_penyusun)}
                </td>
                <td className="border border-black p-3 align-bottom text-[11px] font-bold uppercase">
                  {String(rpsData.nama_koordinator || "-")}
                </td>
                <td className="border border-black p-3 align-bottom text-[11px] font-bold uppercase">
                  {String(rpsData.nama_kaprodi || "-")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* HALAMAN 3: CPMK & INDIKATOR */}
        <div className="pdf-page p-[20mm]">
          <h2 className="font-bold border-b-2 border-black pb-1 mb-6 uppercase text-lg">
            II. CAPAIAN PEMBELAJARAN (CPMK) & INDIKATOR
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-xs uppercase w-[10%] text-center">
                  Kode
                </th>
                <th className="border border-black p-2 text-xs uppercase w-[40%]">
                  Deskripsi CPMK
                </th>
                <th className="border border-black p-2 text-xs uppercase w-[40%]">
                  Indikator Kinerja (IK)
                </th>
                <th className="border border-black p-2 text-xs uppercase w-[10%]">
                  Bobot
                </th>
              </tr>
            </thead>
            <tbody>
              {rpsData.cpmk?.map((item) => (
                <tr key={item.id}>
                  <td className="border border-black p-3 font-bold text-center text-sm">
                    {item.kode_cpmk}
                  </td>
                  <td className="border border-black p-3 text-[11px] leading-relaxed">
                    {item.deskripsi}
                  </td>
                  <td className="border border-black p-3 text-[10px] leading-tight">
                    {item.ik && item.ik.length > 0 ? (
                      item.ik.map((ik, idx) => (
                        <div key={idx} className="mb-2">
                          <span className="font-bold">[{ik.kode_ik}]</span>{" "}
                          {ik.deskripsi}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">
                        Tidak ada IK terikat
                      </span>
                    )}
                  </td>
                  <td className="border border-black p-3 text-center font-bold text-sm">
                    {item.bobot_to_cpl || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* HALAMAN 4: RENCANA MINGGUAN */}
        <div className="pdf-page p-[20mm]">
          <h2 className="font-bold border-b-2 border-black pb-1 mb-6 uppercase text-lg">
            III. RENCANA PEMBELAJARAN MINGGUAN
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-[10px] uppercase">
                <th className="border border-black p-2 w-[5%] text-center">
                  Mg
                </th>
                <th className="border border-black p-2 w-[25%]">
                  Kemampuan Akhir
                </th>
                <th className="border border-black p-2 w-[40%]">
                  Indikator & Kriteria
                </th>
                <th className="border border-black p-2 w-[20%]">Metode</th>
                <th className="border border-black p-2 w-[10%] text-center">
                  Bobot
                </th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {rpsData.pertemuan?.map((p) => (
                <tr key={p.id}>
                  <td className="border border-black p-2 text-center font-bold">
                    {p.pekan_ke}
                  </td>
                  <td className="border border-black p-2">{p.bahan_kajian}</td>
                  <td className="border border-black p-2 italic">
                    {p.pengalaman_belajar}
                  </td>
                  <td className="border border-black p-2 text-black">
                    {p.waktu}
                  </td>
                  <td className="border border-black p-2 text-center font-bold">
                    {p.bobot_cpmk}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold text-xs">
                <td
                  colSpan={4}
                  className="border border-black p-2 text-right uppercase">
                  Total Bobot Penilaian
                </td>
                <td className="border border-black p-2 text-center font-black">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}