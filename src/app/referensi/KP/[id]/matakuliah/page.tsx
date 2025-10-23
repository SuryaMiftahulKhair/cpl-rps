"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ChevronLeft, Layers, Star, Eye, Plus, X, Save } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout"; // sesuaikan jika path beda

// --- Data Types ---
interface Matakuliah {
  id: string | number;
  kode: string;
  nama: string;
  semester: number;
  sks: number;
  sifat: string;
}

interface MatakuliahModalData {
  kode: string;
  nama: string;
  namaIng?: string;
  semester: string;
  sks: string;
  sifat: string;
}

// --- Modal Component (same markup) ---
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

    const formData = new FormData(e.currentTarget);

    const newMataKuliah: MatakuliahModalData = {
      kode: (formData.get("kodeMatakuliah") as string) ?? "",
      nama: (formData.get("namaMatakuliah") as string) ?? "",
      namaIng: (formData.get("namaMatakuliahIng") as string) ?? undefined,
      semester: (formData.get("semester") as string) ?? "0",
      sks: (formData.get("jumlahSKS") as string) ?? "0",
      sifat: (formData.get("sifatMatakuliah") as string) ?? "Wajib",
    };

    if (newMataKuliah.kode && newMataKuliah.nama) {
      void onSubmit(newMataKuliah);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="kodeMatakuliah" className="block text-sm font-medium text-gray-700 mb-1">KODE MATAKULIAH</label>
            <input type="text" id="kodeMatakuliah" name="kodeMatakuliah" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>

          <div>
            <label htmlFor="namaMatakuliah" className="block text-sm font-medium text-gray-700 mb-1">NAMA MATAKULIAH</label>
            <input type="text" id="namaMatakuliah" name="namaMatakuliah" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>

          <div>
            <label htmlFor="namaMatakuliahIng" className="block text-sm font-medium text-gray-700 mb-1">NAMA MATAKULIAH (ING)</label>
            <input type="text" id="namaMatakuliahIng" name="namaMatakuliahIng" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">SEMESTER</label>
            <input type="number" id="semester" name="semester" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>

          <div>
            <label htmlFor="jumlahSKS" className="block text-sm font-medium text-gray-700 mb-1">JUMLAH SKS</label>
            <input type="number" id="jumlahSKS" name="jumlahSKS" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>

          <div>
            <label htmlFor="sifatMatakuliah" className="block text-sm font-medium text-gray-700 mb-1">SIFAT MATAKULIAH</label>
            <select id="sifatMatakuliah" name="sifatMatakuliah" required defaultValue="Wajib" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition">
              <option value="Wajib">Wajib</option>
              <option value="Pilihan">Pilihan</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition shadow-md disabled:opacity-60"
            >
              <Save size={16} /> {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Page Component (client) ---
export default function Page() {
  const params = useParams();
  const router = useRouter();
  const kurikulumId = params?.id ?? "";
  const [data, setData] = useState<Matakuliah[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // load mata kuliah dari API saat mount / saat kurikulumId berubah
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!kurikulumId) {
          if (mounted) setData([]);
          return;
        }
        const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json) ? json : json?.data ?? [];
        const mapped: Matakuliah[] = list.map((m: any) => ({
          id: m.id,
          kode: m.kode,
          nama: m.nama,
          semester: Number(m.semester ?? 0),
          sks: Number(m.sks ?? 0),
          sifat: m.sifat ?? "Wajib",
        }));
        if (mounted) setData(mapped);
      } catch (err) {
        console.error("Fetch matakuliah error:", err);
        if (mounted) setError("Gagal memuat data matakuliah.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [kurikulumId]);

  // Async handler: POST ke API dan optimistic update
  const handleAddMatakuliah = async (newData: MatakuliahModalData) => {
    if (!kurikulumId) {
      setError("kurikulumId tidak tersedia.");
      return;
    }

    setError(null);
    setSubmitting(true);

    // buat optimistic item dengan id sementara
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: Matakuliah = {
      id: tempId,
      kode: newData.kode,
      nama: newData.nama,
      semester: parseInt(newData.semester || "0", 10),
      sks: parseInt(newData.sks || "0", 10),
      sifat: newData.sifat,
    };

    // tampilkan segera
    setData(prev => [optimisticItem, ...prev]);
    setIsModalOpen(false);

    try {
      // panggil API
      const payload = {
        kode: newData.kode,
        nama: newData.nama,
        sks: Number(newData.sks),
        semester: Number(newData.semester),
        sifat: newData.sifat,
      };

      const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `HTTP ${res.status}`);
      }

      const created = await res.json();

      // replace optimistic item dengan response dari server
      setData(prev => prev.map(item => item.id === tempId ? {
        id: created.id ?? createdId(created),
        kode: created.kode ?? optimisticItem.kode,
        nama: created.nama ?? optimisticItem.nama,
        semester: created.semester ?? optimisticItem.semester,
        sks: created.sks ?? optimisticItem.sks,
        sifat: created.sifat ?? optimisticItem.sifat,
      } : item));
    } catch (err: any) {
      console.error("Gagal menambah mata kuliah:", err);
      setError(err?.message ? String(err.message) : "Gagal menambahkan mata kuliah. Coba lagi.");
      // rollback optimistic
      setData(prev => prev.filter(item => item.id !== tempId));
    } finally {
      setSubmitting(false);
    }
  };

  const createdId = (obj: any) => (obj?.id ? String(obj.id) : `id-${Date.now()}`);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page Header and Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers size={24} className="text-indigo-600" />
            Kurikulum Program Studi
          </h1>

          {/* Actions (Data Baru, Sinkronisasi, dan Kembali) */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-3 py-2.5 rounded-lg shadow-md hover:bg-green-600 transition duration-150 transform hover:scale-[1.01]"
            >
              <Plus size={18} />.
            </button>

            <button
              onClick={async () => {
                // manual refresh
                setLoading(true);
                setError(null);
                try {
                  if (!kurikulumId) return;
                  const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`);
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const json = await res.json();
                  const list = Array.isArray(json) ? json : json?.data ?? [];
                  const mapped: Matakuliah[] = list.map((m: any) => ({
                    id: m.id,
                    kode: m.kode,
                    nama: m.nama,
                    semester: Number(m.semester ?? 0),
                    sks: Number(m.sks ?? 0),
                    sifat: m.sifat ?? "Wajib",
                  }));
                  setData(mapped);
                } catch (err) {
                  console.error(err);
                  setError("Gagal memuat data");
                } finally {
                  setLoading(false);
                }
              }}
              className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-sky-700 transition duration-150 transform hover:scale-[1.01]"
            >
              <RefreshCw size={18} />
              Sinkronisasi Neosia
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-gray-600 transition duration-150 transform hover:scale-[1.01]"
            >
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>
        </div>

        {/* show error if any */}
        {error && (
          <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Main Card Container */}
        <div className="bg-white shadow-xl rounded-xl">
          {/* Judul Data */}
          <h2 className="text-lg font-bold p-6 pb-2 text-gray-800">Data</h2>

          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-100 grid grid-cols-6 gap-4">
            <input type="text" placeholder="ID" className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="text" placeholder="Kode" className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="text" placeholder="Nama" className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="text" placeholder="Semester" className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="text" placeholder="SKS" className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="text" placeholder="Sifat" className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          {/* Table Wrapper */}
          <div className="overflow-x-auto border-t border-gray-200 rounded-b-xl">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              {/* Table Head */}
              <thead className="bg-indigo-50">
                <tr>
                  <th className="w-16 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">ID</th>
                  <th className="w-24 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">KODE</th>
                  <th className="px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">NAMA</th>
                  <th className="w-24 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">SEMESTER</th>
                  <th className="w-16 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">SKS</th>
                  <th className="w-16 px-6 py-3 text-left font-bold text-xs text-indigo-700 uppercase tracking-wider">SIFAT</th>
                  <th className="w-24 px-6 py-3 text-center font-bold text-xs text-indigo-700 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                      Tidak ada mata kuliah
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={String(item.id)} className="hover:bg-indigo-50/50 transition duration-100">
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">{item.id}</td>
                      <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-700">{item.kode}</td>
                      <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-800">{item.nama}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-600">{item.semester}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-600">{item.sks}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-600">{item.sifat}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-center space-x-2">
                        <button className="p-1.5 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition duration-150" title="Set RPS Utama">
                          <Star size={16} />
                        </button>
                        <button className="p-1.5 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition duration-150" title="Lihat Detail">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Menampilkan total <span className="font-semibold">{data.length}</span> Mata Kuliah dalam kurikulum ini.
            </p>
          </div>
        </div>

        {/* MODAL INTEGRATION */}
        <MatakuliahModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddMatakuliah}
          submitting={submitting}
        />
      </div>
    </DashboardLayout>
  );
}
