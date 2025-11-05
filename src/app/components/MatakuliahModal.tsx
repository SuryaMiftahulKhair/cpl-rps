"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { X, Save } from "lucide-react";

export interface MatakuliahModalData {
  kode_mk: string;
  nama: string;
  sks: number;
  // relasi terpilih
  assesment_area_id?: number | null;
  pi_group_id?: number | null; // WAJIB untuk POST backend kamu
  cpl_id?: number | null;
  performance_indicator_ids?: number[]; // boleh multi
  // FE-only (opsional)
  semester?: number | null;
  sifat?: string | null;
}

type AssasmentAreaOption = { id: number; nama: string };
type PIGroupOption = { id: number; kode_grup: string; assesment_id: number };
type CPLOption = { id: number; kode_cpl: string; deskripsi: string };
type PIOpOption = { id: number; deskripsi: string };


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MatakuliahModalData) => void | Promise<void>;
  submitting?: boolean;
  kurikulumId: number; // untuk fetch options
}

export default function MatakuliahModal({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  kurikulumId,
}: Props) {
  const [kodeMk, setKodeMk] = useState("");
  const [nama, setNama] = useState("");
  const [sks, setSks] = useState<number>(3);

  const [semester, setSemester] = useState<number | null>(null); // FE-only
  const [sifat, setSifat] = useState<string | null>(null);       // FE-only

  // options
  const [areas, setAreas] = useState<AssasmentAreaOption[]>([]);
  const [piGroups, setPiGroups] = useState<PIGroupOption[]>([]);
  const [cpls, setCpls] = useState<CPLOption[]>([]);
  const [piIndicators, setPiIndicators] = useState<PIOpOption[]>([]);

  // selections
  const [areaId, setAreaId] = useState<number | "">("");
  const [piGroupId, setPiGroupId] = useState<number | "">("");
  const [cplId, setCplId] = useState<number | "">("");
  const [selectedPiIndIds, setSelectedPiIndIds] = useState<number[]>([]);

  // fetch option lists
  useEffect(() => {
    if (!isOpen || !kurikulumId) return;

    const run = async () => {
      try {
        const [rAreas, rPiGroups, rCpls] = await Promise.all([
          fetch(`/api/kurikulum/${kurikulumId}/assasment-area`, { cache: "no-store" }),
          fetch(`/api/kurikulum/${kurikulumId}/pi-group`, { cache: "no-store" }),
          fetch(`/api/kurikulum/${kurikulumId}/cpl`, { cache: "no-store" }),
        ]);

        const [areasJson, piGroupsJson, cplsJson] = await Promise.all([
          rAreas.ok ? rAreas.json() : [],
          rPiGroups.ok ? rPiGroups.json() : [],
          rCpls.ok ? rCpls.json() : [],
        ]);

        setAreas(Array.isArray(areasJson) ? areasJson : areasJson?.data ?? []);
        setPiGroups(Array.isArray(piGroupsJson) ? piGroupsJson : piGroupsJson?.data ?? []);
        setCpls(Array.isArray(cplsJson) ? cplsJson : cplsJson?.data ?? []);
      } catch {
        // biarin silent; user tetap bisa input mk saja
      }
    };

    run();
  }, [isOpen, kurikulumId]);

  // fetch indicators ketika PI Group berubah
  useEffect(() => {
    const loadIndicators = async () => {
      if (!piGroupId || typeof piGroupId !== "number") {
        setPiIndicators([]);
        setSelectedPiIndIds([]);
        return;
      }
      try {
        const r = await fetch(`/api/pi-group/${piGroupId}/performance-indicator`, { cache: "no-store" });
        const j = await r.json();
        const arr = Array.isArray(j) ? j : j?.data ?? [];
        setPiIndicators(arr);
      } catch {
        setPiIndicators([]);
      }
    };
    loadIndicators();
  }, [piGroupId]);

  // filter PI Group by Area (optional UX)
  const piGroupsFiltered = useMemo(() => {
    if (!areaId || typeof areaId !== "number") return piGroups;
    return piGroups.filter(pg => pg.assesment_id === areaId);
  }, [areaId, piGroups]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!kodeMk.trim() || !nama.trim()) return;
    const payload: MatakuliahModalData = {
      kode_mk: kodeMk.trim(),
      nama: nama.trim(),
      sks: Number(sks ?? 0),
      assesment_area_id: typeof areaId === "number" ? areaId : null,
      pi_group_id: typeof piGroupId === "number" ? piGroupId : null, // Wajib buat POST
      cpl_id: typeof cplId === "number" ? cplId : null,
      performance_indicator_ids: selectedPiIndIds,
      // FE-only
      semester: semester ?? null,
      sifat: sifat ?? null,
    };

    onSubmit(payload);
  };

  const toggleIndicator = (id: number) => {
    setSelectedPiIndIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Tambah Mata Kuliah</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Baris 1: Kode & Nama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KODE MATAKULIAH</label>
              <input value={kodeMk} onChange={e=>setKodeMk(e.target.value)} type="text" required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NAMA MATAKULIAH</label>
              <input value={nama} onChange={e=>setNama(e.target.value)} type="text" required className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          {/* Baris 2: Semester & SKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEMESTER (opsional)</label>
              <input value={semester ?? ""} onChange={e=>setSemester(e.target.value === "" ? null : Number(e.target.value))} type="number" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">JUMLAH SKS</label>
              <input value={sks} onChange={e=>setSks(Number(e.target.value))} type="number" required className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          {/* Baris 3: Sifat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SIFAT (opsional)</label>
            <select value={sifat ?? ""} onChange={e=>setSifat(e.target.value || null)} className="w-full px-3 py-2 border rounded-lg">
              <option value="">-</option>
              <option value="Wajib">Wajib</option>
              <option value="Pilihan">Pilihan</option>
            </select>
          </div>

          {/* Baris 4: Area & PI Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AREA (Assasment Area)</label>
              <select
                value={areaId}
                onChange={e => setAreaId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">- pilih area -</option>
                {areas.map(a => (
                  <option key={a.id} value={a.id}>{a.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PI CODE (PI Group)</label>
              <select
                value={piGroupId}
                onChange={e => setPiGroupId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">- pilih PI group -</option>
                {piGroupsFiltered.map(pg => (
                  <option key={pg.id} value={pg.id}>{pg.kode_grup}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">*Wajib dipilih, akan dikirim sebagai <code>pi_group_id</code> ke backend.</p>
            </div>
          </div>

          {/* Baris 5: ILO Code (CPL) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ILO CODE (CPL)</label>
            <select
              value={cplId}
              onChange={e => setCplId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">- pilih CPL -</option>
              {cpls.map(c => (
                <option key={c.id} value={c.id}>{c.kode_cpl} — {c.deskripsi?.slice(0, 80)}</option>
              ))}
            </select>
          </div>

          {/* Baris 6: Performance Indicators (multi) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PERFORMANCE INDICATORS (pilih satu/lebih)</label>
            {piIndicators.length === 0 ? (
              <div className="text-sm text-gray-500 border rounded-lg p-3">Tidak ada indikator / pilih PI Group dulu.</div>
            ) : (
              <div className="max-h-40 overflow-auto border rounded-lg p-2 space-y-2">
                {piIndicators.map(pi => (
                  <label key={pi.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedPiIndIds.includes(pi.id)}
                      onChange={() => toggleIndicator(pi.id)}
                    />
                    <span>{pi.deskripsi}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg"
            >
              <Save size={16} /> {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
