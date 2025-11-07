"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";

// Tipe data untuk dropdown
type AssasmentArea = { id: number; nama: string; };
type Cpl = { id: number; kode_cpl: string; deskripsi: string; };

// Tipe data untuk form
type IndicatorForm = {
  deskripsi: string;
  cplId: string; // string untuk form, akan di-convert ke number saat submit
};

export interface TambahPIRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void; // Untuk refresh data di halaman
  kurikulumId: number;
}

// Fungsi helper
async function parseApiError(res: Response) {
  try {
    const j = await res.json().catch(() => null);
    return j?.error ?? j?.detail ?? `HTTP Error ${res.status}`;
  } catch {
    return `HTTP Error ${res.status}`;
  }
}

export default function TambahPIRowModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  kurikulumId,
}: TambahPIRowModalProps) {
  
  // Data untuk dropdown
  const [areaList, setAreaList] = useState<AssasmentArea[]>([]);
  const [cplList, setCplList] = useState<Cpl[]>([]);

  // State Form
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [kodeGrup, setKodeGrup] = useState<string>("");
  const [indicators, setIndicators] = useState<IndicatorForm[]>([
    { deskripsi: "", cplId: "" } // Mulai dengan satu indikator kosong
  ]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil data untuk dropdown saat modal dibuka
  useEffect(() => {
    if (isOpen && kurikulumId) {
      const loadDropdownData = async () => {
        setLoading(true);
        setError(null);
        try {
          // 1. Fetch Assasment Area
          const areaRes = await fetch(`/api/kurikulum/${kurikulumId}/assasment-area`);
          if (!areaRes.ok) throw new Error(await parseApiError(areaRes));
          const areas: AssasmentArea[] = await areaRes.json();
          setAreaList(areas);

          // 2. Fetch CPL
          const cplRes = await fetch(`/api/kurikulum/${kurikulumId}/cpl`);
          if (!cplRes.ok) throw new Error(await parseApiError(cplRes));
          const cpls: Cpl[] = await cplRes.json();
          setCplList(cpls);
          
          // Set default selection jika ada data
          if (areas.length > 0) setSelectedAreaId(String(areas[0].id));
          
        } catch (err: any) {
          setError(err.message || "Gagal memuat data CPL/Area.");
        } finally {
          setLoading(false);
        }
      };
      
      void loadDropdownData();
      
      // Reset form
      setKodeGrup("");
      setSelectedAreaId("");
      setIndicators([{ deskripsi: "", cplId: "" }]);

    }
  }, [isOpen, kurikulumId]);
  
  // Fungsi untuk mengelola form indikator dinamis
  const handleIndicatorChange = (index: number, field: 'deskripsi' | 'cplId', value: string) => {
    const newIndicators = [...indicators];
    newIndicators[index][field] = value;
    setIndicators(newIndicators);
  };

  const addIndicator = () => {
    setIndicators([...indicators, { deskripsi: "", cplId: "" }]);
  };

  const removeIndicator = (index: number) => {
    if (indicators.length <= 1) return; // Sisakan minimal satu
    const newIndicators = indicators.filter((_, i) => i !== index);
    setIndicators(newIndicators);
  };
  
  // Fungsi Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validasi
    if (!selectedAreaId || !kodeGrup || indicators.some(i => !i.deskripsi || !i.cplId)) {
      setError("Semua field wajib diisi, termasuk semua indikator dan CPL-nya.");
      setSubmitting(false);
      return;
    }
    
    // Siapkan body untuk API
    const body = {
      assesmentId: Number(selectedAreaId),
      kodeGrup: kodeGrup,
      indicators: indicators.map(ind => ({
        deskripsi: ind.deskripsi,
        cplId: Number(ind.cplId),
      })),
    };

    try {
      // Panggil API baru untuk membuat PI Group + Indicator
      const res = await fetch(`/api/kurikulum/${kurikulumId}/pi-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res));
      }

      // Sukses
      onSubmitSuccess(); // Refresh tabel di halaman
      onClose(); // Tutup modal

    } catch (err: any) {
      console.error("Gagal tambah PI Group:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Tambah Data PI
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center p-8">Memuat data dropdown...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assesmentArea" className="block text-sm font-medium text-gray-700">
                    Area (Assasment Area)
                  </label>
                  <select
                    id="assesmentArea"
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="" disabled>Pilih Area</option>
                    {areaList.map(area => (
                      <option key={area.id} value={area.id}>{area.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="kodeGrup" className="block text-sm font-medium text-gray-700">
                    Kode PI (PI Code / PI Group)
                  </label>
                  <input
                    type="text"
                    id="kodeGrup"
                    value={kodeGrup}
                    onChange={(e) => setKodeGrup(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="cth: PI-01"
                    required
                  />
                </div>
              </div>

              <hr className="my-4"/>
              
              <h3 className="text-lg font-medium text-gray-800">Performance Indicators</h3>
              <div className="space-y-4">
                {indicators.map((ind, index) => (
                  <div key={index} className="p-4 border rounded-md bg-gray-50/50 relative">
                    {indicators.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeIndicator(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                        title="Hapus Indikator"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600">
                          Deskripsi Indikator {index + 1}
                        </label>
                        <input
                          type="text"
                          value={ind.deskripsi}
                          onChange={(e) => handleIndicatorChange(index, 'deskripsi', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                          placeholder="cth: Mampu menjelaskan konsep dasar..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">
                          Dipetakan ke CPL (ILO)
                        </label>
                        <select
                          value={ind.cplId}
                          onChange={(e) => handleIndicatorChange(index, 'cplId', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                          required
                        >
                          <option value="" disabled>Pilih CPL</option>
                          {cplList.map(cpl => (
                            <option key={cpl.id} value={cpl.id}>{cpl.kode_cpl} - {cpl.deskripsi.substring(0, 50)}...</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addIndicator}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <Plus size={16} />
                  Tambah Indikator
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 text-sm bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={submitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}