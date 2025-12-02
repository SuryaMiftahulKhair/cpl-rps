import React from "react";
import MataKuliahCard from "../components/MataKuliahCard";
import ScrollToTop from "../components/ScrollToTop";

interface Props {
  params: { semester: string };
}

export const metadata = {
  title: "Rekap Kuisioner - Semester",
};

export default function SemesterPage({ params }: Props) {
  const { semester } = params;
  const display = semester.replace(/-/g, " ").toUpperCase().replace(/ (\d{4}) (\d{4})$/, " $1/$2");

  // Sample mata kuliah list (layout similar to screenshot)
  const matakuliahs = [
    { kode: "2310112103", nama: "Bioteknologi Produksi Ternak" },
    { kode: "2310112003", nama: "Manajemen Agribisnis dan Kelembagaan Peternakan" },
    { kode: "2310111102", nama: "Dasar Teknologi HT" },
    { kode: "2310110903", nama: "Ilmu Nutrisi Ternak" },
    { kode: "2310110803", nama: "Pemuliaan Ternak" },
    { kode: "2310110702", nama: "UU Peternakan dan Animal Welfare" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-700 font-semibold text-lg">Rekap Kuisioner</h2>
        <div className="text-sm text-gray-500">Semester: <span className="font-medium text-indigo-600">{display}</span></div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h3 className="text-sm text-gray-500 mb-4">Daftar Matakuliah</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matakuliahs.map((m) => (
            <MataKuliahCard key={m.kode} kode={m.kode} nama={m.nama} />
          ))}
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
