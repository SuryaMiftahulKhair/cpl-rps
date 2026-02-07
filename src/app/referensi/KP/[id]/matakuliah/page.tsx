"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Plus, // Import icon Plus
  Eye,
  EyeOff,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import * as XLSX from "xlsx";
import MatakuliahModal from "@/app/components/MatakuliahModal"; // Import Modal

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

type CellState = "idle" | "hover" | "active" | "checked" | "saving" | "error";

function parseKurikulumId(params: any): number {
  const idRaw = params?.id;
  if (typeof idRaw === "string") return Number(idRaw);
  if (Array.isArray(idRaw) && typeof idRaw[0] === "string")
    return Number(idRaw[0]);
  return NaN;
}

// COLOR-CODED CPL SYSTEM (Tetap Dipertahankan)
const cplDesignSystem: Record<string, any> = {
  "CPL-1": {
    primary: "from-blue-600 to-cyan-600",
    light: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-900",
    checked: "from-blue-100 to-blue-200",
    headerBorder: "border-blue-400",
  },
  "CPL-2": {
    primary: "from-emerald-600 to-teal-600",
    light: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-900",
    checked: "from-emerald-100 to-emerald-200",
    headerBorder: "border-emerald-400",
  },
  "CPL-3": {
    primary: "from-purple-600 to-fuchsia-600",
    light: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-900",
    checked: "from-purple-100 to-purple-200",
    headerBorder: "border-purple-400",
  },
  "CPL-4": {
    primary: "from-amber-600 to-orange-600",
    light: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-900",
    checked: "from-amber-100 to-amber-200",
    headerBorder: "border-amber-400",
  },
  "CPL-5": {
    primary: "from-rose-600 to-pink-600",
    light: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-900",
    checked: "from-rose-100 to-rose-200",
    headerBorder: "border-rose-400",
  },
  "CPL-6": {
    primary: "from-cyan-600 to-sky-600",
    light: "bg-cyan-50",
    border: "border-cyan-300",
    text: "text-cyan-900",
    checked: "from-cyan-100 to-cyan-200",
    headerBorder: "border-cyan-400",
  },
  "CPL-7": {
    primary: "from-orange-600 to-red-600",
    light: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-900",
    checked: "from-orange-100 to-orange-200",
    headerBorder: "border-orange-400",
  },
  "CPL-8": {
    primary: "from-pink-600 to-rose-600",
    light: "bg-pink-50",
    border: "border-pink-300",
    text: "text-pink-900",
    checked: "from-pink-100 to-pink-200",
    headerBorder: "border-pink-400",
  },
};

