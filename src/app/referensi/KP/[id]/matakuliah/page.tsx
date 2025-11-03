// src/app/referensi/KP/[id]/matakuliah/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ChevronLeft, Layers, Star, Eye, Plus, X, Save } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types (sesuai prisma schema mata_kuliah) ---
interface Matakuliah {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  kurikulum_id?: number;
  // semester / sifat mungkin tidak ada di DB; tampilkan jika ada
  semester?: number | null;
  sifat?: string | null;
}

interface MatakuliahModalData {
  kode_mk: string;
  nama: string;
  sks: string | number;
  semester?: string | number | null;
  sifat?: string | null;
}

// ---------------- MatakuliahModal (UI tetap) ----------------
interface MatakuliahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MatakuliahModalData) => void | Promise<void>;
  submitting?: boolean;
}
function MatakuliahModal({ isOpen, onClose, onSubmit, submitting = false }: MatakuliahModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    const payload: MatakuliahModalData = (() => {
      const rawSks = fd.get("jumlahSKS");
      const sksParsed = typeof rawSks === "string" ? (rawSks.trim() === "" ? 0 : Number(rawSks)) : 0;

      const rawSemester = fd.get("semester");
      const semesterParsed = typeof rawSemester === "string" ? (rawSemester.trim() === "" ? null : Number(rawSemester)) : null;

      const rawSifat = fd.get("sifatMatakuliah");
      const sifatParsed = typeof rawSifat === "string" ? (rawSifat === "" ? null : rawSifat) : null;

      return {
        kode_mk: String(fd.get("kodeMatakuliah") ?? "").trim(),
        nama: String(fd.get("namaMatakuliah") ?? "").trim(),
        sks: sksParsed,
        semester: semesterParsed,
        sifat: sifatParsed,
      };
    })();
    if (!payload.kode_mk || !payload.nama) return; // simple guard
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Tambah Mata Kuliah</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="kodeMatakuliah" className="block text-sm font-medium text-gray-700 mb-1">KODE MATAKULIAH</label>
            <input id="kodeMatakuliah" name="kodeMatakuliah" type="text" required className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div>
            <label htmlFor="namaMatakuliah" className="block text-sm font-medium text-gray-700 mb-1">NAMA MATAKULIAH</label>
            <input id="namaMatakuliah" name="namaMatakuliah" type="text" required className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">SEMESTER (opsional)</label>
              <input id="semester" name="semester" type="number" className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <label htmlFor="jumlahSKS" className="block text-sm font-medium text-gray-700 mb-1">JUMLAH SKS</label>
              <input id="jumlahSKS" name="jumlahSKS" type="number" required defaultValue={3} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label htmlFor="sifatMatakuliah" className="block text-sm font-medium text-gray-700 mb-1">SIFAT (opsional)</label>
            <select id="sifatMatakuliah" name="sifatMatakuliah" className="w-full px-3 py-2 border rounded-lg">
              <option value="">-</option>
              <option value="Wajib">Wajib</option>
              <option value="Pilihan">Pilihan</option>
            </select>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg">
              <Save size={16} /> {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------- Page Component (fetch real data, no dummy) ----------------
export default function MatakuliahListPage() {
  const params = useParams();
  const router = useRouter();
  const kurikulumIdRaw = (params as any)?.id;
  const kurikulumId = kurikulumIdRaw ? Number(kurikulumIdRaw) : NaN;

  const [data, setData] = useState<Matakuliah[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extras, setExtras] = useState<Record<string, { semester?: number | null; sifat?: string | null }>>({});

  const parseApiError = async (res: Response) => {
    try {
      const j = await res.json().catch(() => null);
      if (j && (j.error || j.detail || j.message)) return j.error ?? j.detail ?? j.message;
      return await res.text().catch(() => `${res.status}`);
    } catch {
      return `${res.status}`;
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!kurikulumId || Number.isNaN(kurikulumId)) {
        setData([]);
        setError("kurikulum id tidak tersedia atau tidak valid.");
        return;
      }

      const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`);
      if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));

      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data ?? [];

      // gabungkan extras (semester/sifat) dengan data server berdasarkan kode_mk
      const mapped: Matakuliah[] = list.map((r: any) => {
        const kode = r.kode_mk ?? r.kode ?? "";
        const extra = extras[kode] || {};
        return {
          id: Number(r.id),
          kode_mk: kode,
          nama: r.nama ?? "",
          sks: Number(r.sks ?? 0),
          kurikulum_id: Number(r.kurikulum_id ?? r.kurikulumId ?? kurikulumId),
          semester: extra.semester ?? (r.semester != null ? Number(r.semester) : undefined),
          sifat: extra.sifat ?? (r.sifat ?? undefined),
        };
      });

      setData(mapped);
    } catch (err: any) {
      console.error("GET matakuliah error:", err);
      setError(err?.message ?? "Terjadi kesalahan saat memuat data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kurikulumIdRaw]);


const handleAddMatakuliah = async (payload: MatakuliahModalData) => {
  setSubmitting(true);
  setError(null);
  try {
    if (!kurikulumId || Number.isNaN(kurikulumId)) throw new Error("kurikulum id tidak valid.");

    // API hanya menerima: kode_mk, nama, sks, pi_group_id
    const body = {
      kode_mk: payload.kode_mk,
      nama: payload.nama,
      sks: Number(payload.sks ?? 0),
      pi_group_id: 0, // sementara default 0 (atau nanti pilih dari dropdown PI Group)
    };

    const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await parseApiError(res);
      throw new Error(txt || `HTTP ${res.status}`);
    }

    await loadData();
    setIsModalOpen(false);

  } catch (err: any) {
    console.error("POST matakuliah error:", err);
    setError(err?.message ?? "Gagal menambahkan mata kuliah.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers size={24} className="text-indigo-600" />
            Kurikulum Program Studi
          </h1>

          <div className="flex gap-3">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-green-500 text-white px-3 py-2.5 rounded-lg">
              <Plus size={18} /> Tambah
            </button>
            <button onClick={() => void loadData()} className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg">
              <RefreshCw size={18} /> Refresh
            </button>
            <button onClick={() => router.back()} className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-lg">
              <ChevronLeft size={18} /> Kembali
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded">{error}</div>}

        <div className="bg-white shadow-xl rounded-xl">
          <h2 className="text-lg font-bold p-6 pb-2 text-gray-800">Data</h2>

          <div className="p-4 border-b border-gray-100 grid grid-cols-6 gap-4">
            <input type="text" placeholder="ID" className="col-span-1 px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Kode" className="col-span-1 px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Nama" className="col-span-1 px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Semester" className="col-span-1 px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="SKS" className="col-span-1 px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Sifat" className="col-span-1 px-3 py-2 border rounded-lg text-sm" />
          </div>

          <div className="overflow-x-auto border-t border-gray-200 rounded-b-xl">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="w-16 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase">ID</th>
                  <th className="w-24 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase">KODE</th>
                  <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase">NAMA</th>
                  <th className="w-24 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase">SEMESTER</th>
                  <th className="w-16 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase">SKS</th>
                  <th className="w-16 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase">SIFAT</th>
                  <th className="w-24 px-6 py-3 text-center font-bold text-xs text-indigo-700 uppercase">Aksi</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">Tidak ada mata kuliah</td></tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-indigo-50/50 transition">
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">{item.id}</td>
                      <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-700">{item.kode_mk}</td>
                      <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-800">{item.nama}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-600">{item.semester ?? "-"}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-600">{item.sks}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-600">{item.sifat ?? "-"}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-center space-x-2">
                        <button className="p-1.5 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition" title="Set RPS Utama"><Star size={16} /></button>
                        <button className="p-1.5 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition" title="Lihat Detail"><Eye size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">Menampilkan total <span className="font-semibold">{data.length}</span> Mata Kuliah dalam kurikulum ini.</p>
          </div>
        </div>

        <MatakuliahModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddMatakuliah} submitting={submitting} />
      </div>
    </DashboardLayout>
  );
}
