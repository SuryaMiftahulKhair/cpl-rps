"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useParams, useRouter } from "next/navigation";
import { Loader2, BookCopy, ChevronLeft, ChevronRight, FileText, Calendar, Award, Plus } from "lucide-react";
import Link from "next/link";
// import { useAuth } from "@/app/components/AuthContext"; // Dihapus (Mode No-Auth)

// --- Tipe Data (Dinamis dari API) ---
type MataKuliah = {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number | null;
  sifat: string | null;
};

type Komponen = {
  nama: string;
  bobot: number;
};

type RiwayatRpsItem = {
  id: number; // ID Kelas
  tahunAjaran: string;
  semester: string;
  komponen: Komponen[];
  _aktif: boolean; // Placeholder
};

type Kurikulum = {
  id: number;
  nama: string;
  tahun: number;
}

// Helper
async function parseApiError(res: Response) {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP Error ${res.status}`;
  } catch {
    return `HTTP Error ${res.status}`;
  }
}

// --- Komponen Riwayat RPS (dari file kakak, sudah bagus) ---
interface RPSHistoryItemProps {
  history: RiwayatRpsItem;
}
const RPSHistoryItem: React.FC<RPSHistoryItemProps> = ({ history }) => {
  // Cek jika ada komponen
  const isAvailable = history.komponen.length > 0;

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isAvailable
        ? 'border-green-200 bg-green-50/50 hover:border-green-300'
        : 'border-gray-200 bg-gray-50/50' // Tampilan jika tidak ada komponen
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Calendar size={18} className={isAvailable ? 'text-green-600' : 'text-gray-600'} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">
              Tahun Ajaran {history.tahunAjaran}
            </h4>
            <p className="text-xs text-gray-600">Semester {history.semester}</p>
          </div>
        </div>
        {history._aktif && ( // Ini _aktif dari data dummy API
          <span className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
            <Award size={12} />
            Aktif
          </span>
        )}
      </div>

      {/* Content */}
      {isAvailable ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Komponen Penilaian:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {history.komponen.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-green-100">
                <span className="text-sm text-gray-700 font-medium">
                  {item.nama}
                </span>
                <span className="text-sm font-bold text-green-700">
                  {item.bobot}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-green-100">
            {/* Link ke halaman detail kelas/RPS Dosen */}
            <Link href={`/rps/kelas/${history.id}`} className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline flex items-center gap-1">
              Lihat Detail RPS <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-600">
          <p className="text-sm font-medium">Belum ada komponen penilaian untuk RPS ini.</p>
        </div>
      )}
    </div>
  );
};


// --- Komponen Utama Halaman ---
export default function RpsListPage() {
  // const { user } = useAuth(); // Dihapus (Mode No-Auth)
  const router = useRouter();
  const params = useParams();
  
  // --- PERBAIKAN: Parsing ID yang aman (nama param 'id' sesuai folder) ---
  const kurikulumIdRaw = (params as any)?.id;
  const kurikulumId = Number(Array.isArray(kurikulumIdRaw) ? kurikulumIdRaw[0] : kurikulumIdRaw);
  // ------------------------------------

  const [kurikulum, setKurikulum] = useState<Kurikulum | null>(null);
  const [matkulList, setMatkulList] = useState<MataKuliah[]>([]);
  const [selectedMatkul, setSelectedMatkul] = useState<MataKuliah | null>(null);
  const [riwayatRps, setRiwayatRps] = useState<RiwayatRpsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  
  // Load daftar mata kuliah
  useEffect(() => {
    const loadMatkul = async () => {
      if (Number.isNaN(kurikulumId)) return; // Jangan fetch jika ID tidak valid

      setLoading(true);
      try {
        // 1. Ambil info kurikulum (untuk judul)
        const kurRes = await fetch(`/api/kurikulum/${kurikulumId}`);
        if (!kurRes.ok) throw new Error(await parseApiError(kurRes));
        setKurikulum(await kurRes.json());

        // 2. Ambil daftar mata kuliah
        const res = await fetch(`/api/kurikulum/${kurikulumId}/matakuliah`);
        if (!res.ok) throw new Error(await parseApiError(res));
        
        const data: MataKuliah[] = await res.json();
        setMatkulList(data);
        
        // Otomatis pilih mata kuliah pertama
        if (data.length > 0) {
          setSelectedMatkul(data[0]);
        }
        
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadMatkul();
  }, [kurikulumId]);

  // Fungsi untuk memuat riwayat RPS saat mata kuliah dipilih
  const loadRiwayat = async (matkul: MataKuliah) => {
    setLoadingRiwayat(true);
    setRiwayatRps([]);
    try {
      const res = await fetch(`/api/rps/riwayat/${matkul.id}`);
      if (!res.ok) throw new Error(await parseApiError(res));
      setRiwayatRps(await res.json());
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    if (selectedMatkul) {
      loadRiwayat(selectedMatkul);
    }
  }, [selectedMatkul]); 

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookCopy size={28} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                RPS Matakuliah
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Kelola Rencana Pembelajaran Semester
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            <p className="text-sm font-semibold">
              ADMIN (Mode Development)
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-linear-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Pilih Mata Kuliah
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
                  <FileText size={12} />
                  {kurikulum?.nama} ({kurikulum?.tahun})
                </span>
                <span className="text-xs text-gray-600">
                  ID: {kurikulum?.id}
                </span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/rps')} // <-- PERBAIKAN: Kembali ke /rps
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ChevronLeft size={18} />
              <span>Kembali</span>
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row">
            {/* LEFT: Mata Kuliah List */}
            <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                  Daftar Mata Kuliah ({matkulList.length})
                </p>
                <div className="space-y-2">
                  {matkulList.length === 0 ? (
                    <p className="text-sm text-gray-500 px-2">Tidak ada mata kuliah di kurikulum ini.</p>
                  ) : (
                    matkulList.map((mk, index) => {
                      const isSelected = selectedMatkul?.id === mk.id;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedMatkul(mk)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 border-2 ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                              : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className={`text-xs font-mono ${
                              isSelected ? 'text-indigo-700' : 'text-gray-500'
                            }`}>
                              {mk.kode_mk}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${
                              isSelected 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {mk.sks} SKS
                            </span>
                          </div>
                          <p className={`font-semibold text-sm leading-tight ${
                            isSelected ? 'text-indigo-700' : 'text-gray-800'
                          }`}>
                            {mk.nama}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Semester {mk.semester ?? '-'} • {mk.sifat ?? 'Pilihan'}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: RPS History */}
            <div className="flex-1 p-6">
              {!selectedMatkul ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">Pilih mata kuliah untuk melihat riwayat.</p>
                </div>
              ) : (
                <>
                  {/* Selected Course Header */}
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText size={20} className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-indigo-600">
                          {selectedMatkul.nama}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Kode: {selectedMatkul.kode_mk}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 text-xs font-semibold rounded">
                            {selectedMatkul.sks} SKS
                          </span>
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 text-xs font-semibold rounded">
                            Semester {selectedMatkul.semester ?? '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RPS History */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Riwayat RPS ({riwayatRps.length})
                    </h4>
                    {loadingRiwayat ? (
                      <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin" /></div>
                    ) : riwayatRps.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">Belum ada riwayat RPS.</p>
                    ) : (
                      // --- PERBAIKAN: Ganti 'selectedMatkul.rpsHistory' menjadi 'riwayatRps' ---
                      riwayatRps.map((history, index) => (
                        <RPSHistoryItem key={index} history={history} />
                      ))
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                      <Plus size={18} />
                      <span>Tambah Versi RPS Baru</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}