"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TambahAkunModal from "../components/TambahAkunModal";

import {
  HiOutlineCog6Tooth,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineUserPlus,
} from "react-icons/hi2";

export default function PengaturanPage() {
  // simulasi role (nanti dari session/JWT)
  const role = "admin"; // "admin" | "dosen"

  const [openModal, setOpenModal] = useState(false);

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

          {/* ================= PROFIL UTAMA ================= */}
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">
                Prof. Dr. Andi
              </h2>
              <p className="text-sm text-gray-500">
                Admin Program Studi
              </p>

              <button className="mt-3 px-4 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100">
                Ganti Foto Profil
              </button>
            </div>
          </div>

          {/* ================= INFORMASI AKUN ================= */}
          <Section title="Informasi Akun" icon={<HiOutlineUserCircle />}>
            <Info label="Nama Pengguna" value="Prof. Dr. Andi" />
            <Info label="Role" value="Admin Program Studi" />
            <Info label="Email" value="andi@unhas.ac.id" />
          </Section>

          {/* ================= KEAMANAN ================= */}
          <Section title="Keamanan Akun" icon={<HiOutlineShieldCheck />}>
            <div className="flex gap-3 flex-wrap">
              <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm">
                Ganti Password
              </button>

              <button className="px-4 py-2 rounded-lg text-sm bg-red-50 text-red-700 border border-red-300 hover:bg-red-100">
                Keluar Akun
              </button>
            </div>
          </Section>

          {/* ================= ADMIN ONLY ================= */}
          {role === "admin" && (
            <Section title="Manajemen Akun" icon={<HiOutlineUserPlus />}>
              <p className="text-sm text-gray-600 mb-4">
                Fitur ini hanya dapat diakses oleh Admin Program Studi.
              </p>

              <button
                onClick={() => setOpenModal(true)}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
              >
                + Tambah Akun Baru
              </button>
            </Section>
          )}
        </main>
      </div>

      {/* ===== MODAL ===== */}
      <TambahAkunModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}

/* ================= REUSABLE COMPONENT ================= */

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
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