export default function MatriksCPLPageAFTER() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const prodiId = searchParams.get("prodiId");
  const kurikulumId = parseKurikulumId(params);

  const [matakuliahList, setMatakuliahList] = useState<MatakuliahCPL[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // NEW: Collapsible CPL
  const [collapsedCPL, setCollapsedCPL] = useState<string[]>([]);

  // NEW: Cell states
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});

  // NEW: Scroll tracking
  const [scrollLeft, setScrollLeft] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const [currentVisibleCPL, setCurrentVisibleCPL] = useState<string>("");

  // FUNGSI TAMBAH MK (BARU)
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

      // Cari baris sekitar 105 - 120 di file page.tsx Kakak
      const mkJson = await mkRes.json();
      const mapped: MatakuliahCPL[] = (mkJson?.data ?? []).map((r: any) => {
        const ikMapping: { [key: string]: boolean } = {};

        // REVISI DI SINI:
        // Kita ambil data dari 'r.iks' (data dari database hasil connect/disconnect)
        // r.iks adalah array object Indikator Kinerja yang terhubung ke Mata Kuliah ini
        const ikList = r.iks || [];

        ikList.forEach((ik: any) => {
          // Kita simpan kodenya (misal: 'IK1') sebagai TRUE di object mapping
          ikMapping[ik.kode_ik] = true;
        });

        return {
          id: Number(r.id),
          kode_mk: r.kode_mk ?? "",
          nama: r.nama ?? "",
          semester: r.semester ?? null,
          sks: Number(r.sks ?? 0),
          sifat: r.sifat ?? null,
          ik_mapping: ikMapping, // Sekarang mapping ini berisi data asli dari DB
        };
      });
      setMatakuliahList(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [kurikulumId, prodiId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

      setError("Export Excel berhasil! File telah diunduh.");
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      console.error("Export error:", err);
      setError("Gagal export Excel: " + err.message);
    }
  };

  // Handler Simpan MK Baru (BARU)
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

      await loadData(); // Refresh tabel
      setShowMkModal(false);
      setSuccessMessage("Mata kuliah berhasil ditambahkan!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // NEW: Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (tableRef.current) {
        setScrollLeft(tableRef.current.scrollLeft);
        const scrollPosition = tableRef.current.scrollLeft;
        const cellWidth = 60;
        const visibleIndex = Math.floor(scrollPosition / cellWidth);
        if (sortedCPL[visibleIndex]) {
          setCurrentVisibleCPL(sortedCPL[visibleIndex].kode_cpl);
        }
      }
    };

    const ref = tableRef.current;
    ref?.addEventListener("scroll", handleScroll);
    return () => ref?.removeEventListener("scroll", handleScroll);
  }, [sortedCPL]);

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

      // --- REVISI DI SINI: Update state utama matakuliahList ---
      setMatakuliahList((prev) =>
        prev.map((mk) => {
          if (mk.id === mkId) {
            const newMapping = { ...mk.ik_mapping };
            if (currentValue) {
              delete newMapping[kodeIK]; // Hapus centang
            } else {
              newMapping[kodeIK] = true; // Tambah centang
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

      // Opsional: panggil loadData() untuk memastikan sinkronisasi database 100%
      // await loadData();
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
        {/* HEADER */}
        <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Grid3x3 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Matriks CPL - Mata Kuliah
                </h1>
                <p className="text-sm text-gray-600">
                  Kurikulum ID:{" "}
                  <span className="font-semibold text-indigo-700">
                    {kurikulumId}
                  </span>{" "}
                  • Prodi ID:{" "}
                  <span className="font-semibold text-indigo-700">
                    {prodiId}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* TOMBOL TAMBAH MK (BARU) */}
              <button
                onClick={() => setShowMkModal(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 font-semibold">
                <Plus size={18} strokeWidth={2.5} />
                Tambah MK
              </button>

              <button
                onClick={handleExportExcel}
                disabled={loading || matakuliahList.length === 0}
                className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold disabled:opacity-50">
                <Download size={18} strokeWidth={2.5} />
                Export Excel
              </button>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold group">
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

        {/* STATS CARDS (Tetap Sama) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Layers className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Mata Kuliah
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {matakuliahList.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <Target className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Total CPL
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {sortedCPL.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <CheckCircle className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Total IK
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {allIK.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <Grid3x3 className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                  Total Mapping
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalMapping}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK CONTROLS (Tetap Sama) */}
        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Quick Controls:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCollapsedCPL([])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200">
                <Eye size={14} /> Tampilkan Semua
              </button>
              <button
                onClick={() =>
                  setCollapsedCPL(sortedCPL.map((c) => c.kode_cpl))
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <EyeOff size={14} /> Sembunyikan Semua
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGES (Tetap Sama) */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top">
            <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5} />
            <p className="text-sm font-semibold text-green-800">
              {successMessage}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 mb-1">
                Terjadi Kesalahan
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              title="Hapus Error"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto" ref={tableRef}>
            {loading ? (
              <div className="p-20 text-center">
                <Loader2
                  className="animate-spin inline text-indigo-600 mb-4"
                  size={48}
                  strokeWidth={2.5}
                />
                <p className="text-lg text-gray-700 font-semibold">
                  Memuat data matriks CPL...
                </p>
              </div>
            ) : (
              <table className="min-w-full text-[11px] border-collapse">
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th
                      rowSpan={2}
                      className="border-2 border-white/20 px-4 py-4 text-center font-bold text-white sticky left-0 bg-linear-to-r from-indigo-600 to-blue-600 z-30 text-xs"
                      style={{ width: "100px" }}>
                      SEMESTER
                    </th>
                    <th
                      rowSpan={2}
                      className="border-2 border-white/20 px-5 py-4 text-center font-bold text-white sticky left-[100px] bg-linear-to-r from-indigo-600 to-blue-600 z-30 text-xs shadow-[4px_0_12px_-2px_rgba(79,70,229,0.3)]"
                      style={{ minWidth: "300px", width: "300px" }}>
                      BAHAN KAJIAN <br /> (MATA KULIAH)
                    </th>
                    {sortedCPL.map((cpl, cplIdx) => {
                      const ikCount = collapsedCPL.includes(cpl.kode_cpl)
                        ? 0
                        : cpl.iks?.length || 0;
                      const design =
                        cplDesignSystem[cpl.kode_cpl] ||
                        cplDesignSystem["CPL-1"];
                      const isFirstOfGroup = cplIdx % 3 === 0 && cplIdx > 0;
                      return (
                        <th
                          key={cpl.id}
                          colSpan={ikCount || 1}
                          className={`border-2 border-white/30 px-3 py-5 text-center font-bold text-white text-xs bg-linear-to-br ${design.primary} ${isFirstOfGroup ? "border-l-4 border-l-white" : ""}`}>
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm">
                              {cpl.kode_cpl}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] opacity-80">
                              <CheckCircle size={11} />
                              <span>{cpl.iks?.length || 0} IK</span>
                              <button
                                onClick={() => toggleCPL(cpl.kode_cpl)}
                                className="ml-2 hover:bg-white/20 p-1 rounded transition-colors">
                                {collapsedCPL.includes(cpl.kode_cpl) ? (
                                  <ChevronRight size={12} />
                                ) : (
                                  <ChevronDown size={12} />
                                )}
                              </button>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                  <tr>
                    {sortedCPL.map((cpl) => {
                      if (collapsedCPL.includes(cpl.kode_cpl)) return null;
                      const design =
                        cplDesignSystem[cpl.kode_cpl] ||
                        cplDesignSystem["CPL-1"];
                      return (cpl.iks || []).map((ik) => (
                        <th
                          key={ik.id}
                          className={`border-2 ${design.headerBorder} px-2 py-4 text-center font-bold ${design.text} text-[11px] ${design.light} transition-colors hover:brightness-95`}
                          style={{ minWidth: "70px", width: "70px" }}
                          title={`${cpl.kode_cpl} - ${ik.deskripsi || "No description"}`}>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-extrabold">
                              {ik.kode_ik.replace(/^IK\s*/i, "")}
                            </span>
                            <span className="text-[8px] opacity-60 uppercase tracking-wider font-semibold">
                              {cpl.kode_cpl}
                            </span>
                            <Info size={11} className="opacity-40 mt-0.5" />
                          </div>
                        </th>
                      ));
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedSemesters.map((semester) => {
                    const mkInSemester = semesterGroups[semester];
                    return mkInSemester.map((mk, mkIdx) => (
                      <tr
                        key={mk.id}
                        className={`group transition-colors ${mkIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-indigo-50/50`}>
                        {mkIdx === 0 && (
                          <td
                            rowSpan={mkInSemester.length}
                            className="border-2 border-gray-300 px-4 py-4 text-center font-extrabold text-xl text-indigo-900 bg-linear-to-br from-gray-50 to-gray-100 sticky left-0 z-10">
                            {semester === 0 ? "-" : semester}
                          </td>
                        )}
                        <td className="border-2 border-gray-300 px-4 py-3 sticky left-[100px] bg-white group-hover:bg-indigo-50/50 z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]">
                          <div className="font-bold text-[13px] text-gray-900 leading-tight mb-1.5">
                            {mk.nama}
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                              {mk.kode_mk}
                            </span>
                            <span className="text-[9px] text-gray-500 font-medium">
                              {mk.sks} SKS
                            </span>
                          </div>
                        </td>
                        {sortedCPL.map((cpl) => {
                          if (collapsedCPL.includes(cpl.kode_cpl)) return null;
                          const design =
                            cplDesignSystem[cpl.kode_cpl] ||
                            cplDesignSystem["CPL-1"];
                          return (cpl.iks || []).map((ik, ikIdx) => {
                            const isChecked =
                              mk.ik_mapping[ik.kode_ik] || false;
                            const cellKey = `${mk.id}-${ik.kode_ik}`;
                            const currentState =
                              cellStates[cellKey] ||
                              (isChecked ? "checked" : "idle");
                            const isFirstIKofCPL = ikIdx === 0;
                            return (
                              <td
                                key={ik.id}
                                className={`relative border-2 px-2 py-3 text-center cursor-pointer transition-all duration-200 ${isFirstIKofCPL ? "border-l-4 border-l-slate-400" : "border-gray-300"} ${currentState === "idle" && "bg-white hover:bg-blue-50"} ${currentState === "hover" && "bg-blue-50 border-blue-300 shadow-inner"} ${currentState === "active" && "bg-blue-100 scale-95"} ${currentState === "checked" && `bg-linear-to-br ${design.checked} ${design.border}`} ${currentState === "saving" && "bg-yellow-50 border-yellow-400 animate-pulse"} ${currentState === "error" && "bg-red-50 border-red-400 animate-pulse"}`}
                                onMouseEnter={() =>
                                  currentState !== "saving" &&
                                  setCellStates((p) => ({
                                    ...p,
                                    [cellKey]: isChecked ? "checked" : "hover",
                                  }))
                                }
                                onMouseLeave={() =>
                                  currentState !== "saving" &&
                                  setCellStates((p) => ({
                                    ...p,
                                    [cellKey]: isChecked ? "checked" : "idle",
                                  }))
                                }
                                onClick={() =>
                                  handleCellClick(
                                    mk.id,
                                    ik.kode_ik,
                                    isChecked,
                                    cpl.kode_cpl,
                                  )
                                }>
                                <div className="flex items-center justify-center h-12">
                                  {currentState === "checked" && (
                                    <CheckCircle
                                      className={`w-6 h-6 ${design.text} animate-in zoom-in duration-200`}
                                      strokeWidth={2.5}
                                    />
                                  )}
                                  {currentState === "saving" && (
                                    <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                                  )}
                                  {currentState === "error" && (
                                    <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                                  )}
                                </div>
                              </td>
                            );
                          });
                        })}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* INSTRUCTIONS (Tetap Sama) */}
        {!loading && matakuliahList.length > 0 && allIK.length > 0 && (
          <div className="mt-6 bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
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
                        Setiap CPL memiliki <strong>warna berbeda</strong> untuk
                        memudahkan identifikasi visual
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>

                      <span>
                        Gunakan tombol <strong>collapse/expand</strong> (▼/▶)
                        untuk fokus pada CPL tertentu
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>

                      <span>
                        Klik sel untuk <strong>toggle mapping</strong> IK ke
                        mata kuliah
                      </span>
                    </li>
                  </ul>

                  <ul className="space-y-2.5 text-sm text-blue-800">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>

                      <span>
                        Status sel: <strong>Putih</strong> (kosong),{" "}
                        <strong>Berwarna</strong> (mapped),{" "}
                        <strong>Kuning</strong> (saving)
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">5</span>
                      </div>

                      <span>
                        Hover pada <strong>header IK</strong> untuk melihat
                        deskripsi lengkap indikator
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">6</span>
                      </div>

                      <span>
                        Scroll horizontal akan menampilkan{" "}
                        <strong>floating indicator</strong> CPL yang sedang
                        dilihat
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH MK (BARU) */}
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
