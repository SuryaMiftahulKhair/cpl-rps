"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useForm } from "react-hook-form";
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
  bobot_to_cpl: number; // Tambahkan field ini
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
    <div className="flex items-center justify-between bg-slate-600 text-white px-4 py-3 rounded-t-lg no-print">
      <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
        {icon} {title}
      </h3>
      <div className="flex items-center gap-2">
        {action}
        {onEdit && (
          <button
            title="Edit"
            onClick={onEdit}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors">
            <Edit size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex py-2 border-b border-gray-100">
      <div className="w-1/3 font-semibold text-gray-900 text-sm uppercase">
        {label}
      </div>
      <div className="w-2/3 text-gray-900 text-sm">{String(value || "-")}</div>
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm no-print">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
          Total Bobot Penilaian (Target 100%)
        </span>
        <div className="flex items-center gap-2">
          {isComplete && <CheckCircle2 size={16} className="text-green-600" />}
          {isOverLimit && <AlertTriangle size={16} className="text-red-600" />}
          <span
            className={`text-lg font-black ${isOverLimit ? "text-red-600" : isComplete ? "text-green-600" : "text-indigo-600"}`}>
            {totalBobot}%
          </span>
        </div>
      </div>
      <div className="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
        <div
          className={`h-full transition-all duration-500 ease-out ${isOverLimit ? "bg-red-500" : isComplete ? "bg-green-500" : "bg-indigo-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-[11px] flex justify-between font-medium">
        <span className="text-slate-500 tracking-wide">
          SISA YANG HARUS DIALOKASIKAN: {sisaBobot}%
        </span>
        {isOverLimit && (
          <span className="text-red-600 animate-pulse font-bold uppercase">
            ⚠ Melebihi Batas Maksimal!
          </span>
        )}
        {isComplete && (
          <span className="text-green-600 font-bold uppercase tracking-widest">
            ✓ Bobot Sudah Ideal
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-red-100">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 text-center mb-2">
            Hapus Pertemuan?
          </h3>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Anda akan menghapus rencana pertemuan{" "}
            <span className="font-bold text-slate-700 underline">
              Minggu Ke-{pertemuan.pekan_ke}
            </span>
            . Bobot{" "}
            <span className="font-bold text-red-600">
              {pertemuan.bobot_cpmk}%
            </span>{" "}
            akan dikembalikan ke sisa alokasi.
          </p>
        </div>
        <div className="flex border-t">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 border-r transition-colors disabled:opacity-50">
            BATAL
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
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
    try {
      const res = await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`);
      const json = await res.json();
      if (json.success) setRpsData(json.data);
    } catch (err: any) {
      console.error(err);
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
      return <p className="text-gray-400 italic">Belum ada penyusun</p>;
    try {
      if (typeof rawData === "string" && rawData.startsWith("[")) {
        const parsed = JSON.parse(rawData);
        return (
          <div className="flex flex-col gap-1 mt-1">
            {parsed.map((nama: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-bold">{idx + 1}.</span>
                <span>{nama}</span>
              </div>
            ))}
          </div>
        );
      }
      return <p>{rawData}</p>;
    } catch (e) {
      return <p>{String(rawData)}</p>;
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

  // ✅ HANDLER SIMPAN CPMK DENGAN BOBOT DARI KODE TEMAN
  const handleSaveCpmk = async (formData: any) => {
    setIsSaving(true);
    try {
      const payload = {
        rps_id: Number(id_rps),
        kode_cpmk: formData.kode,
        deskripsi: formData.deskripsi,
        ik_id: formData.ik_id ? Number(formData.ik_id) : null,
        bobot: formData.bobot ? Number(formData.bobot) : 0, // Ambil bobot dari modal
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

  if (loading)
    return (
      <div className="flex justify-center h-screen items-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 uppercase">
            Detail RPS: {matkul.nama}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/rps/${id}/list/${id_matakuliah}?prodiId=${prodiId}`}
              className="bg-white border px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-gray-50 shadow-sm">
              <ChevronLeft size={16} /> Kembali
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-red-600 text-white px-4 py-2 rounded flex gap-2 shadow-md hover:bg-red-700 transition-all font-bold">
              <Printer size={16} /> Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-2">
            <InfoRow label="MATA KULIAH" value={matkul.nama} />
            <InfoRow label="KODE" value={matkul.kode_mk} />
            <InfoRow label="BOBOT" value={matkul.sks + " SKS"} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-black">
            <SectionHeader
              title="Otorisasi"
              onEdit={() => setEditingSection("otorisasi")}
            />
            <div className="p-4 space-y-3">
              <div className="pt-2 border-t border-gray-50">
                <strong className="text-gray-900 text-xs uppercase tracking-wider">
                  Ketua Program Studi:
                </strong>
                <p className="text-gray-900 text-sm font-medium mt-1">
                  {String(rpsData.nama_kaprodi || "-")}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <strong className="text-gray-900 text-xs uppercase tracking-wider">
                  Koordinator MK:
                </strong>
                <p className="text-gray-900 text-sm font-medium mt-1">
                  {String(rpsData.nama_koordinator || "-")}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <strong className="text-gray-900 text-xs uppercase tracking-wider">
                  Dosen Penyusun:
                </strong>
                <div className="text-gray-900 text-sm font-medium mt-1">
                  {renderPenyusunList(rpsData.nama_penyusun)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <SectionHeader
            title="CPMK"
            icon={<Target size={18} />}
            action={
              <button
                onClick={() => setShowCpmkModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs flex gap-1 font-bold shadow-sm">
                <Plus size={14} /> Tambah CPMK
              </button>
            }
          />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/30">
            {rpsData.cpmk?.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 uppercase w-fit">
                    {item.kode_cpmk}
                  </span>
                  {/* ✅ MENAMPILKAN BOBOT DI WEB DASHBOARD */}
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                    Bobot ke CPL: {item.bobot_to_cpl || 0}%
                  </span>
                </div>
                <p className="text-gray-900 text-sm leading-relaxed font-medium">
                  {item.deskripsi}
                </p>
                {item.ik && item.ik.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <CheckSquare size={12} /> Indikator Kinerja Terikat:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.ik.map((ik, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-medium">
                          [{ik.kode_ik}]
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <BobotProgressBar totalBobot={totalBobot} sisaBobot={sisaBobot} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-slate-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <ClipboardList size={18} /> Rencana Mingguan
            </h3>
            <button
              onClick={() =>
                isBobotValid && sisaBobot > 0
                  ? setShowPertemuanModal(true)
                  : alert("Bobot sudah 100%")
              }
              disabled={!isBobotValid || sisaBobot === 0}
              className={`px-4 py-2 rounded-lg text-sm flex gap-2 font-bold shadow-md transition-all ${!isBobotValid || sisaBobot === 0 ? "bg-slate-400" : "bg-green-600 hover:bg-green-700"}`}>
              <Plus size={16} /> Tambah Pertemuan
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center w-12">
                    Mg
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                    Kemampuan Akhir
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                    Indikator
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                    Metode
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center w-20">
                    Bobot
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center w-20">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-black">
                {rpsData.pertemuan?.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-slate-700">
                      {p.pekan_ke}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900 leading-relaxed">
                      {p.bahan_kajian}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 italic">
                      {p.pengalaman_belajar}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {p.waktu}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-indigo-600 bg-indigo-50/30">
                      {p.bobot_cpmk}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        title="HAPUS"
                        onClick={() => {
                          setPertemuanToDelete(p);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        {/* HALAMAN 3: CPMK & INDIKATOR (DENGAN KOLOM BOBOT) */}
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
                </th>{" "}
                {/* ✅ KOLOM BOBOT BARU DI PDF */}
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
                    {item.bobot_to_cpl || 0}% {/* ✅ NILAI BOBOT BARU DI PDF */}
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
