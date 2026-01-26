"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TambahUserModal from "../components/TambahUserModal";

import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Loader2 } from "lucide-react";

export default function ManajemenUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [role, setRole] = useState("admin"); // Idealnya ambil dari session

  // 1. Fungsi untuk mengambil daftar user dari Database
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/list"); // Buat API list user
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Jalankan fetch saat pertama kali buka halaman
  useEffect(() => {
    fetchUsers();
  }, []);

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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-all shadow-md"
            >
              <HiOutlinePlus className="w-5 h-5" />
              Tambah Akun
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 className="animate-spin" size={40} />
                <p>Memuat data pengguna...</p>
              </div>
            ) : (
              <table className="w-full text-sm text-gray-900">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-600">No</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-600">Nama</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-600">Username</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-600">Role</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-600">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400">Belum ada data pengguna.</td>
                    </tr>
                  ) : (
                    users.map((user: any, index) => (
                      <tr key={user.id} className="hover:bg-indigo-50/30 transition-all">
                        <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{user.nama}</td>
                        <td className="px-6 py-4 text-gray-600">{user.username}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            user.role === "ADMIN" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button title="Edit" className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all">
                              <HiOutlinePencilSquare className="w-5 h-5" />
                            </button>
                            <button 
                              title="Hapus" 
                              className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                              onClick={() => confirm("Hapus akun ini?")}
                            >
                              <HiOutlineTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      <TambahUserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchUsers} // Panggil fetchUsers lagi kalau sukses simpan
      />
    </div>
  );
}