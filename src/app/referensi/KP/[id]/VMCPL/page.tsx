// src/app/referensi/KP/[id]/VMPCL/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, ChevronLeft, Plus, Layers } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useParams, useRouter } from "next/navigation";

type PIRow = {
  area: string;         // AssasmentArea.nama
  piCode: string;       // PIGroup.kode_grup
  iloCode: string;      // CPL.kode_cpl
  ilo: string;          // CPL.deskripsi
  indicators: string[]; // PerformanceIndicator[].deskripsi
};

const VisiMisiContent = () => (
  <div className="p-6 lg:p-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Visi, Misi, dan Profil Lulusan</h2>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <Edit size={18} />
          <span>Edit</span>
        </button>
        <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <ChevronLeft size={18} />
          <span>Kembali</span>
        </button>
      </div>
    </div>

    <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
      <div className="space-y-3 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded" />
          Visi
        </h3>
        <p className="text-gray-700 leading-relaxed pl-3">
          Pusat unggulan dalam pendidikan, penelitian dan penerapan teknologi informasi berbasis jaringan komputer dan sistem
          cerdas berlandaskan Benua Maritim Indonesia tahun 2025
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded" />
          Misi
        </h3>
        <ol className="space-y-4 pl-3">
          {[
            "Menghasilkan lulusan yang memiliki sikap dan tata nilai yang baik, serta memiliki kompetensi di bidang teknologi informasi berbasis jaringan komputer dan sistem cerdas",
            "Menghasilkan karya-karya ilmiah dibidang teknologi informasi berbasis jaringan komputer dan sistem cerdas yang bermanfaat bagi masyarakat",
            "Menyebarluaskan teknologi berdaya guna bagi masyarakat melalui pengabdian kepada masyarakat",
            "Menjalin dan mempererat kerjasama dengan institusi terkait dalam dan luar negeri untuk meningkatkan kualitas pendidikan",
          ].map((t, i) => (
            <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
              <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </span>
              <span className="pt-0.5">{t}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

const PITableContent = () => {
  const params = useParams();
  const router = useRouter();
  const kurikulumId = Number((params as any)?.id);

  const [rows, setRows] = useState<PIRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadPI = async () => {
    setLoading(true);
    setErr(null);
    try {
      if (!kurikulumId || Number.isNaN(kurikulumId)) {
        setRows([]);
        setErr("Kurikulum ID tidak valid.");
        return;
      }

      // NOTE: path disesuaikan dengan API di atas (VMCPL)
      const res = await fetch(`/api/kurikulum/${kurikulumId}/VMCPL`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        const txt = contentType.includes("application/json")
          ? JSON.stringify(await res.json()).slice(0, 400)
          : (await res.text()).slice(0, 400);
        throw new Error(txt || `HTTP ${res.status}`);
      }
      if (!contentType.includes("application/json")) {
        throw new Error("Unexpected response (bukan JSON). Cek path API dan penamaan folder (case-sensitive).");
      }

      const json = await res.json();
      const list: PIRow[] = Array.isArray(json) ? json : json?.data ?? [];
      setRows(list);
    } catch (e: any) {
      console.error("Fetch PI error:", e);
      setErr(e?.message ?? "Gagal memuat data PI.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kurikulumId]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Performance Indicator for ILO Measurement</h2>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
          <Plus size={18} />
          <span>Tambah Baru</span>
        </button>
      </div>

      {err && <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded">{err}</div>}

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
              <tr>
                <th className="w-32 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">Area</th>
                <th className="w-24 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">PI Code</th>
                <th className="w-24 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">ILO Code</th>
                <th className="px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">Intended Learning Outcomes</th>
                <th className="px-4 py-4 text-left font-semibold text-xs text-indigo-800 uppercase tracking-wider">Performance Indicators</th>
                <th className="w-28 px-4 py-4 text-center font-semibold text-xs text-indigo-800 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">Memuat data...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">Belum ada data PI untuk kurikulum ini.</td>
                </tr>
              ) : (
                rows.map((item, idx) => (
                  <tr
                    key={`${item.piCode}-${item.iloCode}-${idx}`}
                    className={`hover:bg-indigo-50/30 transition-colors duration-150 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {item.area}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-indigo-700">{item.piCode}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-green-700">{item.iloCode}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-700 max-w-md leading-relaxed text-sm">{item.ilo}</td>
                    <td className="px-4 py-4 text-gray-700 max-w-md leading-relaxed text-sm">
                      <ul className="list-disc list-inside space-y-1">
                        {item.indicators.map((indicator, i) => (
                          <li key={i} className="text-sm">{indicator}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-150 group" title="Edit">
                          <Edit size={16} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150 group" title="Hapus">
                          <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
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

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Menampilkan {rows.length} data Performance Indicator</span>
      </div>
    </div>
  );
};

export default function VisiMisiCPLPage() {
  const [activeTab, setActiveTab] = useState<"visi_misi" | "pi_data">("visi_misi");

  return (
    <DashboardLayout>
      <div className="px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Layers size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kurikulum Program Studi</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola visi, misi, target CPL, dan performance indicator program studi</p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8">
        <div className="border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
          <div className="flex space-x-8 px-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("visi_misi")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeTab === "visi_misi"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Visi, Misi, Profil Lulusan
            </button>
            <button
              onClick={() => setActiveTab("pi_data")}
              className={`py-4 border-b-2 transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeTab === "pi_data"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Performance Indicator
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-8">
        <div className="bg-gray-50 rounded-b-xl shadow-sm border-x border-b border-gray-200">
          {activeTab === "visi_misi" && <VisiMisiContent />}
          {activeTab === "pi_data" && <PITableContent />}
        </div>
      </div>
    </DashboardLayout>
  );
}
