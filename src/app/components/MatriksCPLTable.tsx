// components/MatriksCPLTable.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

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

interface MatriksCPLTableProps {
  kurikulumId: number;
  prodiId: number;
  compactMode?: boolean;
  maxHeight?: string;
  showControls?: boolean;
  isReadOnly?: boolean;
  onMappingChange?: () => void;
}

type CellState = "idle" | "hover" | "active" | "checked" | "saving" | "error";

// COLOR-CODED CPL SYSTEM (konsisten dengan page-AFTER.tsx)
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

export default function MatriksCPLTable({
  kurikulumId,
  prodiId,
  isReadOnly = false,
  compactMode = false,
  maxHeight = "max-h-[600px]",
  showControls = true,
  onMappingChange,
}: MatriksCPLTableProps) {
  const [matakuliahList, setMatakuliahList] = useState<MatakuliahCPL[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [collapsedCPL, setCollapsedCPL] = useState<string[]>([]);
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [scrollLeft, setScrollLeft] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const [currentVisibleCPL, setCurrentVisibleCPL] = useState<string>("");

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
    console.log("MatriksCPLTable - Loading data:", { kurikulumId, prodiId });
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

      console.log("CPL Response status:", cplRes.status);
      console.log("MK Response status:", mkRes.status);

      if (!cplRes.ok) {
        throw new Error(
          `Gagal mengambil data CPL: ${cplRes.status} ${cplRes.statusText}`,
        );
      }
      if (!mkRes.ok) {
        throw new Error(
          `Gagal mengambil data mata kuliah: ${mkRes.status} ${mkRes.statusText}`,
        );
      }

      const cplJson = await cplRes.json();
      console.log("CPL Data:", cplJson);

      if (cplJson.success && cplJson.data?.cpl) {
        setCplList(cplJson.data.cpl);
        console.log("CPL List set:", cplJson.data.cpl.length);
      } else {
        console.warn("No CPL data in response");
      }

      const mkJson = await mkRes.json();
      console.log("MK Data:", mkJson);

      const mapped: MatakuliahCPL[] = (mkJson?.data ?? []).map((r: any) => {
        const ikMapping: { [key: string]: boolean } = {};
        const ikList = r.indikator_kinerja || r.iks || [];
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

      console.log("Matakuliah List set:", mapped.length);
      setMatakuliahList(mapped);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [kurikulumId, prodiId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleScroll = () => {
      if (tableRef.current) {
        setScrollLeft(tableRef.current.scrollLeft);
        const scrollPosition = tableRef.current.scrollLeft;
        const cellWidth = 70;
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

      if (isReadOnly) return;

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error || errorData?.message || "Gagal update IK mapping",
        );
      }

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
      setSuccessMessage(
        currentValue
          ? "Mapping berhasil dihapus"
          : "Mapping berhasil ditambahkan",
      );
      setTimeout(() => setSuccessMessage(null), 2000);

      if (onMappingChange) {
        onMappingChange();
      }
    } catch (err: any) {
      console.error("Error updating cell:", err);
      setCellStates((prev) => ({ ...prev, [cellKey]: "error" }));
      setError(err.message);
      setTimeout(() => {
        setCellStates((prev) => ({
          ...prev,
          [cellKey]: currentValue ? "checked" : "idle",
        }));
      }, 2000);
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

  // FIXED: Konsisten width untuk sticky columns
  const semesterColWidth = "100px";
  const mkColWidth = compactMode ? "200px" : "300px";
  const mkColLeft = "100px"; // Konsisten dengan semesterColWidth

  return (
    <div
      className={`${isFullscreen ? "fixed inset-0 z-50 bg-white p-8 overflow-auto" : "bg-white"}`}>
      {/* Controls */}
      {showControls && (
        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-semibold text-gray-700">
              Quick Controls:
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm">
                {isFullscreen ? (
                  <Minimize2 size={14} />
                ) : (
                  <Maximize2 size={14} />
                )}
                {isFullscreen ? "Normal" : "Fullscreen"}
              </button>
              <button
                onClick={() => setCollapsedCPL([])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm">
                <Eye size={14} />
                Tampilkan Semua
              </button>
              <button
                onClick={() =>
                  setCollapsedCPL(sortedCPL.map((c) => c.kode_cpl))
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                <EyeOff size={14} />
                Sembunyikan Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-xl p-3 flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle className="w-4 h-4 text-green-600" strokeWidth={2.5} />
          <p className="text-sm font-semibold text-green-800">
            {successMessage}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            title="Hapus Error"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Indicator */}
      {scrollLeft > 400 && currentVisibleCPL && !compactMode && (
        <div className="fixed top-24 right-8 z-50 bg-white shadow-xl rounded-xl p-4 border-2 border-indigo-200 animate-in fade-in">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            Sedang melihat:
          </p>
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full bg-linear-to-r ${cplDesignSystem[currentVisibleCPL]?.primary || "bg-gray-400"}`}></div>
            <span className="font-bold text-gray-900 text-lg">
              {currentVisibleCPL}
            </span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className={`overflow-x-auto ${maxHeight} overflow-y-auto`}
          ref={tableRef}>
          {loading ? (
            <div className="p-12 text-center">
              <Loader2
                className="animate-spin inline text-indigo-600 mb-3"
                size={40}
                strokeWidth={2.5}
              />
              <p className="text-sm text-gray-700 font-semibold">
                Memuat matriks CPL...
              </p>
            </div>
          ) : matakuliahList.length === 0 || cplList.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="inline text-gray-400 mb-3" size={40} />
              <p className="text-sm text-gray-700 font-semibold mb-2">
                Tidak ada data
              </p>
              <p className="text-xs text-gray-500">
                {cplList.length === 0
                  ? "Belum ada CPL yang terdaftar."
                  : "Belum ada mata kuliah yang terdaftar."}
              </p>
            </div>
          ) : (
            <table className="min-w-full text-[11px] border-collapse">
              <thead className="sticky top-0 z-20">
                <tr>
                  <th
                    rowSpan={2}
                    className="border-2 border-white/20 px-4 py-4 text-center font-bold text-white sticky left-0 bg-linear-to-r from-indigo-600 to-blue-600 z-30 text-xs"
                    style={{ width: semesterColWidth }}>
                    SEM
                  </th>
                  <th
                    rowSpan={2}
                    className="border-2 border-white/20 px-4 py-3 text-center font-bold text-white sticky bg-linear-to-r from-indigo-600 to-blue-600 z-30 text-xs shadow-[4px_0_12px_-2px_rgba(79,70,229,0.3)]"
                    style={{
                      minWidth: mkColWidth,
                      width: mkColWidth,
                      left: mkColLeft,
                    }}>
                    MATA KULIAH
                  </th>
                  {sortedCPL.map((cpl, cplIdx) => {
                    const ikCount = collapsedCPL.includes(cpl.kode_cpl)
                      ? 0
                      : cpl.iks?.length || 0;
                    const design =
                      cplDesignSystem[cpl.kode_cpl] || cplDesignSystem["CPL-1"];
                    const isFirstOfGroup = cplIdx % 3 === 0 && cplIdx > 0;
                    return (
                      <th
                        key={cpl.id}
                        colSpan={ikCount || 1}
                        className={`border-2 border-white/30 px-2 py-4 text-center font-bold text-white text-xs bg-linear-to-br ${design.primary} ${isFirstOfGroup ? "border-l-4 border-l-white" : ""}`}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            {cpl.kode_cpl}
                          </div>
                          {!compactMode && (
                            <div className="flex items-center gap-1 text-[9px] opacity-80">
                              <CheckCircle size={10} />
                              <span>{cpl.iks?.length || 0} IK</span>
                              <button
                                onClick={() => toggleCPL(cpl.kode_cpl)}
                                className="ml-1 hover:bg-white/20 p-0.5 rounded">
                                {collapsedCPL.includes(cpl.kode_cpl) ? (
                                  <ChevronRight size={10} />
                                ) : (
                                  <ChevronDown size={10} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
                <tr>
                  {sortedCPL.map((cpl) => {
                    if (collapsedCPL.includes(cpl.kode_cpl)) return null;
                    const design =
                      cplDesignSystem[cpl.kode_cpl] || cplDesignSystem["CPL-1"];
                    return (cpl.iks || []).map((ik) => {
                      const ikNumber = ik.kode_ik.replace(/^IK\s*/i, "");
                      return (
                        <th
                          key={ik.id}
                          className={`border-2 ${design.headerBorder} px-2 py-3 text-center font-bold ${design.text} text-[10px] ${design.light}`}
                          style={{ minWidth: "70px", width: "70px" }}
                          title={`${cpl.kode_cpl} - ${ik.deskripsi || ""}`}>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs font-extrabold">
                              {ikNumber}
                            </span>
                            {!compactMode && (
                              <>
                                <span className="text-[7px] opacity-60 uppercase">
                                  {cpl.kode_cpl}
                                </span>
                                <Info size={9} className="opacity-40" />
                              </>
                            )}
                          </div>
                        </th>
                      );
                    });
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
                          className="border-2 border-gray-300 px-3 py-3 text-center font-extrabold text-base text-indigo-900 bg-linear-to-br from-gray-50 to-gray-100 sticky left-0 z-10">
                          {semester === 0 ? "-" : semester}
                        </td>
                      )}
                      <td
                        className="border-2 border-gray-300 px-3 py-2 sticky bg-white group-hover:bg-indigo-50/50 z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]"
                        style={{ left: mkColLeft }}>
                        <div className="font-bold text-[11px] text-gray-900 leading-tight mb-1">
                          {mk.nama}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {mk.kode_mk}
                          </span>
                          {!compactMode && (
                            <span className="text-[8px] text-gray-500">
                              {mk.sks} SKS
                            </span>
                          )}
                        </div>
                      </td>
                      {sortedCPL.map((cpl) => {
                        if (collapsedCPL.includes(cpl.kode_cpl)) return null;
                        const design =
                          cplDesignSystem[cpl.kode_cpl] ||
                          cplDesignSystem["CPL-1"];
                        return (cpl.iks || []).map((ik, ikIdx) => {
                          const isChecked = mk.ik_mapping[ik.kode_ik] || false;
                          const cellKey = `${mk.id}-${ik.kode_ik}`;
                          const currentState =
                            cellStates[cellKey] ||
                            (isChecked ? "checked" : "idle");
                          const isFirstIKofCPL = ikIdx === 0;
                          return (
                            <td
                              key={ik.id}
                              className={`relative border-2 px-2 py-2 text-center cursor-pointer transition-all duration-200
                                ${isFirstIKofCPL ? "border-l-4 border-l-slate-400" : "border-gray-300"}
                                ${currentState === "idle" && "bg-white hover:bg-blue-50 hover:border-blue-300"}
                                ${currentState === "hover" && "bg-blue-50 border-blue-300"}
                                ${currentState === "checked" && `bg-linear-to-br ${design.checked} ${design.border}`}
                                ${currentState === "saving" && "bg-yellow-50 border-yellow-400 animate-pulse"}
                                ${currentState === "error" && "bg-red-50 border-red-400 animate-pulse"}
                                ${isReadOnly ? "cursor-default" : "cursor-pointer hover:bg-gray-100"} 
                                ${isChecked ? "bg-indigo-50" : "bg-white"}
                              `}
                              onMouseEnter={() => {
                                if (currentState !== "saving") {
                                  setCellStates((prev) => ({
                                    ...prev,
                                    [cellKey]: isChecked ? "checked" : "hover",
                                  }));
                                }
                              }}
                              onMouseLeave={() => {
                                if (currentState !== "saving") {
                                  setCellStates((prev) => ({
                                    ...prev,
                                    [cellKey]: isChecked ? "checked" : "idle",
                                  }));
                                }
                              }}
                              onClick={() =>
                                handleCellClick(mk.id, ik.kode_ik, isChecked)
                              }
                              title={`${mk.nama} - ${ik.kode_ik}${ik.deskripsi ? ": " + ik.deskripsi : ""}`}>
                              <div className="flex items-center justify-center h-8">
                                {currentState === "checked" && (
                                  <CheckCircle
                                    className={`w-5 h-5 ${design.text}`}
                                    strokeWidth={2.5}
                                  />
                                )}
                                {currentState === "saving" && (
                                  <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                                )}
                                {currentState === "error" && (
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              {(currentState === "hover" ||
                                currentState === "idle") && (
                                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                                    {isChecked ? "Hapus" : "Tambah"}
                                  </div>
                                </div>
                              )}
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

      {/* Stats Footer */}
      {compactMode && !loading && matakuliahList.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <span>{matakuliahList.length} Mata Kuliah</span>
          <span>{sortedCPL.length} CPL</span>
          <span>{allIK.length} IK</span>
          <span className="font-bold text-indigo-700">
            {totalMapping} Mapping
          </span>
        </div>
      )}
    </div>
  );
}
