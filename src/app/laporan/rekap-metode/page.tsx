import React from "react";
import Link from "next/link";
import ScrollToTop from "./components/ScrollToTop";

export const metadata = {
  title: "Rekap Metode Penilaian",
};

export default function RekapMetodePenilaianPage() {
  const semesters = [
    "GANJIL 2025/2026",
    "GENAP 2024/2025",
    "GANJIL 2024/2025",
    "GENAP 2023/2024",
    "GANJIL 2023/2024",
    "GENAP 2022/2023",
    "GANJIL 2022/2023",
    "GENAP 2021/2022",
    "GANJIL 2021/2022",
    "GENAP 2020/2021",
    "GANJIL 2020/2021",
    "GENAP 2019/2020",
    "GANJIL 2019/2020",
    "GANJIL 2018/2019",
    "GENAP 2017/2018",
    "GENAP 2015/2016",
    "GANJIL 2015/2016",
    "GENAP 2014/2015",
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-gray-700 font-semibold text-lg">Rekap Metode Penilaian</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h3 className="text-sm text-gray-500 mb-6">Pilih Semester</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {semesters.map((s) => {
              const slug = s.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-");
              return (
                <Link
                  key={s}
                  href={`/laporan/rekap-metode/${encodeURIComponent(slug)}`}
                  className="block w-full h-14 flex items-center justify-center rounded-md border border-gray-100 bg-white hover:shadow-md transition-shadow text-indigo-600 text-xs font-medium"
                >
                  {s}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
