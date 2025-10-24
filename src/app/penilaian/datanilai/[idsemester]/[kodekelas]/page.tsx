"use client";

import { useState, use } from "react";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
    semesterId: string;
    idKelas: string;
}

interface NilaiMahasiswa {
    nim: string;
    nama: string;
    presensi: number;
    evalSubCpmk1Observasi: number;
    evalSubCpmk2Observasi: number;
    evalSubCpmk3Video: number;
    evalSubCpmk5StudyKasus: number;
    evalSubCpmk6StudyKasus: number;
    evalSubCpmk7StudyKasus: number;
    forumSubCpmk4: number;
}

// --- Data Placeholder ---
const nilaiMahasiswaList: NilaiMahasiswa[] = [
    {
        nim: "D121241001",
        nama: "MOHAMAD ALIEF NAUVAL MOHI",
        presensi: 100.00,
        evalSubCpmk1Observasi: 100.00,
        evalSubCpmk2Observasi: 90.00,
        evalSubCpmk3Video: 100.00,
        evalSubCpmk5StudyKasus: 90.00,
        evalSubCpmk6StudyKasus: 85.00,
        evalSubCpmk7StudyKasus: 85.00,
        forumSubCpmk4: 95.00
    },
    {
        nim: "D121241003",
        nama: "SITI NURAULIYA",
        presensi: 100.00,
        evalSubCpmk1Observasi: 100.00,
        evalSubCpmk2Observasi: 80.00,
        evalSubCpmk3Video: 90.00,
        evalSubCpmk5StudyKasus: 75.00,
        evalSubCpmk6StudyKasus: 80.00,
        evalSubCpmk7StudyKasus: 80.00,
        forumSubCpmk4: 100.00
    },
];

// Bobot penilaian (dalam persen)
const bobotPenilaian = {
    presensi: 0.00,
    evalSubCpmk1Observasi: 10.00,
    evalSubCpmk2Observasi: 15.00,
    evalSubCpmk3Video: 10.00,
    evalSubCpmk5StudyKasus: 10.00,
    evalSubCpmk6StudyKasus: 20.00,
    evalSubCpmk7StudyKasus: 20.00,
    forumSubCpmk4: 15.00
};

