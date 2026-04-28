"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Layers,
  Download,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle,
  Grid3x3,
  Target,
  X,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import MatriksCPLTable from "@/app/components/MatriksCPLTable";
import * as XLSX from "xlsx";
import MatakuliahModal from "@/app/components/MatakuliahModal";

interface IndikatorKinerja {
  id: number;
  kode_ik: string;
  deskripsi?: string;
  cpl_id: number;
  urutan?: number;
}

interface CPL {
  id: number;
  kode_cpl: string;
  kategori?: string;
  urutan?: number;
  iks?: IndikatorKinerja[];
}

interface MatakuliahCPL {
  id: number;
  kode_mk: string;
  nama: string;
  semester: number | null;
  sks: number;
  sifat: string | null;
  ik_mapping: { [key: string]: boolean };
}

interface Kurikulum {
  id: number;
  nama: string;
  tahun: string | number;
}

type CellState = "idle" | "hover" | "active" | "checked" | "saving" | "error";

function parseKurikulumId(params: any): number {
  const idRaw = params?.id;
  if (typeof idRaw === "string") return Number(idRaw);
  if (Array.isArray(idRaw) && typeof idRaw[0] === "string")
    return Number(idRaw[0]);
  return NaN;
}

// SEMUA CPL MENGGUNAKAN 1 WARNA BIRU
const cplDesignSystem: Record<string, any> = {
  default: {
    primary: "from-blue-600 to-blue-700",
    light: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-900",
    checked: "from-blue-100 to-blue-200",
    headerBorder: "border-blue-300",
  },
};

// Helper: ambil design (selalu biru)
function getCplDesign(_kode: string) {
  return cplDesignSystem["default"];
}

