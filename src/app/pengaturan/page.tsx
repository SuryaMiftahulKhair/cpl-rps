"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  HiOutlineCog6Tooth,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlinePencil,
  HiOutlineCamera,
  HiOutlineEnvelope,
  HiOutlineBriefcase,
  HiOutlineIdentification,
} from "react-icons/hi2";

export default function PengaturanPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="p-8 space-y-6">
          {/* ================= HEADER WITH GRADIENT - Following recommendation ================= */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <HiOutlineCog6Tooth className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Kelola profil dan preferensi akun Anda
                </p>
              </div>
            </div>
          </div>

          {/* ================= PROFIL CARD - Enhanced Design ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <HiOutlineUserCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Profil Pengguna</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-6">
                {/* Avatar with hover effect */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    A
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center">
                    <HiOutlineCamera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 mb-1">
                    Foto Profil
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    JPG atau PNG. Maksimal 2MB
                  </p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <HiOutlineCamera className="w-4 h-4" />
                    Ganti Foto
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= INFORMASI AKUN - Modern Layout ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiOutlineIdentification className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Informasi Akun</h3>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                  <HiOutlinePencil className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>

            {/* Content - Enhanced Info Cards */}
            <div className="p-6 space-y-4">
              <InfoCard
                icon={<HiOutlineUserCircle className="w-5 h-5 text-blue-600" />}
                label="Nama Pengguna"
                value="Prof. Dr. Andi"
                bgColor="from-blue-50 to-blue-100"
                borderColor="border-blue-200"
              />
              
              <InfoCard
                icon={<HiOutlineBriefcase className="w-5 h-5 text-amber-600" />}
                label="Role"
                value="Admin Program Studi"
                bgColor="from-amber-50 to-orange-100"
                borderColor="border-orange-200"
              />
              
              <InfoCard
                icon={<HiOutlineEnvelope className="w-5 h-5 text-indigo-600" />}
                label="Email"
                value="andi@unhas.ac.id"
                bgColor="from-indigo-50 to-indigo-100"
                borderColor="border-indigo-200"
              />
            </div>
          </div>

          {/* ================= KEAMANAN SECTION (Optional Enhancement) ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <HiOutlineShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Keamanan</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50 transition-colors px-3 -mx-3 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Password</p>
                  <p className="text-xs text-gray-500 mt-0.5">Terakhir diubah 30 hari yang lalu</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                  <HiOutlinePencil className="w-4 h-4" />
                  Ubah
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= ENHANCED COMPONENTS ================= */

function InfoCard({
  icon,
  label,
  value,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`flex items-center justify-between bg-gradient-to-r ${bgColor} px-4 py-3.5 rounded-lg border ${borderColor} group hover:shadow-md transition-all`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-0.5">{label}</p>
          <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}