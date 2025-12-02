import React from "react";
import Link from "next/link";
import ScrollToTop from "./components/ScrollToTop";

export const metadata = {
  title: "Rekap Kuisioner Pembelajaran",
};

export default function RekapKuisionerHome() {
  const semesters = [
    "GANJIL 2025/2026",
    "GENAP 2024/2025",
    "GANJIL 2024/2025",
    "GENAP 2023/2024",
    "GANJIL 2023/2024",
    "GENAP 2022/2023",
  ];

  return (
    <div className="p-6">
      <h2 className="text-gray-700 font-semibold text-lg mb-4">Rekap Kuisioner</h2>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h3 className="text-sm text-gray-500 mb-4">Pilih Semester</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesters.map((s) => {
            const slug = s.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-");
            return (
              <Link
                key={s}
                href={`/laporan/rekap-kuisioner-pembelajaran/${encodeURIComponent(slug)}`}
                className="block w-full h-14 flex items-center justify-center rounded-md border border-gray-100 bg-gray-50 hover:shadow-md transition-shadow text-indigo-600 text-xs font-medium"
              >
                {s}
              </Link>
            );
          })}
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
