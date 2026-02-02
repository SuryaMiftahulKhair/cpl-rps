"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TambahUserModal from "../components/TambahUserModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import Link from "next/link";

import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { Loader2, AlertCircle, Shield, Crown, Search } from "lucide-react";

export default function ManajemenUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openResetModal, setOpenResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; nama: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/list");
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

  // Reset Password Handler
  const handleResetPassword = (userId: number, nama: string) => {
    setSelectedUser({ id: userId, nama });
    setOpenResetModal(true);
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        
        console.log("Session User:", session);

        if (session.success && session.data.role === "ADMIN") {
          setCurrentUser(session.data);
          fetchUsers();
        } else {
          setCurrentUser("REJECTED");
        }
      } catch (error) {
        console.error("Auth error:", error);
        setCurrentUser("REJECTED");
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter((user: any) =>
    user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count by role
  const adminCount = users.filter((u: any) => u.role === "ADMIN").length;
  const dosenCount = users.filter((u: any) => u.role === "DOSEN").length;

  if (currentUser === "REJECTED") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-red-600" strokeWidth={2} />
          </div>
          <h1 className="text-6xl font-black text-red-600 mb-4">403</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 font-medium mb-6">
            Halaman ini hanya dapat diakses oleh Administrator
          </p>
          <Link 
            href="/home" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-md"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="p-8 space-y-6">
          
          {/* ================= HEADER WITH GRADIENT ================= */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <HiOutlineUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Manajemen Pengguna
                  </h1>
                  <p className="text-sm text-gray-600">
                    Kelola akun pengguna dan hak akses sistem
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setOpenModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <HiOutlinePlus className="w-5 h-5" strokeWidth={2.5} />
                Tambah Akun
              </button>
            </div>
          </div>

          {/* ================= STATS CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <HiOutlineUsers className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Total Pengguna
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Count */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <Crown className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Administrator
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {adminCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Dosen Count */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <HiOutlineUserCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Dosen
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dosenCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= TABLE SECTION ================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-indigo-600" />
                  Daftar Pengguna
                </h2>
                
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                  type="text"
                  placeholder="Cari nama atau NIP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm text-gray-900 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={2.5} />
                <p className="text-sm font-semibold text-gray-600">Memuat data pengguna...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 w-20">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        Nama Lengkap
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        NIP / Username
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        Role
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              {searchQuery ? (
                                <Search className="w-8 h-8 text-gray-400" />
                              ) : (
                                <HiOutlineUsers className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {searchQuery ? "Tidak Ada Hasil" : "Belum Ada Data"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {searchQuery 
                                ? `Tidak ditemukan pengguna dengan kata kunci "${searchQuery}"`
                                : "Belum ada pengguna terdaftar dalam sistem"
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user: any, index) => (
                        <tr 
                          key={user.id} 
                          className="group hover:bg-indigo-50/40 transition-all duration-150"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-500">
                              {index + 1}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-indigo-700 font-bold text-sm">
                                  {user.nama.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900 text-sm">
                                {user.nama}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {user.username}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                              user.role === "ADMIN" 
                                ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200" 
                                : "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200"
                            }`}>
                              {user.role === "ADMIN" ? (
                                <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
                              ) : (
                                <HiOutlineUserCircle className="w-3.5 h-3.5" />
                              )}
                              {user.role}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Reset Password */}
                              <button 
                                onClick={() => handleResetPassword(user.id, user.nama)}
                                title="Reset Password" 
                                className="p-2 text-amber-700 bg-amber-50 border-2 border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                              >
                                <HiOutlineKey className="w-5 h-5" />
                              </button>

                              {/* Edit */}
                              <button 
                                title="Edit Pengguna" 
                                className="p-2 text-indigo-700 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              >
                                <HiOutlinePencilSquare className="w-5 h-5" />
                              </button>
                              
                              {/* Delete */}
                              <button 
                                title="Hapus Pengguna" 
                                className="p-2 text-red-700 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus akun "${user.nama}"?`)) {
                                    // Handle delete
                                  }
                                }}
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
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ================= MODALS ================= */}
      <ResetPasswordModal 
        open={openResetModal}
        onClose={() => {
          setOpenResetModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <TambahUserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}