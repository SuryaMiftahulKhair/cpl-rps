// File: /app/rps/[id]/list/[id_matakuliah]/buat/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ArrowLeft, Save, Loader2, Calendar, FileText } from "lucide-react";

export default function BuatRPSPage() {
  const router = useRouter();
  const params = useParams();
  
  const kurikulumId = params.id;
  const matakuliahId = params.id_matakuliah;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tahun: new Date().getFullYear().toString(), // "2024"
    semester: "1", // "1" atau "2"
    keterangan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch('/api/rps/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matakuliah_id: matakuliahId,
        tahun: formData.tahun,
        semester: formData.semester,
        keterangan: formData.keterangan
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      // CEK DULU console.log untuk lihat response
      console.log("API Create Response:", result);
      
      if (result.success && result.data && result.data.id) {
        // Redirect ke detail dengan ID yang benar
        router.push(`/rps/${kurikulumId}/list/${matakuliahId}/detail/${result.data.id}`);
      } else {
        alert("Gagal mendapatkan ID RPS dari response");
      }
    } else {
      const error = await response.json();
      alert(error.error || "Gagal membuat RPS");
    }
  } catch (error) {
    console.error('Error:', error);
    alert("Terjadi kesalahan saat menyimpan RPS");
  } finally {
    setLoading(false);
  }
};

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-indigo-600" />
              Buat RPS Baru
            </h1>
            <p className="text-gray-600 mt-1">
              Matakuliah ID: {matakuliahId}
            </p>
          </div>
          
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
        </div>

        {/* Simple Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border p-6 space-y-6">
          {/* Tahun */}
          <div>
            <label className="block text-sm font-medium mb-2 items-center gap-2">
              <Calendar size={16} />
              Tahun *
            </label>
            <select
              value={formData.tahun}
              onChange={(e) => setFormData({...formData, tahun: e.target.value})}
              className="w-full border rounded-lg p-2.5"
              required
            >
              <option value="">-- Pilih Tahun --</option>
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Semester *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="semester"
                  value="1"
                  checked={formData.semester === "1"}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="text-indigo-600"
                />
                <span>Semester 1 (Gasal)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="semester"
                  value="2"
                  checked={formData.semester === "2"}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="text-indigo-600"
                />
                <span>Semester 2 (Genap)</span>
              </label>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Keterangan (Nama Kelas/RPS)
            </label>
            <input
              type="text"
              value={formData.keterangan}
              onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
              placeholder="Contoh: RPS Semester Gasal 2024"
              className="w-full border rounded-lg p-2.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Jika kosong, akan dibuat otomatis: "RPS {formData.tahun} Semester {formData.semester}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Buat RPS
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Catatan:</strong> RPS baru akan dibuat dengan:
          </p>
          <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
            <li>Data tahun ajaran baru</li>
            <li>Kelas baru sebagai container RPS</li>
            <li>RPS kosong siap diisi CPMK, pertemuan, dll</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}