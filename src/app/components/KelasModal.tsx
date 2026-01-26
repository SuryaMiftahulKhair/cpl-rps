"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, Save, Loader2 } from "lucide-react";


// Tipe data RPS
interface RPS {
  id: number;
  tanggal_penyusunan: string;
  
}

// Tipe data Mata Kuliah (termasuk list RPS)

interface MataKuliah {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number;
  rps: RPS[]; // Array RPS
}

interface FormValues {
  matakuliah_id: string;
  nama_kelas: string;
  sks: number;
}

interface KelasModalProps {
  isOpen: boolean;
  onClose: () => void;

  onSubmit: (data: {
    kode_mk: string;
    nama_mk: string;
    nama_kelas: string;
    sks: number;
    matakuliah_id: number;
  }) => void;
  submitting: boolean;
}

export default function KelasModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: KelasModalProps) {
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [loadingMk, setLoadingMk] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      matakuliah_id: "",
      nama_kelas: "",
      sks: 3,
    },
  });

  const selectedMkId = watch("matakuliah_id");

  // ======================
  // Fetch Mata Kuliah
  // ======================
  useEffect(() => {
    if (!isOpen) return;

    setLoadingMk(true);
    fetch("/api/matakuliah")
      .then((res) => res.json())
      .then((json) => setMkList(json.data || []))
      .finally(() => setLoadingMk(false));
  }, [isOpen]);

  // ======================
  // Auto-fill SKS
  // ======================
  useEffect(() => {
    const mk = mkList.find((m) => String(m.id) === selectedMkId);
    if (mk) {
      setValue("sks", mk.sks);

  // Update tipe onSubmit untuk menerima rps_id
  onSubmit: (data: { kode_mk: string; nama_mk: string; nama_kelas: string; sks: number; matakuliah_id: number; rps_id: number | null }) => void;
  submitting: boolean;
}

export default function KelasModal({ isOpen, onClose, onSubmit, submitting }: KelasModalProps) {
  // State Form
  const [selectedMkId, setSelectedMkId] = useState<string>(""); 
  const [selectedRpsId, setSelectedRpsId] = useState<string>(""); // State baru untuk RPS
  const [namaKelas, setNamaKelas] = useState("");
  const [sks, setSks] = useState(3);

  // State Data Master
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [availableRps, setAvailableRps] = useState<RPS[]>([]); // List RPS filteran
  const [isLoadingMk, setIsLoadingMk] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    if (isOpen) {
      setIsLoadingMk(true);
      fetch("/api/matakuliah")
        .then((res) => res.json())
        .then((json) => {
          setMkList(json.data || []);
        })
        .catch((err) => console.error("Gagal ambil MK:", err))
        .finally(() => setIsLoadingMk(false));
    } else {
      // Reset form
      setSelectedMkId("");
      setSelectedRpsId("");
      setNamaKelas("");
      setSks(3);
      setAvailableRps([]);
    }
  }, [isOpen]);

  // 2. Handle Ganti Mata Kuliah
  const handleMkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMkId(id);
    setSelectedRpsId(""); 

    const selectedMk = mkList.find((mk) => String(mk.id) === id);
    
    if (selectedMk) {
      setSks(selectedMk.sks);
      setAvailableRps(selectedMk.rps || []);
    } else {
      setAvailableRps([]);
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
    }
  }, [selectedMkId, mkList, setValue]);

