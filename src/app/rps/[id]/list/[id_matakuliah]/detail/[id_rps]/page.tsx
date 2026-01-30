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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
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

  // Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pertemuanToDelete, setPertemuanToDelete] = useState<Pertemuan | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Computed Values
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
      return (
        <p className="text-gray-400 italic text-[11px]">Belum ada penyusun</p>
      );

    try {
      // Jika data tersimpan sebagai JSON string ["Nama A", "Nama B"]
      if (typeof rawData === "string" && rawData.startsWith("[")) {
        const parsed = JSON.parse(rawData);
        return (
          <div className="flex flex-col gap-1.5 mt-1">
            {parsed.map((nama: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-indigo-600 font-bold min-w-[15px]">
                  {idx + 1}.
                </span>
                <span className="text-gray-900 font-medium">{nama}</span>
              </div>
            ))}
          </div>
        );
      }

      // Fallback: Jika data masih berupa string lama yang dipisah koma (Dosen A, Dosen B)
      if (typeof rawData === "string" && rawData.includes(",")) {
        return (
          <div className="flex flex-col gap-1.5 mt-1">
            {rawData.split(",").map((nama: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-indigo-600 font-bold min-w-[15px]">
                  {idx + 1}.
                </span>
                <span className="text-gray-900 font-medium">{nama.trim()}</span>
              </div>
            ))}
          </div>
        );
      }

      // Jika hanya satu nama string biasa
      return <p className="text-gray-900 font-medium">{rawData}</p>;
    } catch (e) {
      return <p className="text-gray-900 font-medium">{String(rawData)}</p>;
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
      alert(
        `❌ Gagal! Sisa bobot hanya ${sisaBobot}%. Input Anda ${bBaru}% melebihi batas.`,
      );
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
      const res = await fetch("/api/rps/cpmk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rps_id: Number(id_rps),
          kode_cpmk: formData.kode,
          deskripsi: formData.deskripsi,
          ik_id: formData.ik_id ? Number(formData.ik_id) : null,
          prodiId: prodiId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal menyimpan CPMK");
      }

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
            <InfoRow label="BOBOT" value={matkul.sks} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader
              title="Otorisasi"
              onEdit={() => setEditingSection("otorisasi")}
            />
            <div className="p-4 space-y-3">
              <div className="pt-2">
                <strong className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
                  Dosen Penyusun:
                </strong>
                <div className="text-sm antialiased">
                  {/* Panggil fungsi yang sudah diperbaiki di atas */}
                  {renderPenyusunList(rpsData.nama_penyusun)}
                </div>
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
                  Ketua Program Studi:
                </strong>
                <p className="text-gray-900 text-sm font-medium mt-1">
                  {String(rpsData.nama_kaprodi || "-")}
                </p>
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
                <span className="font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 uppercase mb-2 block w-fit">
                  {item.kode_cpmk}
                </span>
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

        {/* PROGRESS BAR BARU */}
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
              <tbody className="divide-y divide-gray-100">
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
                        title="Hapus"
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

      {/* MODALS */}
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
        rubrikList={[]}
        isEdit={false}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeletePertemuan}
        pertemuan={pertemuanToDelete}
        isDeleting={isDeleting}
      />

      {/* AREA PDF (Hidden in Web) */}
      <div id="pdf-area" className="hidden print:block">
        <div className="pdf-sampul">
          <h1 className="text-3xl font-bold">
            RENCANA PEMBELAJARAN SEMESTER (RPS)
          </h1>
          <h2 className="text-xl font-bold mt-4 uppercase">
            MATA KULIAH: {matkul.nama} ({matkul.kode_mk})
          </h2>
          <div className="my-12">
            <img src="/logo-unhas.png" alt="Logo" width="250" />
          </div>
          <div className="mt-auto text-lg font-bold">
            UNIVERSITAS HASANUDDIN
            <br />
            FAKULTAS TEKNIK
          </div>
        </div>
        <div className="pdf-page">
          <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
            I. OTORISASI
          </h2>
          <table className="text-center">
            <thead>
              <tr>
                <th>Penyusun</th>
                <th>Koordinator</th>
                <th>Ketua Prodi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-24">
                <td>{renderPenyusunList(rpsData.nama_penyusun)}</td>
                <td>{rpsData.nama_koordinator}</td>
                <td>{rpsData.nama_kaprodi}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pdf-page">
          <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
            II. RENCANA MINGGUAN
          </h2>
          <table>
            <thead>
              <tr>
                <th>Mg</th>
                <th>Kemampuan Akhir</th>
                <th>Indikator</th>
                <th>Bobot</th>
              </tr>
            </thead>
            <tbody>
              {rpsData.pertemuan?.map((p) => (
                <tr key={p.id}>
                  <td className="text-center">{p.pekan_ke}</td>
                  <td>{p.bahan_kajian}</td>
                  <td>{p.pengalaman_belajar}</td>
                  <td className="text-center">{p.bobot_cpmk}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
