"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  HiOutlineCog6Tooth,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

export default function PengaturanPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="p-8 space-y-8">

          {/* ================= TITLE ================= */}
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 border-b pb-3">
            <HiOutlineCog6Tooth className="w-6 h-6 text-indigo-600" />
            Pengaturan
          </div>

          {/* ================= PROFIL PALING ATAS ================= */}
          <Section
            title="Profil Pengguna"
            icon={<HiOutlineUserCircle />}
          >
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                A
              </div>

              <div>
                <p className="text-base font-medium text-gray-800">
                  Foto Profil
                </p>
                <button className="mt-2 px-4 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100">
                  Ganti Foto
                </button>
              </div>
            </div>
          </Section>

          {/* ================= INFORMASI AKUN ================= */}
          <Section
            title="Informasi Akun"
            icon={<HiOutlineUserCircle />}
          >
            <Info label="Nama Pengguna" value="Prof. Dr. Andi" />
            <Info label="Role" value="Admin Program Studi" />
            <Info label="Email" value="andi@unhas.ac.id" />
          </Section>

        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <span className="text-indigo-600 text-xl">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b last:border-b-0 py-2">
      {/* DIUBAH JADI HITAM */}
      <span className="text-gray-800 font-medium">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
