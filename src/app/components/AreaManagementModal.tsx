// file: src/app/components/AreaManagementModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

type Area = {
  id: number;
  nama: string;
};

interface FormValues {
  nama: string;
}

export interface AreaManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kurikulumId: number;
}

async function parseApiError(res: Response) {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

export default function AreaManagementModal({
  isOpen,
  onClose,
  onSuccess,
  kurikulumId,
}: AreaManagementModalProps) {
  const [data, setData] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // ================= LOAD DATA =================
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/assasment-area`);
      if (!res.ok) throw new Error(await parseApiError(res));
      setData(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setIsFormOpen(false);
      reset();
    }
  }, [isOpen, kurikulumId, reset]);

  // ================= FORM =================
  const openForm = (item: Area | null = null) => {
    setSelectedArea(item);
    reset({ nama: item?.nama ?? "" });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    reset();
    setSelectedArea(null);
    setIsFormOpen(false);
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);

    const url = selectedArea
      ? `/api/kurikulum/${kurikulumId}/assasment-area/${selectedArea.id}`
      : `/api/kurikulum/${kurikulumId}/assasment-area`;

    const method = selectedArea ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error(await parseApiError(res));

      closeForm();
      loadData();
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus Area ini?")) return;

    try {
      const res = await fetch(
        `/api/kurikulum/${kurikulumId}/assasment-area/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error(await parseApiError(res));
      loadData();
      onSuccess();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl my-8">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Kelola Assessment Area
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>

        <div className="p-6">

          {/* FORM */}
          {isFormOpen ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mb-5 p-4 rounded-lg bg-gray-50 border space-y-3"
            >
              <h3 className="font-semibold text-gray-900">
                {selectedArea ? "Edit Area" : "Tambah Area"}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Area
                </label>
                <input
                  {...register("nama", {
                    required: "Nama area wajib diisi",
                  })}
                  className="
                    w-full px-3 py-2
                    border border-gray-300
                    rounded-lg
                    text-gray-900
                    focus:ring-2 focus:ring-indigo-500
                    outline-none
                  "
                  placeholder="Contoh: Sikap, Pengetahuan, Keterampilan"
                />
                {errors.nama && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.nama.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Simpan
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => openForm()}
              className="mb-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus size={18} />
              Tambah Area
            </button>
          )}

          {/* TABLE */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Nama Area
                  </th>
                  <th className="w-28 px-4 py-3 text-center font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-gray-500">
                      Belum ada Area.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openForm(item)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
