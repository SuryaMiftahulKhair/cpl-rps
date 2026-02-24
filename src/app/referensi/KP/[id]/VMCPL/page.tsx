//src/app/referensi/KP/[id]/VMCPL/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  Target,
  Eye,
  TrendingUp,
  Award,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// Import Komponen
import VisiMisiTab from "@/app/components/VisiMisiTab";
import CplIkTab from "@/app/components/CplIkTab";

export default function VisiMisiCPLPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const prodiId = searchParams.get("prodiId");
  const kurikulumId = Number((params as any)?.id);

  const [activeTab, setActiveTab] = useState<"visi_misi" | "cpl_ik">("cpl_ik");

  // Tab configuration for better maintainability
  const tabs = [
    {
      id: "visi_misi" as const,
      label: "Visi, Misi, Profil",
      icon: Eye,
      description: "Visi dan misi kurikulum",
    },
    {
      id: "cpl_ik" as const,
      label: "CPL & Indikator Kinerja",
      icon: Target,
      description: "Capaian pembelajaran lulusan",
    },
  ];

  return (
    <DashboardLayout>
      {/* ========== BREADCRUMB ========== */}
      <div className="px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link
            href="/referensi/KP"
            className="hover:text-indigo-600 transition-colors">
            Referensi
          </Link>
          <ChevronLeft size={16} className="rotate-180 text-gray-400" />
          <Link
            href={`/referensi/KP?prodiId=${prodiId}`}
            className="hover:text-indigo-600 transition-colors">
            Kurikulum Prodi
          </Link>
          <ChevronLeft size={16} className="rotate-180 text-gray-400" />
          <span className="font-semibold text-gray-900">Detail Kurikulum</span>
        </div>
      </div>

      {/* ========== HEADER - Enhanced with Gradient ========== */}
      <div className="px-6 lg:px-8 pb-6">
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <BookOpen size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Detail Kurikulum
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {/* Prodi Info */}
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-indigo-200">
                    <span className="text-gray-600">Prodi:</span>
                    <span className="font-bold text-indigo-700">
                      S1 Teknik Informatika
                    </span>
                  </div>

                  {/* Kurikulum ID */}
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-200">
                    <span className="text-gray-600">Kurikulum ID:</span>
                    <span className="font-bold text-blue-700">
                      {kurikulumId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Back Button */}
            <Link
              href={`/referensi/KP?prodiId=${prodiId}`}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold group">
              <ChevronLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Kembali</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========== TAB NAVIGATION - Modern Design ========== */}
      <div className="px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 group relative py-4 px-6 transition-all duration-200
                    ${
                      isActive
                        ? "text-indigo-700 bg-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }
                  `}>
                  {/* Content */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={20}
                        className={`
                          transition-all duration-200
                          ${
                            isActive
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover:text-indigo-500"
                          }
                        `}
                      />
                      <span className="font-semibold text-sm lg:text-base">
                        {tab.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 hidden lg:block">
                      {tab.description}
                    </span>
                  </div>

                  {/* Active Indicator */}
                  <div
                    className={`
                      absolute bottom-0 left-0 right-0 h-1 
                      bg-gradient-to-r from-indigo-500 to-blue-500 
                      transition-all duration-300 rounded-t-full
                      ${isActive ? "opacity-100" : "opacity-0"}
                    `}
                  />

                  {/* Hover Indicator */}
                  <div
                    className={`
                      absolute bottom-0 left-0 right-0 h-1 
                      bg-gray-300 
                      transition-all duration-300
                      ${!isActive && "opacity-0 group-hover:opacity-50"}
                    `}
                  />
                </button>
              );
            })}
          </div>

          {/* ========== TAB CONTENT ========== */}
          <div className="min-h-[500px]">
            {activeTab === "visi_misi" && (
              <div className="animate-fadeIn">
                <VisiMisiTab prodiId={prodiId} kurikulumId={kurikulumId} />
              </div>
            )}

            {activeTab === "cpl_ik" && (
              <div className="animate-fadeIn">
                <CplIkTab prodiId={prodiId} kurikulumId={kurikulumId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
