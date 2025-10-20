"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineExclamationTriangle,
  HiOutlineClipboard,
  HiOutlineUsers,
  HiOutlineCheckCircle,
} from "react-icons/hi2"; // fixed import

import { IconType } from "react-icons"; // for icon typing

// --- Type untuk props di StatCard ---
interface StatCardProps {
  title: string;
  value: string;
  icon: IconType;
  colorClass: string;
}

// --- Reusable Dashboard Card Component ---
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl hover:scale-[1.01]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  </div>
);

// --- Type untuk Recent Activity ---
interface Activity {
  id: number;
  text: string;
  time: string;
  status: "success" | "warning" | "info";
}

// --- Main HomePage Component ---
export default function HomePage() {
  const stats: StatCardProps[] = [
    { title: "Mata Kuliah Aktif", value: "18", icon: HiOutlineClipboard, colorClass: "text-indigo-600" },
    { title: "Dosen Pengampu", value: "35", icon: HiOutlineUsers, colorClass: "text-green-600" },
    { title: "CPL Terukur", value: "8/8", icon: HiOutlineCheckCircle, colorClass: "text-sky-600" },
  ];

  const recentActivities: Activity[] = [
    { id: 1, text: "Data Nilai **ETS Metode Penelitian** berhasil diinput dosen.", time: "1 jam lalu", status: "success" },
    { id: 2, text: "Kurikulum Prodi **K-23** telah disinkronkan dari Neosia.", time: "3 jam lalu", status: "info" },
    { id: 3, text: "Permintaan input nilai untuk **Data Kelas** semester baru dikirim.", time: "1 hari lalu", status: "warning" },
    { id: 4, text: "Data Nilai **UAS Struktur Beton** berhasil diverifikasi.", time: "2 hari lalu", status: "success" },
  ];

  const statusColors: Record<"success" | "warning" | "info", string> = {
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    info: "bg-indigo-100 text-indigo-800 border-indigo-300",
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="p-8">
          <div className="flex items-center text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
            <HiOutlineHome className="w-6 h-6 mr-2 text-indigo-600" />
            <h2>Dashboard Utama</h2>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white shadow-xl rounded-xl p-8 transition duration-300 hover:shadow-2xl">
                <div className="flex items-center mb-3 border-b pb-3 border-gray-100">
                  <HiOutlineAcademicCap className="w-8 h-8 mr-3 text-indigo-500" />
                  <h3 className="text-2xl font-extrabold text-gray-800">APP-CPL</h3>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  Selamat datang pada Aplikasi Pengukuran <strong>CPL (Capaian Pembelajaran Lulusan) Program Studi</strong> Universitas Hasanuddin berbasis Kurikulum K-23.
                </p>

                <div className="flex items-start bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg">
                  <HiOutlineExclamationTriangle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Peringatan Penting!</h4>
                    <p className="text-sm">
                      Pastikan <strong>Semester</strong> pada Data Kelas telah disinkronkan sebelum melakukan permintaan kepada dosen untuk menginput nilai.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-xl rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Aktivitas Terbaru 🚀</h3>
                <ul className="space-y-4">
                  {recentActivities.map((activity) => (
                    <li key={activity.id} className="text-sm border-l-4 border-indigo-200 pl-3 py-1">
                      <div className={`text-xs font-semibold px-2 py-0.5 rounded inline-block mb-1 border ${statusColors[activity.status]}`}>
                        {activity.status === "success"
                          ? "Input Nilai"
                          : activity.status === "info"
                          ? "Sinkronisasi"
                          : "Notifikasi"}
                      </div>
                      <p
                        className="text-gray-700 leading-snug"
                        dangerouslySetInnerHTML={{
                          __html: activity.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-4 text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition">
                  Lihat Semua Aktivitas →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