<<<<<<< HEAD
  // ======================
  // Submit
  // ======================
  const submitHandler = (data: FormValues) => {
    const mk = mkList.find((m) => String(m.id) === data.matakuliah_id);
    if (!mk) return;

    onSubmit({
      kode_mk: mk.kode_mk,
      nama_mk: mk.nama,
      nama_kelas: data.nama_kelas,
      sks: Number(data.sks),
      matakuliah_id: mk.id,
=======
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMk = mkList.find((mk) => String(mk.id) === selectedMkId);
    
    if (!selectedMk) return alert("Pilih Mata Kuliah!");
    if (!selectedRpsId) return alert("Pilih RPS yang akan digunakan!");

    onSubmit({ 
      kode_mk: selectedMk.kode_mk, 
      nama_mk: selectedMk.nama, 
      nama_kelas: namaKelas, 
      sks: Number(sks),
      matakuliah_id: selectedMk.id,
      rps_id: Number(selectedRpsId) // Kirim ID RPS
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
    });

    reset();
  };

  if (!isOpen) return null;

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-lg text-gray-800">
            Tambah Kelas
          </h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(submitHandler)} className="p-6 space-y-4">

          {/* Mata Kuliah */}
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Tambah Kelas Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* 1. Pilih Mata Kuliah */}
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mata Kuliah <span className="text-red-500">*</span>
            </label>
<<<<<<< HEAD

            <select
              {...register("matakuliah_id", { required: true })}
              disabled={loadingMk}
              className="w-full mt-1 px-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-indigo-500 outline-none
                text-gray-900 bg-white"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {mkList.map((mk) => (
                <option key={mk.id} value={mk.id}>
                  {mk.kode_mk} - {mk.nama} (Smt {mk.semester})
                </option>
              ))}
            </select>

            {errors.matakuliah_id && (
              <p className="text-xs text-red-500 mt-1">
                Mata kuliah wajib dipilih
              </p>
            )}
          </div>

          {/* Nama Kelas & SKS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nama Kelas
              </label>
              <input
                {...register("nama_kelas", { required: true })}
                placeholder="A / B / C"
                className="w-full mt-1 px-3 py-2 border rounded-lg
                  focus:ring-2 focus:ring-indigo-500 outline-none
                  text-gray-900 uppercase"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                SKS
              </label>
              <input
                type="number"
                min={0}
                max={6}
                {...register("sks", { required: true })}
                className="w-full mt-1 px-3 py-2 border rounded-lg
                  focus:ring-2 focus:ring-indigo-500 outline-none
                  text-gray-900 bg-gray-50"
=======
            <div className="relative">
              <select 
                required
                value={selectedMkId} 
                onChange={handleMkChange}
                disabled={isLoadingMk}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Matakuliah --</option>
                {mkList.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    {mk.kode_mk} - {mk.nama}
                  </option>
                ))}
              </select>
              {isLoadingMk && <div className="absolute right-8 top-2.5"><Loader2 size={16} className="animate-spin text-gray-400" /></div>}
            </div>
          </div>

          {/* 2. Pilih RPS (Muncul setelah MK dipilih) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Versi RPS <span className="text-red-500">*</span>
            </label>
            <select 
              required
              value={selectedRpsId} 
              onChange={(e) => setSelectedRpsId(e.target.value)}
              disabled={!selectedMkId || availableRps.length === 0}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-100 text-gray-500"
            >
              <option value="">-- Pilih RPS --</option>
              {availableRps.map((rps) => (
                <option key={rps.id} value={rps.id}>
                  {/* Format Tanggal Sederhana */}
                  RPS Tgl {new Date(rps.tanggal_penyusunan).toLocaleDateString("id-ID")} 
                </option>
              ))}
            </select>
            {selectedMkId && availableRps.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">Mata kuliah ini belum memiliki RPS.</p>
            )}
          </div>

          {/* 3. Detail Kelas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas <span className="text-red-500">*</span></label>
              <input 
                type="text" required
                value={namaKelas} onChange={e => setNamaKelas(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-500"
                placeholder="A, B, C..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKS</label>
              <input 
                type="number" min="0" required
                value={sks} onChange={e => setSks(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-gray-500"
                readOnly
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
              />
            </div>
          </div>

<<<<<<< HEAD
          {/* Footer */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg
                flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
=======
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
            <button 
              type="submit" 
              disabled={submitting || !selectedRpsId}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
>>>>>>> ba63e4bfb8e8224f5ee18748e0db973b2c7eb4c0
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
