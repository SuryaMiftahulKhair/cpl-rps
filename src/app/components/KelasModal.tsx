"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, Save, Loader2 } from "lucide-react";

/* ================== TIPE DATA ================== */

interface RPS {
  id: number;
  tanggal_penyusunan: string;
}

interface MataKuliah {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number;
  rps: RPS[];
}

interface FormValues {
  matakuliah_id: string;
  rps_id: string;
  nama_kelas: string;
  sks: number | ""; 
}

interface KelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (data: {
    kode_mk: string;
    nama_mk: string;
    nama_kelas: string;
    sks: number;
    matakuliah_id: number;
    rps_id: number;
  }) => void;
}

/* ================== COMPONENT ================== */

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
      rps_id: "",
      nama_kelas: "",
      sks: "", 
    },
  });

  const selectedMkId = watch("matakuliah_id");

  /* ================== FETCH MK ================== */
  useEffect(() => {
    if (!isOpen) return;

    setLoadingMk(true);
    fetch("/api/matakuliah")
      .then((res) => res.json())
      .then((json) => setMkList(json.data || []))
      .catch((err) => console.error("Gagal mengambil data mata kuliah", err))
      .finally(() => setLoadingMk(false));
  }, [isOpen]);

  /* ================== AUTO SKS ================== */
  useEffect(() => {
    if (selectedMkId) {
      // Cari data mata kuliah yang dipilih
      const mk = mkList.find((m) => String(m.id) === selectedMkId);
      if (mk) {
        setValue("sks", mk.sks);
        setValue("rps_id", "");
      }
    } else {
      setValue("sks", "");
      setValue("rps_id", "");
    }
  }, [selectedMkId, mkList, setValue]);

  /* ================== SUBMIT ================== */
  const submitHandler = (data: FormValues) => {
    const mk = mkList.find((m) => String(m.id) === data.matakuliah_id);
    if (!mk) return;

    onSubmit({
      kode_mk: mk.kode_mk,
      nama_mk: mk.nama,
      nama_kelas: data.nama_kelas,
      sks: Number(data.sks),
      matakuliah_id: mk.id,
      rps_id: Number(data.rps_id),
    });

    reset();
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const selectedMk = mkList.find(
    (mk) => String(mk.id) === selectedMkId
  );

  const inputStyle =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-2xl">
          <h3 className="font-semibold text-lg text-gray-900">
            Tambah Kelas
          </h3>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="p-6 space-y-4"
        >
          {/* MATA KULIAH */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Mata Kuliah <span className="text-red-500">*</span>
            </label>

            <select
              {...register("matakuliah_id", {
                required: "Mata kuliah wajib dipilih",
              })}
              disabled={loadingMk || submitting}
              className={`${inputStyle} disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">
                {loadingMk ? "Memuat..." : "-- Pilih Mata Kuliah --"}
              </option>
              {mkList.map((mk) => (
                <option key={mk.id} value={mk.id}>
                  {mk.kode_mk} — {mk.nama}
                </option>
              ))}
            </select>

            {errors.matakuliah_id && (
              <p className="text-xs text-red-500 mt-1">
                {errors.matakuliah_id.message}
              </p>
            )}
          </div>

          {/* RPS */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Versi RPS <span className="text-red-500">*</span>
            </label>

            <select
              {...register("rps_id", {
                required: "RPS wajib dipilih",
              })}
              disabled={!selectedMk || submitting}
              className={`${inputStyle} disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">-- Pilih RPS --</option>

              {selectedMk?.rps?.map((rps) => (
                <option key={rps.id} value={rps.id}>
                  RPS {new Date(rps.tanggal_penyusunan).toLocaleDateString("id-ID")}
                </option>
              ))}
            </select>

            {errors.rps_id && (
              <p className="text-xs text-red-500 mt-1">
                {errors.rps_id.message}
              </p>
            )}
          </div>

          {/* KELAS + SKS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Nama Kelas <span className="text-red-500">*</span>
              </label>

              <input
                {...register("nama_kelas", {
                  required: "Nama kelas wajib diisi",
                })}
                disabled={submitting}
                placeholder="Contoh: A / B / C"
                className={`${inputStyle} uppercase disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />

              {errors.nama_kelas && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.nama_kelas.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                SKS
              </label>

              <div className="relative">
                <input
                  type="number"
                  {...register("sks")}
                  readOnly
                  placeholder="Auto"
                  className={`${inputStyle} bg-gray-100 font-bold text-gray-600 cursor-not-allowed`}
                />
                {watch("sks") !== "" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Auto
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Kelas
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}