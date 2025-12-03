import React from "react";
import { notFound } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Props {
  params: { semester: string };
}

export const metadata = {
  title: "Rekap Metode Penilaian - Detail",
};

export default function SemesterDetail({ params }: Props) {
  const raw = params.semester;
  if (!raw) return notFound();

  // Convert slug back to display format (simple): GANJIL-2025-2026 -> GANJIL 2025/2026
  const display = raw.replace(/-/g, " ").toUpperCase().replace(/ (\d{4}) (\d{4})$/, " $1/$2");

  return (
    <DashboardLayout>
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Rekap Metode Penilaian</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm text-gray-500 mb-2">Semester</h3>
        <p className="text-indigo-600 font-medium">{display}</p>

        <div className="mt-6 text-sm text-gray-600">
          Halaman detail rekap metode penilaian untuk semester <strong>{display}</strong>.
          Anda dapat menambahkan tabel atau grafik di sini.
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
