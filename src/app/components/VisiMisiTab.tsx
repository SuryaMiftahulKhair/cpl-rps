"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit, Save, X, Plus, Trash2, Loader2 } from "lucide-react";

interface VisiMisiTabProps {
  kurikulumId: number;
  prodiId: string | null;
}

export default function VisiMisiTab({
  kurikulumId,
  prodiId,
}: VisiMisiTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Data
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    if (!prodiId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/kurikulum/${kurikulumId}/VMCPL?prodiId=${prodiId}`,
      );
      const json = await res.json();
      if (json.success) {
        setVisi(json.data.visi || ""); // Langsung dari data kurikulum
        setMisi(json.data.misi || []);
      }
    } catch (error) {
      console.error("Gagal load Visi Misi:", error);
    } finally {
      setLoading(false);
    }
  }, [kurikulumId, prodiId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/kurikulum/${kurikulumId}/VMCPL`, {
        method: "PATCH", // Gunakan PATCH ke endpoint Kurikulum yang sama
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visi, misi }),
      });
      if (res.ok) setIsEditing(false);
    } catch (error) {
      alert("Gagal menyimpan perubahan");
    } finally {
      setSubmitting(false);
    }
  };

  const addMisi = () => setMisi([...misi, ""]);
  const updateMisi = (index: number, value: string) => {
    const newMisi = [...misi];
    newMisi[index] = value;
    setMisi(newMisi);
  };
  const deleteMisi = (index: number) =>
    setMisi(misi.filter((_, i) => i !== index));

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin inline mr-2" /> Memuat Visi & Misi...
      </div>
    );

  return (
    <div className="p-6 lg:p-8">
      <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8 relative">
        {/* Tombol Aksi */}
        <div className="absolute top-6 right-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all text-sm font-medium">
              <Edit size={16} /> Edit Visi & Misi
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm">
                <X size={16} /> Batal
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm shadow-md">
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}{" "}
                Simpan
              </button>
            </div>
          )}
        </div>

        {/* VISI */}
        <div className="space-y-3 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-600 rounded" /> Visi
          </h3>
          {isEditing ? (
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-black"
              rows={3}
              value={visi}
              onChange={(e) => setVisi(e.target.value)}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed pl-3 italic">
              {visi || "Visi belum diatur."}
            </p>
          )}
        </div>

        {/* MISI */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-600 rounded" /> Misi
          </h3>

          <div className="space-y-4 pl-3">
            {misi.map((t, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold mt-1">
                  {i + 1}
                </span>
                {isEditing ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      className="flex-1 p-2 border rounded-md text-sm outline-none focus:border-indigo-500 text-black"
                      value={t}
                      onChange={(e) => updateMisi(i, e.target.value)}
                    />
                    <button
                      title="Hapus Misi"
                      onClick={() => deleteMisi(i)}
                      className="text-red-500 p-2 hover:bg-red-50 rounded-md">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-700 leading-relaxed pt-1">
                    {t}
                  </span>
                )}
              </div>
            ))}

            {isEditing && (
              <button
                onClick={addMisi}
                className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg text-sm font-medium mt-2">
                <Plus size={16} /> Tambah Baris Misi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
