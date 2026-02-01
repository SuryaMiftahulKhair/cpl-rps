// app/referensi/KP/[id]/matriks-cpl/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Layers,
  Download,
  Loader2,
  Info,
  Plus,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
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

function parseKurikulumId(params: any): number {
  const idRaw = params?.id;
  if (typeof idRaw === "string") return Number(idRaw);
  if (Array.isArray(idRaw) && typeof idRaw[0] === "string")
    return Number(idRaw[0]);
  return NaN;
}

export default function MatriksCPLPage() {
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

  // --- FITUR TAMBAH MATA KULIAH ---
  const [showMkModal, setShowMkModal] = useState(false);

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

      await loadData(); // Refresh tabel setelah tambah data
      setShowMkModal(false);
      setError("Mata kuliah berhasil ditambahkan!");
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Sort CPL and IK
  const sortedCPL = [...cplList]
    .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
    .map((cpl) => ({
      ...cpl,
      iks: (cpl.iks || []).sort((a, b) => (a.urutan || 0) - (b.urutan || 0)),
    }));

  // Get all IK across all CPL
  const allIK: IndikatorKinerja[] = [];
  sortedCPL.forEach((cpl) => {
    if (cpl.iks) {
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

  const handleBack = () => {
    router.push(`/referensi/KP?prodiId=${prodiId}`);
  };

  const handleCellClick = async (
    mkId: number,
    kodeIK: string,
    isChecked: boolean,
  ) => {
    setSaving(true); // Tampilkan loading kecil
    try {
      const response = await fetch(
        `/api/kurikulum/${kurikulumId}/matakuliah/${mkId}/ik`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kode_ik: kodeIK,
            action: isChecked ? "remove" : "add", // Balikkan status
          }),
        },
      );

      if (response.ok) {
        // UPDATE STATE LOKAL: Supaya centang langsung berubah tanpa refresh
        setMatakuliahList((prev) =>
          prev.map((mk) => {
            if (mk.id === mkId) {
              const newMapping = { ...mk.ik_mapping };
              if (isChecked) {
                delete newMapping[kodeIK];
              } else {
                newMapping[kodeIK] = true;
              }
              return { ...mk, ik_mapping: newMapping };
            }
            return mk;
          }),
        );
      }
    } catch (err) {
      console.error("Gagal update mapping:", err);
    } finally {
      setSaving(false);
    }
  };

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
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-col">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <Layers size={28} className="text-indigo-600" />
                  Matriks CPL - Mata Kuliah
                </h1>
                <p className="text-sm text-indigo-600 font-semibold mt-2">
                  Kurikulum ID: {kurikulumId} | Prodi ID: {prodiId}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* TOMBOL UNTUK MEMBUKA MODAL TAMBAH MATA KULIAH */}
                <button
                  onClick={() => setShowMkModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all font-medium text-sm">
                  <Plus size={18} />
                  <span>Tambah Mata Kuliah</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  disabled={loading || matakuliahList.length === 0}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm">
                  <Download size={18} />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 bg-slate-700 text-white px-5 py-3 rounded-lg shadow-lg hover:bg-slate-800 transition-all font-medium text-sm">
                  <ChevronLeft size={18} /> Kembali
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl p-5 shadow-lg text-white">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Total Mata Kuliah
              </div>
              <div className="text-4xl font-extrabold mt-2">
                {matakuliahList.length}
              </div>
            </div>
            <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-lg text-white">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Total CPL
              </div>
              <div className="text-4xl font-extrabold mt-2">
                {sortedCPL.length}
              </div>
            </div>
            <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-xl p-5 shadow-lg text-white">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Total IK
              </div>
              <div className="text-4xl font-extrabold mt-2">{allIK.length}</div>
            </div>
            <div className="bg-linear-to-br from-amber-500 to-orange-600 rounded-xl p-5 shadow-lg text-white">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Total Mapping
              </div>
              <div className="text-4xl font-extrabold mt-2">{totalMapping}</div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div
              className={`mb-4 p-4 text-sm rounded-lg border-2 font-medium ${error.includes("berhasil") ? "bg-green-50 text-green-800 border-green-300" : "bg-red-50 text-red-800 border-red-300"}`}>
              {error}
            </div>
          )}

          {saving && (
            <div className="mb-4 p-4 text-sm rounded-lg bg-blue-50 text-blue-800 border-2 border-blue-300 flex items-center gap-3 font-medium">
              <Loader2 className="animate-spin" size={18} />
              Menyimpan perubahan...
            </div>
          )}

          {/* Main Table */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-20 text-center">
                  <Loader2
                    className="animate-spin inline mr-3"
                    size={40}
                    color="#4F46E5"
                  />
                  <p className="mt-4 text-lg text-slate-700 font-medium">
                    Memuat data matriks CPL...
                  </p>
                </div>
              ) : matakuliahList.length === 0 ? (
                <div className="p-20 text-center text-slate-500">
                  Belum ada data mata kuliah
                </div>
              ) : (
                <table className="min-w-full text-[11px] border-collapse">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-linear-to-r from-indigo-600 to-blue-600">
                      <th
                        rowSpan={2}
                        className="border-2 border-slate-300 px-4 py-4 text-center font-bold text-white sticky left-0 bg-indigo-600 z-30">
                        SEMESTER
                      </th>
                      <th
                        rowSpan={2}
                        className="border-2 border-slate-300 px-5 py-4 text-center font-bold text-white sticky left-[100px] bg-indigo-600 z-30"
                        style={{ minWidth: "300px" }}>
                        BAHAN KAJIAN (MATA KULIAH)
                      </th>
                      {sortedCPL.map((cpl) => (
                        <th
                          key={cpl.id}
                          colSpan={cpl.iks?.length || 1}
                          className="border-2 border-slate-300 px-3 py-4 text-center font-bold text-white uppercase">
                          {cpl.kode_cpl}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-indigo-50">
                      {sortedCPL.map((cpl) =>
                        (cpl.iks || []).map((ik) => (
                          <th
                            key={ik.id}
                            className="border-2 border-slate-300 px-2 py-3 text-center font-bold text-indigo-900"
                            style={{ minWidth: "60px" }}
                            title={ik.deskripsi}>
                            {ik.kode_ik.replace(/^IK\s*/i, "")}
                          </th>
                        )),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSemesters.map((semester) => {
                      const mkInSemester = semesterGroups[semester];
                      return mkInSemester.map((mk, mkIdx) => (
                        <tr
                          key={mk.id}
                          className={
                            mkIdx % 2 === 0
                              ? "bg-white hover:bg-indigo-50"
                              : "bg-slate-50 hover:bg-indigo-100"
                          }>
                          {mkIdx === 0 && (
                            <td
                              rowSpan={mkInSemester.length}
                              className="border-2 border-slate-300 px-4 py-4 text-center font-extrabold text-[16px] text-indigo-900 bg-slate-100 sticky left-0 z-10">
                              {semester === 0 ? "-" : semester}
                            </td>
                          )}
                          <td className="border-2 border-slate-300 px-4 py-3 sticky left-[100px] bg-white z-10">
                            <div className="font-bold text-[12px] text-slate-900 leading-tight">
                              {mk.nama}
                            </div>
                            <div className="text-[10px] text-indigo-600 font-semibold mt-1">
                              {mk.kode_mk}
                            </div>
                          </td>
                          {sortedCPL.map((cpl) =>
                            (cpl.iks || []).map((ik) => {
                              const isChecked =
                                mk.ik_mapping[ik.kode_ik] || false;
                              return (
                                <td
                                  key={ik.id}
                                  className={`border-2 border-slate-300 px-2 py-3 text-center cursor-pointer transition-all ${
                                    isChecked
                                      ? "bg-emerald-100 hover:bg-emerald-200"
                                      : "bg-white hover:bg-blue-50"
                                  }`}
                                  onClick={() =>
                                    handleCellClick(
                                      mk.id,
                                      ik.kode_ik,
                                      isChecked,
                                    )
                                  } // <--- Pemicunya
                                >
                                  {isChecked && (
                                    <svg
                                      className="w-5 h-5 text-emerald-700 mx-auto"
                                      fill="currentColor"
                                      viewBox="0 0 20 20">
                                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                    </svg>
                                  )}
                                </td>
                              );
                            }),
                          )}
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {!loading && matakuliahList.length > 0 && allIK.length > 0 && (
            <div className="mt-6 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-base text-blue-900 mb-3 flex items-center gap-2">
                <Info size={20} />
                Petunjuk Penggunaan
              </h3>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>
                  Setiap CPL memiliki Indikator Kinerja (IK) yang ditampilkan
                  pada baris kedua header
                </li>
                <li>
                  Klik pada sel kosong untuk menambahkan mapping IK ke mata
                  kuliah
                </li>
                <li>
                  Klik pada sel yang sudah tercentang (✓) untuk menghapus
                  mapping
                </li>
                <li>
                  Gunakan tombol <strong>"Export Excel"</strong> untuk mengunduh
                  matriks dengan struktur lengkap (CPL + IK)
                </li>
                <li>
                  Scroll horizontal untuk melihat semua CPL dan IK yang tersedia
                </li>
                <li>
                  Hover pada header IK untuk melihat deskripsi lengkap indikator
                  kinerja
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL TAMBAH MATA KULIAH --- */}
      <MatakuliahModal
        isOpen={showMkModal}
        onClose={() => setShowMkModal(false)}
        onSave={handleSaveMataKuliah}
        isSaving={saving}
        kurikulumId={kurikulumId} // TAMBAHKAN BARIS INI KAK
      />
    </DashboardLayout>
  );
}