// --- Main Component ---
export default function DataNilaiDetailPage({
    params
}: {
    params: Promise<PageParams>
}) {
    const { semesterId, idKelas } = use(params);
    const [showAlert, setShowAlert] = useState(true);

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Data Nilai</h1>
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                        <p className="text-sm font-semibold">
                            Peran saat ini sebagai Admin Program Studi
                        </p>
                    </div>
                </div>

                {/* Alert Warning */}
                {showAlert && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded mb-6 relative">
                        <button
                            onClick={() => setShowAlert(false)}
                            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                        >
                            ✕
                        </button>
                        <p className="text-sm mb-3">
                            <strong>Ditemukan data dari Sikola-v2 seperti pada table berikut, Apakah anda ingin menggunakan Penilaian ini sebagai penilaian di aplikasi ini?</strong> Jika anda menggunakan penilaian ini, maka nilai yang diinput sebelumnya akan dihapus.
                        </p>
                        <div className="flex gap-2">
                            <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
                                Terima Nilai dari Sikola-v2
                            </button>
                            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                                Abaikan Nilai dari Sikola-v2
                            </button>
                            <Link href={`/penilaian/datanilai/${semesterId}`}>
                                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors">
                                    Kembali
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Main Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th rowSpan={2} className="px-4 py-3 text-left font-bold text-gray-700 uppercase border border-gray-300">
                                        NIM
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-left font-bold text-gray-700 uppercase border border-gray-300">
                                        NAMA
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-700 uppercase border border-gray-300">
                                        PRESENSI<br/>(ATTENDANCE)
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-700 uppercase border border-gray-300">
                                        EVALUASI<br/>SUB CPMK 1<br/>(OBSERVASI)<br/>(ASSIGN)
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-700 uppercase border border-gray-300">
                                        EVALUASI<br/>SUB CPMK 2<br/>(OBSERVASI)<br/>(ASSIGN)
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-700 uppercase border border-gray-300">
                                        EVALUASI<br/>SUB CPMK 3<br/>(UNJUK KERJA-<br/>VIDEO)<br/>(ASSIGN)
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-700 uppercase border border-gray-300">
                                        EVALUASI<br/>SUB CPMK 5<br/>(STUDY KASUS)<br/>(ASSIGN)
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-700 uppercase border border-gray-300">
                                        EVALUASI<br/>SUB CPMK 6<br/>(STUDY KASUS)<br/>(ASSIGN)
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-700 uppercase border border-gray-300">
                                        EVALUASI<br/>SUB CPMK 7<br/>(STUDY KASUS)<br/>(ASSIGN)
                                    </th>
                                    <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-700 uppercase border border-gray-300">
                                        SELURUH<br/>NILAI<br/>FORUM<br/>UNTUK<br/>EVALUASI<br/>SUB CPMK 4<br/>(FORUM<br/>DISKUSI)<br/>(FORUM)
                                    </th>
                                </tr>
                                <tr>
                                    {/* Second header row for percentages */}
                                </tr>
                                <tr className="bg-blue-50">
                                    <th colSpan={2} className="px-4 py-2 text-right font-bold text-gray-700 border border-gray-300">
                                        Bobot (%)
                                    </th>
                                    <th className="px-4 py-2 text-center font-bold text-indigo-700 border border-gray-300">
                                        {bobotPenilaian.presensi.toFixed(2)} %
                                    </th>
                                    <th className="px-4 py-2 text-center font-bold text-indigo-700 border border-gray-300">
                                        {bobotPenilaian.evalSubCpmk1Observasi.toFixed(2)} %
                                    </th>
                                    <th className="px-4 py-2 text-center font-bold text-indigo-700 border border-gray-300">
                                        {bobotPenilaian.evalSubCpmk2Observasi.toFixed(2)} %
                                    </th>
                                    <th className="px-4 py-2 text-center font-bold text-indigo-700 border border-gray-300">
                                        {bobotPenilaian.evalSubCpmk3Video.toFixed(2)} %
                                    </th>
                                    <th className="px-4 py-2 text-center font-bold text-indigo-700 border border-gray-300">
                                        {bobotPenilaian.evalSubCpmk5StudyKasus.toFixed(2)} %
                                    </th>
                                    <th className="px-4 py-2 text-center font-bold text-indigo-700 border border-gray-300">
                                        {bobotPenilaian.evalSubCpmk6StudyKasus.toFixed(2)} %
                                    </th>
                                    <th className="px-4 py-2 text-center font-bold text-indigo-700 border border-gray-300">
                                        {bobotPenilaian.evalSubCpmk7StudyKasus.toFixed(2)} %
                                    </th>
                                    <th className="px-4 py-2 text-center font-bold text-indigo-700 border border-gray-300">
                                        {bobotPenilaian.forumSubCpmk4.toFixed(2)} %
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {nilaiMahasiswaList.map((mahasiswa, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-700 font-mono border border-gray-200">
                                            {mahasiswa.nim}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 border border-gray-200">
                                            {mahasiswa.nama}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 border border-gray-200">
                                            {mahasiswa.presensi.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 border border-gray-200">
                                            {mahasiswa.evalSubCpmk1Observasi.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 border border-gray-200">
                                            {mahasiswa.evalSubCpmk2Observasi.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 border border-gray-200">
                                            {mahasiswa.evalSubCpmk3Video.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 border border-gray-200">
                                            {mahasiswa.evalSubCpmk5StudyKasus.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 border border-gray-200">
                                            {mahasiswa.evalSubCpmk6StudyKasus.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 border border-gray-200">
                                            {mahasiswa.evalSubCpmk7StudyKasus.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 border border-gray-200">
                                            {mahasiswa.forumSubCpmk4.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {nilaiMahasiswaList.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-sm">Tidak ada data nilai mahasiswa</p>
                        </div>
                    )}
                </div>

                {/* Back to Top Button */}
                <div className="fixed bottom-8 right-8">
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        title="Kembali ke atas"
                    >
                        <svg className="w-6 h-6 rotate-[-90deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}