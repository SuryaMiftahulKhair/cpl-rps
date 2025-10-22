"use client";

import { useState } from "react";
import Link from "next/link";
import { Book, LayoutPanelTop } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout"; // Sesuaikan path

// --- Data Kurikulum ---
const kurikulumList = [
    { id: 1003, nama: "Kurikulum Sarjana K-23" },
    { id: 864, nama: "Kurikulum 2021" },
    { id: 118, nama: "Kurikulum 2018" },
    { id: 117, nama: "KPT 2016" },
    { id: 116, nama: "KBK 2011" },
    { id: 115, nama: "KURIKULUM 2008" },
];

// --- Komponen RPS Card ---
interface KurikulumCardProps {
    kurikulum: { id: number; nama: string };
}

const KurikulumCard: React.FC<KurikulumCardProps> = ({ kurikulum }) => (
    // Link ke halaman detail RPS Matakuliah per Kurikulum
    <Link 
        href={`/rps/${kurikulum.id}/list`} // Rute dinamis untuk daftar RPS
        className="bg-white p-6 rounded-xl shadow-md border border-gray-200 
                   flex flex-col justify-center items-center text-center 
                   transition duration-200 hover:shadow-lg hover:border-indigo-400 hover:bg-indigo-50"
    >
        <Book size={32} className="text-indigo-500 mb-2" />
        <h3 className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
            {kurikulum.nama}
        </h3>
    </Link>
);


// --- Komponen Utama RPSMatakuliahPage ---

export default function RPSMatakuliahPage() {
    // Asumsi: Peran ini mungkin datang dari context atau state global
    const userRole = "Admin Program Studi"; 

    return (
        <DashboardLayout>
            <div className="p-8">
                
                {/* Page Header and Role Alert */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <LayoutPanelTop size={28} className="text-indigo-600" />
                        RPS Matakuliah
                    </h1>
                    
                    {/* Role Alert Box */}
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm shadow-sm">
                        Peran saat ini sebagai **{userRole}**
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-4">Pilih Kurikulum</h2>

                    {/* Kurikulum Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {kurikulumList.map((kurikulum) => (
                            <KurikulumCard key={kurikulum.id} kurikulum={kurikulum} />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}