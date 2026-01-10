"use client";

import { Edit, ChevronLeft } from "lucide-react";

export default function VisiMisiTab() {
  return (
    <div className="p-6 lg:p-8">
      <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
        {/* VISI */}
        <div className="space-y-3 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-600 rounded" /> Visi
          </h3>
          <p className="text-gray-700 leading-relaxed pl-3">
            Pusat unggulan dalam pendidikan, penelitian dan penerapan teknologi informasi berbasis jaringan komputer dan sistem
            cerdas berlandaskan Benua Maritim Indonesia tahun 2025
          </p>
        </div>

        {/* MISI */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-600 rounded" />
            Misi
          </h3>
          <ol className="space-y-4 pl-3">
            {[
              "Menghasilkan lulusan yang memiliki sikap dan tata nilai yang baik, serta memiliki kompetensi di bidang teknologi informasi berbasis jaringan komputer dan sistem cerdas",
              "Menghasilkan karya-karya ilmiah dibidang teknologi informasi berbasis jaringan komputer dan sistem cerdas yang bermanfaat bagi masyarakat",
              "Menyebarluaskan teknologi berdaya guna bagi masyarakat melalui pengabdian kepada masyarakat",
              "Menjalin dan mempererat kerjasama dengan institusi terkait dalam dan luar negeri untuk meningkatkan kualitas pendidikan",
            ].map((t, i) => (
              <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}