"use client";

import { useState, useEffect, use } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Edit,
  Target,
  Loader2,
  Printer,
  Plus,
  X,
  Save,
  CheckSquare,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- IMPORT MODAL KOMPONEN ---
import CpmkModal from "@/app/components/detail-rps/CpmkModal";
import PertemuanModal from "@/app/components/detail-rps/PertemuanModal";
import OtorisasiModal from "@/app/components/detail-rps/OtorisasiModel";

// --- HELPER COMPONENTS (WEB ONLY) ---
function SectionHeader({ title, icon, onEdit, action }: any) {
  return (
    <div className="flex items-center justify-between bg-slate-600 text-white px-4 py-3 rounded-t-lg no-print">
      <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
        {icon} {title}
      </h3>
      <div className="flex items-center gap-2">
        {action}
        {onEdit && (
          <button
            title="Edit"
            onClick={onEdit}
            className="p-1.5 hover:bg-slate-700 rounded">
            <Edit size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex py-2 border-b border-gray-100">
      <div className="w-1/3 font-semibold text-gray-900 text-sm uppercase">
        {label}
      </div>
      <div className="w-2/3 text-gray-900 text-sm">{String(value || "-")}</div>
    </div>
  );
}

export default function DetailRPSPage({
  params,
}: {
  params: Promise<{ id: string; id_matakuliah: string; id_rps: string }>;
}) {
  const { id, id_matakuliah, id_rps } = use(params);
  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId");

  const [rpsData, setRpsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showPertemuanModal, setShowPertemuanModal] = useState(false);
  const [showCpmkModal, setShowCpmkModal] = useState(false);
  const [dosenList, setDosenList] = useState([]);

  const otorisasiForm = useForm<any>();

  const fetchRPSData = async () => {
    try {
      const res = await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`);
      const json = await res.json();
      if (json.success) setRpsData(json.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDosen = async () => {
    try {
      const res = await fetch(`/api/users/dosen?prodiId=${prodiId}`);
      const json = await res.json();
      if (json.success) setDosenList(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (prodiId) {
      fetchRPSData();
      fetchDosen();
    }
  }, [id_rps, prodiId]);

  const handleSaveOtorisasi = async (formData: any) => {
    setIsSaving(true);
    try {
      // Pastikan kita mengirim array string murni ["Nama 1", "Nama 2"]
      const listNamaPenyusun = formData.penyusun
        .map((p: any) => p.nama)
        .filter((n: string) => n.trim() !== "");

      const payload = {
        section: "otorisasi",
        data: {
          // Kita kirim objek ini, backend harus siap menerima
          nama_penyusun: listNamaPenyusun,
          nama_koordinator: formData.koordinator,
          nama_kaprodi: formData.kaprodi,
        },
      };

      const res = await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan ke server");
      }

      await fetchRPSData();
      setEditingSection(null);
    } catch (error: any) {
      alert("Error Server: " + error.message);
      console.error("Detail Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- SAVE HANDLERS (DILENGKAPI DENGAN FETCH) ---

  const handleSaveCpmk = async (formData: any) => {
    setIsSaving(true);
    try {
      // Log untuk cek data sebelum dikirim (cek di console browser)
      console.log("Data yang dikirim ke API:", formData);

      const res = await fetch("/api/rps/cpmk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rps_id: Number(id_rps), // Pastikan angka
          kode_cpmk: formData.kode, // Sesuaikan 'kode' dari modal ke 'kode_cpmk' API
          deskripsi: formData.deskripsi,
          ik_id: formData.ik_id ? Number(formData.ik_id) : null, // Pastikan angka
          prodiId: prodiId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        // Jika error 400, tampilkan pesan error detail dari backend
        throw new Error(result.error || "Gagal menyimpan CPMK");
      }

      await fetchRPSData();
      setShowCpmkModal(false);
    } catch (error: any) {
      alert("Kesalahan: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePertemuan = async (formData: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/rps/pertemuan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rps_id: Number(id_rps),
          pekan_ke: Number(formData.pekan_ke),
          bobot_nilai: Number(formData.bobot_nilai),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal simpan");
      }

      await fetchRPSData();
      setShowPertemuanModal(false);
    } catch (error: any) {
      alert("Kesalahan: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center h-screen items-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  if (!rpsData) return null;

  const matkul = rpsData?.matakuliah || {};

  return (
    <DashboardLayout>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #pdf-area,
          #pdf-area * {
            visibility: visible !important;
          }
          #pdf-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          * {
            font-family: "Arial", sans-serif !important;
            color: black !important;
          }
          .pdf-sampul {
            height: 98vh;
            display: flex !important;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            page-break-after: always;
            text-align: center;
          }
          .pdf-page {
            display: block !important;
            page-break-after: always;
            padding: 20mm;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1px solid black !important;
            margin: 10px 0;
          }
          th,
          td {
            border: 1px solid black !important;
            padding: 8px !important;
            font-size: 10pt !important;
            text-align: left !important;
          }
          th {
            background-color: #f2f2f2 !important;
            font-weight: bold;
          }
        }
      `}</style>

      {/* --- TAMPILAN DASHBOARD WEB (SLATE) --- */}
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen no-print">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 uppercase">
            Detail RPS: {matkul.nama}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/rps/${id}/list/${id_matakuliah}?prodiId=${prodiId}`}
              className="bg-white border px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-gray-50 shadow-sm">
              <ChevronLeft size={16} /> Kembali
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-red-600 text-white px-4 py-2 rounded flex gap-2 shadow-md hover:bg-red-700 transition-all font-bold">
              <Printer size={16} /> Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-2">
            <InfoRow label="MATA KULIAH" value={matkul.nama} />
            <InfoRow label="KODE" value={matkul.kode_mk} />
            <InfoRow label="BOBOT" value={matkul.sks} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader
              title="Otorisasi"
              onEdit={() => setEditingSection("otorisasi")}
            />
            <div className="p-4 space-y-3">
              {/* BAGIAN PENYUSUN */}
              <div>
                <strong className="text-gray-900 text-xs uppercase tracking-wider">
                  Dosen Penyusun:
                </strong>
                <div className="text-gray-900 text-[11px] mt-1 space-y-1">
                  {(() => {
                    // Ambil data murni, jika Prisma mengembalikan {set: []}, ambil dalamnya
                    const rawData = rpsData.nama_penyusun;
                    const names =
                      rawData && typeof rawData === "object" && "set" in rawData
                        ? rawData.set
                        : rawData;

                    return Array.isArray(names) ? (
                      names.map((nama: string, idx: number) => (
                        <p key={idx}>
                          {idx + 1}. {nama}
                        </p>
                      ))
                    ) : (
                      <p>{names || "-"}</p>
                    );
                  })()}
                </div>
              </div>

              {/* BAGIAN KOORDINATOR MK */}
              <div className="pt-2 border-t border-gray-50">
                <strong className="text-gray-900 text-xs uppercase tracking-wider">
                  Koordinator MK:
                </strong>
                <p className="text-gray-900 text-sm font-medium mt-1">
                  {String(rpsData.nama_koordinator || "-")}
                </p>
              </div>

              {/* BAGIAN KAPRODI */}
              <div className="pt-2 border-t border-gray-50">
                <strong className="text-gray-900 text-xs uppercase tracking-wider">
                  Ketua Program Studi:
                </strong>
                <p className="text-gray-900 text-sm font-medium mt-1">
                  {String(rpsData.nama_kaprodi || "-")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL CPMK DASHBOARD */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
          <SectionHeader
            title="CPMK"
            icon={<Target size={16} />}
            action={
              <button
                onClick={() => setShowCpmkModal(true)}
                className="bg-teal-600 text-white px-2 py-1 rounded text-xs flex gap-1">
                <Plus size={14} /> Tambah
              </button>
            }
          />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {rpsData.cpmk?.map((item: any) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-gray-50/30 text-black">
                <span className="font-bold text-indigo-700 text-xs ">
                  {item.kode_cpmk}
                </span>
                <p className="text-gray-900 text-sm mt-1">{item.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TABEL RENCANA MINGGUAN DASHBOARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-slate-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase">Rencana Mingguan</h3>
            <button
              onClick={() => setShowPertemuanModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm flex gap-2">
              <Plus size={16} /> Tambah Pertemuan
            </button>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100 text-blue-700 border-b border-gray-200">
                  <th>Mg</th>
                  <th>Kemampuan Akhir</th>
                  <th>Indikator</th>
                  <th>Metode</th>
                  <th>Bobot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-black">
                {rpsData.pertemuan?.map((p: any) => (
                  <tr key={p.id}>
                    <td className="text-center">{p.pekan_ke}</td>
                    <td>{p.kemampuan_akhir}</td>
                    <td>{p.kriteria_penilaian}</td>
                    <td>{p.metode_pembelajaran}</td>
                    <td className="text-center">{p.bobot_nilai}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================
          --- AREA KHUSUS PDF ---
          ============================================================ */}
      <div id="pdf-area" className="hidden print:block">
        <div className="pdf-sampul">
          <h1 className="text-3xl font-bold uppercase">
            RENCANA PEMBELAJARAN SEMESTER (RPS)
          </h1>
          <h2 className="text-xl font-bold mt-4 uppercase">
            MATA KULIAH: {matkul.nama} ({matkul.kode_mk})
          </h2>
          <div className="my-12">
            <img src="/logo-unhas.png" alt="Logo UNHAS" width="250" />
          </div>
          <div className="mt-auto text-lg font-bold uppercase">
            UNIVERSITAS HASANUDDIN
            <br />
            FAKULTAS TEKNIK
            <br />
            PRODI TEKNIK INFORMATIKA
            <br />
            TAHUN {new Date().getFullYear()}
          </div>
        </div>

        <div className="pdf-page">
          <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
            I. KURIKULUM & VISI MISI
          </h2>
          <p>
            <strong>Kurikulum:</strong> {rpsData?.kurikulum_nama || "K23"} -
            Berbasis OBE
          </p>
          <div className="mt-10">
            <h3 className="font-bold uppercase text-center mb-4 underline">
              OTORISASI / PENGESAHAN
            </h3>
            <table className="text-center">
              <thead>
                <tr>
                  <th>Penyusun</th>
                  <th>Koordinator MK</th>
                  <th>Ketua Prodi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-24">
                  <td>
                    {Array.isArray(rpsData.nama_penyusun)
                      ? rpsData.nama_penyusun.join(", ")
                      : rpsData.nama_penyusun}
                  </td>
                  <td>{String(rpsData.nama_koordinator || "-")}</td>
                  <td>{String(rpsData.nama_kaprodi || "-")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="pdf-page">
          <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
            II. CAPAIAN PEMBELAJARAN (CPMK) & INDIKATOR KINERJA (IK)
          </h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Kode</th>
                <th style={{ width: "45%" }}>CPMK</th>
                <th style={{ width: "45%" }}>Indikator Kinerja (IK)</th>
              </tr>
            </thead>
            <tbody>
              {rpsData.cpmk?.map((item: any) => (
                <tr key={item.id}>
                  <td className="font-bold text-center">{item.kode_cpmk}</td>
                  <td>{item.deskripsi}</td>
                  <td>
                    {item.ik && item.ik.length > 0 ? (
                      item.ik.map((ik: any, idx: number) => (
                        <div key={idx} className="mb-1">
                          <span className="font-bold">[{ik.kode_ik}]</span>{" "}
                          {ik.deskripsi}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">
                        Tidak ada IK terikat
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pdf-page">
          <h2 className="font-bold border-b-2 border-black pb-1 mb-4 uppercase">
            III. RENCANA PEMBELAJARAN MINGGUAN
          </h2>
          <table>
            <thead>
              <tr>
                <th>Mg</th>
                <th>Kemampuan Akhir</th>
                <th>Indikator & Kriteria</th>
                <th>Metode</th>
                <th>Bobot</th>
              </tr>
            </thead>
            <tbody>
              {rpsData.pertemuan?.map((p: any) => (
                <tr key={p.id}>
                  <td className="text-center">{p.pekan_ke}</td>
                  <td>{p.kemampuan_akhir}</td>
                  <td>{p.kriteria_penilaian}</td>
                  <td>{p.metode_pembelajaran}</td>
                  <td className="text-center">{p.bobot_nilai}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OtorisasiModal
        isOpen={editingSection === "otorisasi"}
        onClose={() => setEditingSection(null)}
        onSave={handleSaveOtorisasi}
        isSaving={isSaving}
        dosenList={dosenList}
        initialData={rpsData}
      />
      <CpmkModal
        isOpen={showCpmkModal}
        onClose={() => setShowCpmkModal(false)}
        onSave={handleSaveCpmk}
        isSaving={isSaving}
        availableIks={rpsData.available_iks}
        nextNo={0}
      />
      <PertemuanModal
        isOpen={showPertemuanModal}
        onClose={() => setShowPertemuanModal(false)}
        onSave={handleSavePertemuan}
        isSaving={isSaving}
        cpmkList={rpsData.cpmk}
        nextPekan={0}
        rubrikList={[]}
        isEdit={false}
      />
    </DashboardLayout>
  );
}