export default function MatriksCPLPageAFTER() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const prodiId = searchParams.get("prodiId");
  const kurikulumId = parseKurikulumId(params);

  const [matakuliahList, setMatakuliahList] = useState<MatakuliahCPL[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
  const [selectedKurikulum, setSelectedKurikulum] = useState<Kurikulum | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [collapsedCPL, setCollapsedCPL] = useState<string[]>([]);
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});

  const [showMkModal, setShowMkModal] = useState(false);

  const sortedCPL = [...cplList]
    .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
    .map((cpl) => ({
      ...cpl,
      iks: (cpl.iks || []).sort((a, b) => (a.urutan || 0) - (b.urutan || 0)),
    }));

  const allIK: IndikatorKinerja[] = [];
  sortedCPL.forEach((cpl) => {
    if (cpl.iks && !collapsedCPL.includes(cpl.kode_cpl)) {
      allIK.push(...cpl.iks);
    }
  });

  const loadData = useCallback(async () => {
    if (Number.isNaN(kurikulumId) || !prodiId) return;
    setLoading(true);
    setError(null);
    try {
      const [cplRes, mkRes] = await Promise.all([
        fetch(`/api/kurikulum/${kurikulumId}/VMCPL?prodiId=${prodiId}`, {
          cache: "no-store",
        }),
        fetch(`/api/kurikulum/${kurikulumId}/matakuliah?prodiId=${prodiId}`, {
          cache: "no-store",
        }),
      ]);
      if (!cplRes.ok) throw new Error("Gagal mengambil data CPL");
      if (!mkRes.ok) throw new Error("Gagal mengambil data mata kuliah");

      const cplJson = await cplRes.json();
      if (cplJson.success && cplJson.data?.cpl) {
        setCplList(cplJson.data.cpl);
      }

      const mkJson = await mkRes.json();
      const mapped: MatakuliahCPL[] = (mkJson?.data ?? []).map((r: any) => {
        const ikMapping: { [key: string]: boolean } = {};
        const ikList = r.iks || [];
        ikList.forEach((ik: any) => {
          ikMapping[ik.kode_ik] = true;
        });
        return {
          id: Number(r.id),
          kode_mk: r.kode_mk ?? "",
          nama: r.nama ?? "",
          semester: r.semester ?? null,
          sks: Number(r.sks ?? 0),
          sifat: r.sifat ?? null,
          ik_mapping: ikMapping,
        };
      });
      setMatakuliahList(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [kurikulumId, prodiId]);

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const wsData: any[][] = [];

      const headerRow1: any[] = ["SEMESTER", "BAHAN KAJIAN (MATA KULIAH)"];
      sortedCPL.forEach((cpl) => {
        headerRow1.push(cpl.kode_cpl);
        const ikCount = cpl.iks?.length || 0;
        for (let i = 1; i < ikCount; i++) {
          headerRow1.push("");
        }
      });
      wsData.push(headerRow1);

      const headerRow2: any[] = ["", ""];
      sortedCPL.forEach((cpl) => {
        (cpl.iks || []).forEach((ik) => {
          const ikNumber = ik.kode_ik.replace(/^IK\s*/i, "");
          headerRow2.push(ikNumber);
        });
      });
      wsData.push(headerRow2);

      const sortedSemestersLocal = [...sortedSemesters];

      sortedSemestersLocal.forEach((semester) => {
        const mkInSemester = semesterGroups[semester];
        mkInSemester.forEach((mk, idx) => {
          const row: any[] = [
            idx === 0 ? (semester === 0 ? "-" : semester) : "",
            `${mk.nama}\n${mk.kode_mk}`,
          ];
          sortedCPL.forEach((cpl) => {
            (cpl.iks || []).forEach((ik) => {
              row.push(mk.ik_mapping[ik.kode_ik] ? "✓" : "");
            });
          });
          wsData.push(row);
        });
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const colWidths = [
        { wch: 10 },
        { wch: 40 },
        ...allIK.map(() => ({ wch: 8 })),
      ];
      ws["!cols"] = colWidths;

      if (!ws["!merges"]) ws["!merges"] = [];
      const merges = ws["!merges"];
      if (merges) {
        let currentCol = 2;
        sortedCPL.forEach((cpl) => {
          const ikCount = cpl.iks?.length || 0;
          if (ikCount > 1) {
            merges.push({
              s: { r: 0, c: currentCol },
              e: { r: 0, c: currentCol + ikCount - 1 },
            });
          }
          currentCol += ikCount;
        });

        let currentRow = 2;
        sortedSemestersLocal.forEach((semester) => {
          const mkCount = semesterGroups[semester].length;
          if (mkCount > 1) {
            merges.push({
              s: { r: currentRow, c: 0 },
              e: { r: currentRow + mkCount - 1, c: 0 },
            });
          }
          currentRow += mkCount;
        });
      }

      XLSX.utils.book_append_sheet(wb, ws, "Matriks CPL-IK");
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Matriks_CPL_IK_Kurikulum_${kurikulumId}_${timestamp}.xlsx`;
      XLSX.writeFile(wb, filename);

      setSuccessMessage("Export Excel berhasil! File telah diunduh.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Export error:", err);
      setError("Gagal export Excel: " + err.message);
    }
  };

  const handleSaveMataKuliah = async (formData: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          prodiId: Number(prodiId),
          kurikulum_id: Number(kurikulumId),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Gagal menyimpan mata kuliah");
      }

      await loadData();
      setShowMkModal(false);
      setSuccessMessage("Mata kuliah berhasil ditambahkan!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/referensi/KP?prodiId=${prodiId}`);
  };

  const toggleCPL = (cplKode: string) => {
    setCollapsedCPL((prev) =>
      prev.includes(cplKode)
        ? prev.filter((k) => k !== cplKode)
        : [...prev, cplKode],
    );
  };

  const handleCellClick = async (
    mkId: number,
    kodeIK: string,
    currentValue: boolean,
    cplKode: string,
  ) => {
    const cellKey = `${mkId}-${kodeIK}`;
    setCellStates((prev) => ({ ...prev, [cellKey]: "active" }));

    setTimeout(() => {
      setCellStates((prev) => ({ ...prev, [cellKey]: "saving" }));
    }, 100);

    try {
      const res = await fetch(
        `/api/kurikulum/${kurikulumId}/matakuliah/${mkId}/ik`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kode_ik: kodeIK,
            action: currentValue ? "remove" : "add",
            prodiId: Number(prodiId),
          }),
        },
      );

      if (!res.ok) throw new Error("Gagal update IK mapping");

      setMatakuliahList((prev) =>
        prev.map((mk) => {
          if (mk.id === mkId) {
            const newMapping = { ...mk.ik_mapping };
            if (currentValue) {
              delete newMapping[kodeIK];
            } else {
              newMapping[kodeIK] = true;
            }
            return { ...mk, ik_mapping: newMapping };
          }
          return mk;
        }),
      );

      setCellStates((prev) => ({
        ...prev,
        [cellKey]: !currentValue ? "checked" : "idle",
      }));
    } catch (err: any) {
      setCellStates((prev) => ({ ...prev, [cellKey]: "error" }));
      setError(err.message);
    }
  };

  const semesterGroups = matakuliahList.reduce(
    (acc, mk) => {
      const sem = mk.semester || 0;
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(mk);
      return acc;
    },
    {} as { [key: number]: MatakuliahCPL[] },
  );

  const sortedSemesters = Object.keys(semesterGroups)
    .map(Number)
    .sort((a, b) => a - b);

  const totalMapping = matakuliahList.reduce(
    (sum, mk) => sum + Object.keys(mk.ik_mapping).length,
    0,
  );

  // Satu warna biru untuk semua elemen
  const design = getCplDesign("");

  const handleChangeKurikulum = (kId: number) => {
    const selected = kurikulumList.find((k) => k.id === kId);
    if (selected) {
      setSelectedKurikulum(selected);
      // Navigate ke kurikulum yang dipilih dengan prodiId yang sama
      router.push(`/referensi/KP/${kId}/matakuliah?prodiId=${prodiId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-5">

        {/* HEADER */}
        <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Grid3x3 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Matriks CPL - Mata Kuliah
                </h1>
                <p className="text-sm text-gray-600">
                  Kurikulum ID:{" "}
                  <span className="font-semibold text-blue-700">
                    {kurikulumId}
                  </span>{" "}
                  • Prodi ID:{" "}
                  <span className="font-semibold text-blue-700">
                    {prodiId}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowMkModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 font-semibold text-sm">
                <Plus size={18} strokeWidth={2.5} />
                Tambah MK
              </button>
              <button
                onClick={handleExportExcel}
                disabled={loading || matakuliahList.length === 0}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 font-semibold text-sm disabled:opacity-50">
                <Download size={18} strokeWidth={2.5} />
                Export Excel
              </button>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-sm group">
                <ChevronLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                  strokeWidth={2.5}
                />
                Kembali
              </button>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Mata Kuliah", value: matakuliahList.length, icon: <Layers className="w-7 h-7 text-white" strokeWidth={2} />, bgColor: "bg-blue-600" },
            { label: "Total CPL", value: sortedCPL.length, icon: <Target className="w-7 h-7 text-white" strokeWidth={2} />, bgColor: "bg-green-600" },
            { label: "Total IK", value: allIK.length, icon: <CheckCircle className="w-7 h-7 text-white" strokeWidth={2} />, bgColor: "bg-purple-600" },
            { label: "Total Mapping", value: totalMapping, icon: <Grid3x3 className="w-7 h-7 text-white" strokeWidth={2} />, bgColor: "bg-orange-600" },
          ].map((card, i) => (
            <div key={i} className="min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 ${card.bgColor} rounded-xl flex items-center justify-center shadow-md`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK CONTROLS */}
        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Quick Controls:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCollapsedCPL([])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                <Eye size={14} /> Tampilkan Semua
              </button>
              <button
                onClick={() => setCollapsedCPL(sortedCPL.map((c) => c.kode_cpl))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <EyeOff size={14} /> Sembunyikan Semua
              </button>
            </div>
          </div>
        </div>

        {/* Kurikulum Selector */}
        {!loading && !error && kurikulumList.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pilih Kurikulum:
            </label>
            <select
              value={selectedKurikulum?.id || ""}
              onChange={(e) => handleChangeKurikulum(Number(e.target.value))}
              className="w-full md:w-auto px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-900 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white shadow-sm">
              <option value="" disabled hidden>
                {selectedKurikulum 
                  ? `${selectedKurikulum.nama} (${selectedKurikulum.tahun})` 
                  : "-- Pilih Kurikulum --"}
              </option>
              {kurikulumList.map((k) => (
                <option
                  key={k.id}
                  value={k.id}
                  className="text-gray-900 font-semibold">
                  {k.nama} ({k.tahun})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MESSAGES */}
        {successMessage && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
            <p className="text-sm font-semibold text-blue-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 mb-1">Terjadi Kesalahan</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button title="Hapus Error" onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* TABLE SECTION */}
        <MatriksCPLTable
          kurikulumId={selectedKurikulum?.id || kurikulumId}
          prodiId={Number(prodiId) || 0}
          compactMode={false}
          maxHeight="max-h-[500px]"
          showControls={false}
          onMappingChange={loadData}
        />

        {/* INSTRUCTIONS */}
        {!loading && matakuliahList.length > 0 && allIK.length > 0 && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                <Info className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-blue-900 mb-4">
                  Petunjuk Penggunaan
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2.5 text-sm text-blue-800">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <span>
                        Semua CPL menggunakan <strong>warna biru</strong> yang seragam dan konsisten
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <span>
                        Gunakan tombol <strong>collapse/expand</strong> (▼/▶) untuk fokus pada CPL tertentu
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <span>
                        Klik sel untuk <strong>toggle mapping</strong> IK ke mata kuliah
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-2.5 text-sm text-blue-800">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>
                      <span>
                        Status sel: <strong>Putih</strong> (kosong), <strong>Biru</strong> (mapped), <strong>Kuning</strong> (saving)
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">5</span>
                      </div>
                      <span>
                        Hover pada <strong>header IK</strong> untuk melihat deskripsi lengkap indikator
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">6</span>
                      </div>
                      <span>
                        Scroll horizontal akan menampilkan <strong>floating indicator</strong> CPL yang sedang dilihat
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH MK */}
      <MatakuliahModal
        isOpen={showMkModal}
        onClose={() => setShowMkModal(false)}
        onSave={handleSaveMataKuliah}
        isSaving={saving}
        kurikulumId={kurikulumId}
      />
    </DashboardLayout>
  );
}