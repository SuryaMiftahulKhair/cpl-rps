"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TambahUserModal from "../components/TambahUserModal";

import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";

const users = [
  {
    id: 1,
    name: "Prof. Dr. Andi",
    email: "andi@unhas.ac.id",
    role: "Admin",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Dr. Budi Santoso",
    email: "budi@unhas.ac.id",
    role: "Dosen",
    status: "Aktif",
  },
];

export default function ManajemenUserPage() {
  const role = "admin";
  const [openModal, setOpenModal] = useState(false);

  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 font-semibold">
        Akses ditolak.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="p-8 space-y-6">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <HiOutlineUsers className="w-7 h-7 text-indigo-600" />
              Manajemen Pengguna
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              <HiOutlinePlus className="w-5 h-5" />
              Tambah Akun
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-gray-900">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{index + 1}</td>

                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {user.name}
                    </td>

                    <td className="px-4 py-3 text-gray-900">
                      {user.email}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            user.role === "Admin"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-gray-200 text-gray-900"
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            user.status === "Aktif"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button className="text-indigo-600 hover:text-indigo-800">
                          <HiOutlinePencilSquare className="w-5 h-5" />
                        </button>

                        <button className="text-red-600 hover:text-red-800">
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      <TambahUserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
