"use client";

import { use, useEffect, useState } from "react";
import MataKuliahCard from "../components/MataKuliahCard";
import ScrollToTop from "../components/ScrollToTop";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Props {
  id: number;
  tahun: string;
  semester: "GANJIL" | "GENAP";
}

interface Matakuliah {
  id: number;
  kodeMatakuliah: string;
  namaMatakuliah: string;
}
async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (parsed?.error) return typeof parsed.error === "string" ? parsed.error : JSON.stringify(parsed.error);
  } catch {}
  return text || `HTTP ${res.status}`;
}

export default function SemesterPage({ 
  params, 
}:{
  params: Promise <Props>;
} ) {
  const resolvedParams = use(params);
  const { semester, tahun } = resolvedParams;
  const display = semester === "GANJIL" ? `Ganjil ${tahun}` : `Genap ${tahun}`;

  const [matakuliahList, setMatakuliahList] = useState<Matakuliah[]>([]);
  const [, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/kelas?semesterId=${semester}`);
      if (!res.ok) throw new Error(await parseApiError(res));
      const data = await res.json();
      setMatakuliahList(data);
    } catch (err: any) {
      setError(`Gagal mengambil data kelas: ${err.message || "Error tidak diketahui"}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (semester) fetchData();
  }, [semester]);

  const Matakuliah = matakuliahList.map((m) => ({
    id: m.id,
    kode: m.kodeMatakuliah,
    nama: m.namaMatakuliah,
  }));

  return (
    <DashboardLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-700 font-semibold text-lg">Rekap Kuisioner</h2>
        <div className="text-sm text-gray-500">Tahun Ajaran: <span className="font-medium text-indigo-600">{display}</span></div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h3 className="text-sm text-gray-500 mb-4">Daftar Matakuliah</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Matakuliah.map((m) => (
            <MataKuliahCard key={m.kode} kode={m.kode} nama={m.nama} />
          ))}
        </div>
      </div>

      <ScrollToTop />
    </div>
    </DashboardLayout>
  );
}

