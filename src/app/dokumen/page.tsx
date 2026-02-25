"use client";

import { useState } from "react";
import { 
  FileText, 
  Printer,
  ChevronRight,
  ChevronLeft,
  Info
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import Link from "next/link";

export default function DokumenAkreditasiPage() {
  return (
    <DashboardLayout>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area,
          #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }

        .rps-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0;
        }

        .rps-table th,
        .rps-table td {
          border: 1px solid #000;
          padding: 8px;
          font-size: 11px;
          line-height: 1.4;
          color: #000;
          vertical-align: top;
        }

        .rps-table th {
          background-color: #e0e0e0;
          font-weight: bold;
          text-align: center;
        }

        .header-box {
          background: linear-gradient(to bottom, #7fa8d8 0%, #a8c5e6 100%);
          border: 2px solid #000;
          padding: 15px;
          margin-bottom: 0;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 10px;
        }

        .text-section {
          flex: 1;
          text-align: center;
        }

        .gray-header {
          background-color: #d3d3d3 !important;
        }

        .light-gray {
          background-color: #f0f0f0 !important;
        }

        .nested-table-container td {
          padding: 0 !important;
          border: none !important;
        }

        .nested-table {
          width: 100%;
          border-collapse: collapse;
        }

        .nested-table td {
          border: 1px solid #000;
          padding: 8px;
          font-size: 11px;
          line-height: 1.4;
          color: #000;
        }

        @media print {
          .rps-table th,
          .rps-table td {
            border: 1px solid #000 !important;
            color: #000 !important;
          }
          .nested-table td {
            border: 1px solid #000 !important;
            color: #000 !important;
          }
        }
      `}</style>

      {/* Navigation & Actions - No Print */}
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="no-print mb-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/rps" className="hover:text-indigo-600 transition-colors">
              RPS
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900">Dokumen Akreditasi</span>
          </div>

          {/* Header with Actions */}
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100/50 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <FileText size={28} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Dokumen Akreditasi RPS
                  </h1>
                  <p className="text-sm text-gray-600 mb-3">
                    Format Standar Rencana Pembelajaran Semester
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white border-2 border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    <Info size={14} />
                    <span>Komputasi GPU - 23D12131602</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/rps">
                  <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all font-semibold group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                    <span>Kembali</span>
                  </button>
                </Link>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold">
                  <Printer size={18} strokeWidth={2.5} />
                  <span>Cetak PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Mata Kuliah</p>
                  <p className="text-base font-bold text-gray-900">Komputasi GPU</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Kode:</span>
                  <span className="font-semibold text-gray-900">23D12131602</span>
                </div>
                <div className="flex justify-between">
                  <span>SKS:</span>
                  <span className="font-semibold text-gray-900">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Semester:</span>
                  <span className="font-semibold text-gray-900">5</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Koordinator MK</p>
                  <p className="text-sm font-bold text-gray-900">Dr. Adnan, ST., MT.</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">Dosen Pengembang RPS & Koordinator</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Ketua Prodi</p>
                  <p className="text-sm font-bold text-gray-900">Prof. Dr. Ir. Indrabayu</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">S.T., M.T., M.Bus.Sys., IPM., ASEAN.Eng.</p>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm mb-2">Informasi Dokumen</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Dokumen ini merupakan format standar RPS untuk keperluan akreditasi program studi. 
                  Klik tombol "Cetak PDF" untuk mengunduh dokumen dalam format yang siap dicetak.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Area - SEMUA TABEL LENGKAP */}
        <div id="print-area" className="bg-white p-6 rounded-xl shadow-sm">
          
          {/* Header dengan Logo */}
          <div className="header-box">
            <div className="logo-section">
              <div style={{width: '80px', height: '80px', flexShrink: 0}}>
                <img 
                  src="/logo-unhas.png" 
                  alt="Logo UNHAS" 
                  style={{width: '100%', height: '100%', objectFit: 'contain'}}
                />
              </div>
              <div className="text-section">
                <div style={{fontSize: '13px', fontWeight: 'bold', color: '#000', marginBottom: '2px'}}>
                  FAKULTAS TEKNIK
                </div>
                <div style={{fontSize: '12px', fontWeight: 'bold', color: '#000', marginBottom: '5px'}}>
                  PROGRAM STUDI TEKNIK INFORMATIKA - S1
                </div>
                <div style={{fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '2px'}}>
                  RENCANA PEMBELAJARAN SEMESTER
                </div>
                <div style={{fontSize: '11px', fontStyle: 'italic', color: '#000'}}>
                  ( SEMESTER LECTURE PLAN )
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Info Mata Kuliah */}
          <table className="rps-table">
            <thead>
              <tr>
                <th style={{width: '25%'}}>Mata Kuliah (MK)</th>
                <th style={{width: '15%'}}>KODE</th>
                <th style={{width: '15%'}}>Rumpun MK</th>
                <th style={{width: '10%'}}>BOBOT<br/>(SKS)</th>
                <th style={{width: '10%'}}>SEMESTER</th>
                <th style={{width: '25%'}}>Tgl Penyusunan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center font-semibold" style={{color: '#000'}}>Komputasi GPU</td>
                <td className="text-center" style={{color: '#000'}}>23D12131602</td>
                <td className="text-center" style={{color: '#000'}}>None</td>
                <td className="text-center font-bold" style={{color: '#000'}}>2</td>
                <td className="text-center font-bold" style={{color: '#000'}}>5</td>
                <td className="text-center" style={{color: '#000'}}>None</td>
              </tr>
            </tbody>
          </table>

          {/* Tabel Otorisasi */}
          <table className="rps-table">
            <tbody>
              <tr>
                <td rowSpan={2} style={{width: '15%', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', padding: '12px 8px'}}>
                  OTORITAS
                </td>
                <td style={{width: '28.33%', fontWeight: 'bold', textAlign: 'center', padding: '8px', backgroundColor: '#e0e0e0'}}>
                  Dosen Pengembang RPS
                </td>
                <td style={{width: '28.33%', fontWeight: 'bold', textAlign: 'center', padding: '8px', backgroundColor: '#e0e0e0'}}>
                  Koordinator MK
                </td>
                <td style={{width: '28.33%', fontWeight: 'bold', textAlign: 'center', padding: '8px', backgroundColor: '#e0e0e0'}}>
                  Ketua PRODI
                </td>
              </tr>
              <tr style={{height: '60px'}}>
                <td className="text-center align-bottom" style={{color: '#000'}}>
                  <div className="font-semibold">Dr. Adnan, ST., MT.</div>
                </td>
                <td className="text-center align-bottom" style={{color: '#000'}}>
                  <div className="font-semibold">Dr. Adnan, ST., MT.</div>
                </td>
                <td className="text-center align-bottom" style={{color: '#000', fontSize: '10px'}}>
                  <div className="font-semibold">Prof. Dr. Ir. Indrabayu, S.T., M.T., M.Bus.Sys., IPM., ASEAN.Eng.</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tabel Gabungan - Semua Konten */}
          <table className="rps-table">
            <tbody>
              {/* CPL-PRODI yang dibebankan pada MK */}
              <tr>
                <td rowSpan={21} style={{width: '15%', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'top', padding: '12px 8px'}}>
                  Capaian<br/>Pembelajaran<br/>Mata Kuliah
                </td>
                <td colSpan={2} className="gray-header" style={{fontWeight: 'bold', textAlign: 'center', padding: '8px'}}>
                  CPL-PRODI yang dibebankan pada MK
                </td>
              </tr>
              <tr>
                <td style={{width: '10%'}} className="text-center font-bold light-gray">CPL-1:</td>
                <td style={{color: '#000', fontSize: '11px'}}>
                  Memiliki dasar pengetahuan Teknik Informatika yang meliputi teori dan konsep dasar dari Ilmu Komputer, Matematika dan Statistika, Algoritma dan Pemrograman, Rekayasa Perangkat Lunak, Manajemen Informasi dan Ketahanan Digital, serta pengetahuan tingkat lanjut pada bidang-bidang khusus Teknik Informatika, seperti Kecerdasan Buatan, Data Science, Jaringan Komputer, Komputasi Awan dan Internet of Things.
                </td>
              </tr>
              <tr>
                <td className="text-center font-bold light-gray">CPL-3:</td>
                <td style={{color: '#000', fontSize: '11px'}}>
                  Mampu mengaplikasikan pengetahuan bidang Teknik Informatika yang dipadankan dengan bidang ilmu lainnya untuk menganalisa dan mencari solusi dari berbagai masalah berbasis komputasi.
                </td>
              </tr>
              <tr>
                <td className="text-center font-bold light-gray">CPL-6:</td>
                <td style={{color: '#000', fontSize: '11px'}}>
                  Mampu bekerja secara efektif dalam tim, baik sebagai pimpinan atau anggota, pada berbagai kegiatan yang berhubungan dengan tanggung jawab profesional.
                </td>
              </tr>

              {/* CPL => Indikator Kinerja */}
              <tr>
                <td colSpan={2} className="gray-header" style={{fontWeight: 'bold', textAlign: 'center', padding: '8px'}}>
                  CPL ⇒ Indikator Kinerja (IK)
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{fontStyle: 'italic', color: '#000', fontSize: '11px', padding: '6px 8px'}}>
                  Setelah menyelesaikan mata kuliah ini, diharapkan:
                </td>
              </tr>
              <tr>
                <td style={{textAlign: 'center', fontWeight: 'bold'}} className="light-gray">CPL-1</td>
                <td style={{fontSize: '11px'}}>
                  <strong>IK-1</strong> : Mahasiswa mampu memahami dan menjelaskan konsep dasar komputasi pervasive serta peran GPU dalam mendukung komputasi modern.
                </td>
              </tr>
              <tr>
                <td style={{textAlign: 'center', fontWeight: 'bold'}} className="light-gray">CPL-3</td>
                <td style={{fontSize: '11px'}}>
                  <strong>IK-2</strong> : Mahasiswa mampu menganalisis permasalahan terkait komputasi GPU serta merancang solusi yang sesuai dengan kebutuhan sistem.
                </td>
              </tr>
              <tr>
                <td style={{textAlign: 'center', fontWeight: 'bold'}} className="light-gray">CPL-6</td>
                <td style={{fontSize: '11px'}}>
                  <strong>IK-3</strong> : Mahasiswa mampu mendesain dan mengimplementasikan solusi berbasis GPU untuk memecahkan permasalahan komputasi secara efisien dan efektif.
                </td>
              </tr>

              {/* IK => CPMK */}
              <tr>
                <td colSpan={2} className="gray-header" style={{fontWeight: 'bold', textAlign: 'center', padding: '8px'}}>
                  IK ⇒ Capaian Pembelajaran Mata Kuliah (CPMK)
                </td>
              </tr>
              <tr>
                <td style={{textAlign: 'center', fontWeight: 'bold'}} className="light-gray">IK-1</td>
                <td style={{fontSize: '11px'}}>
                  <strong>CPMK-1</strong> : Mahasiswa mampu memahami dan menjelaskan konsep dasar komputasi pervasive serta peran GPU dalam mendukung komputasi modern.
                </td>
              </tr>
              <tr>
                <td style={{textAlign: 'center', fontWeight: 'bold'}} className="light-gray">IK-2</td>
                <td style={{fontSize: '11px'}}>
                  <strong>CPMK-2</strong> : Mahasiswa mampu menganalisis permasalahan terkait komputasi GPU serta merancang solusi yang sesuai dengan kebutuhan sistem.
                </td>
              </tr>
              <tr>
                <td style={{textAlign: 'center', fontWeight: 'bold'}} className="light-gray">IK-3</td>
                <td style={{fontSize: '11px'}}>
                  <strong>CPMK-3</strong> : Mahasiswa mampu mendesain dan mengimplementasikan solusi berbasis GPU untuk memecahkan permasalahan komputasi secara efisien dan efektif.
                </td>
              </tr>

              {/* CPMK => Sub-CPMK */}
              <tr>
                <td colSpan={2} className="gray-header" style={{fontWeight: 'bold', textAlign: 'center', padding: '8px'}}>
                  CPMK ⇒ Sub-CPMK
                </td>
              </tr>
              <tr>
                <td style={{textAlign: 'center', fontWeight: 'bold'}} className="light-gray">CPMK-1</td>
                <td style={{color: '#000', fontSize: '11px'}}>
                  <strong>SUB-CPMK-1:</strong> CPL 1 : Memahami konsep dasar komputasi GPU.
                </td>
              </tr>
              <tr>
                <td className="text-center font-bold light-gray">CPMK-2</td>
                <td style={{color: '#000', fontSize: '11px'}}>
                  <strong>SUB-CPMK-2:</strong> CPL 3 : Mampu mengimplementasikan algoritma paralel menggunakan GPU.
                </td>
              </tr>
              <tr>
                <td className="text-center font-bold light-gray">CPMK-3</td>
                <td style={{color: '#000', fontSize: '11px'}}>
                  <strong>SUB-CPMK-3:</strong> CPL 6 : Menguasai penggunaan perangkat lunak dan framework untuk pengembangan komputasi GPU.
                </td>
              </tr>

              {/* Korelasi */}
              <tr>
                <td colSpan={2} className="gray-header" style={{fontWeight: 'bold', textAlign: 'center', padding: '8px'}}>
                  KORELASI ANTARA CPL/IK/CPMK terhadap Sub CPMK
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tabel Korelasi dan Asesmen */}
          <table className="rps-table">
            <thead>
              <tr>
                <th rowSpan={2} style={{width: '10%'}}>CPL yang dibebankan pada MK</th>
                <th rowSpan={2} style={{width: '8%'}}>IK</th>
                <th rowSpan={2} style={{width: '10%'}}>CPMK</th>
                <th rowSpan={2} style={{width: '12%'}}>SUB CPMK</th>
                <th colSpan={2} style={{width: '25%'}}>Bentuk Asesmen*</th>
                <th rowSpan={2} style={{width: '8%'}}>Bobot</th>
                <th rowSpan={2} style={{width: '8%'}}>Nilai</th>
                <th rowSpan={2} style={{width: '19%'}}>Skor Mahasiswa</th>
              </tr>
              <tr>
                <th style={{width: '12.5%'}}>Formative</th>
                <th style={{width: '12.5%'}}>Sumative<br/>Hasil Project</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center" style={{fontSize: '11px'}}>CPL-1</td>
                <td className="text-center" style={{fontSize: '11px'}}>IK-1</td>
                <td className="text-center" style={{fontSize: '11px'}}>CPMK-1</td>
                <td className="text-center" style={{fontSize: '11px'}}>SUB-CPMK-1</td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>30</td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>30</td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
              </tr>
              <tr>
                <td className="text-center" style={{fontSize: '11px'}}>CPL-3</td>
                <td className="text-center" style={{fontSize: '11px'}}>IK-2</td>
                <td className="text-center" style={{fontSize: '11px'}}>CPMK-2</td>
                <td className="text-center" style={{fontSize: '11px'}}>SUB-CPMK-2</td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>30</td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>30</td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
              </tr>
              <tr>
                <td className="text-center" style={{fontSize: '11px'}}>CPL-6</td>
                <td className="text-center" style={{fontSize: '11px'}}>IK-3</td>
                <td className="text-center" style={{fontSize: '11px'}}>CPMK-3</td>
                <td className="text-center" style={{fontSize: '11px'}}>SUB-CPMK-3</td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>40</td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>40</td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
                <td className="text-center" style={{fontSize: '11px'}}></td>
              </tr>
              <tr>
                <td colSpan={5} style={{fontSize: '11px'}}></td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>100</td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>100</td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>

          {/* Deskripsi Matakuliah */}
          <table className="rps-table">
            <tbody>
              <tr>
                <td rowSpan={2} style={{width: '15%', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'top', padding: '12px 8px'}}>
                  Deskripsi<br/>Matakuliah
                </td>
                <td style={{fontSize: '11px', padding: '8px', lineHeight: '1.6'}}>
                  Mata kuliah ini dirancang untuk memberikan pemahaman mendalam tentang prinsip-prinsip komputasi paralel menggunakan unit pemrosesan grafis (GPU). GPU adalah teknologi yang dirancang untuk menangani tugas-tugas komputasi intensif secara paralel, menjadikannya sangat penting untuk berbagai aplikasi modern, mulai dari simulasi ilmiah hingga pembelajaran mendalam (deep learning).
                </td>
              </tr>
              <tr>
                <td style={{padding: 0}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr>
                        <td style={{border: 'none', padding: '8px 8px 2px 8px', fontSize: '11px', fontWeight: 'bold'}}>
                          Materi Pembelajaran<br/>/Pokok Bahasan
                        </td>
                      </tr>
                      <tr>
                        <td style={{border: 'none', padding: '2px 8px', fontSize: '11px', lineHeight: '1.8'}}>
                          <div>1. Arsitektur GPU, perbedaan CPU vs GPU</div>
                          <div>2. Paralelism: SIMD, MIMD, thread hierarchy</div>
                          <div>3. Pengenalan CUDA/OpenCL, penulisan kernel sederhana</div>
                          <div>4. Optimasi memori: global, shared, dan local memory</div>
                          <div>5. Penggunaan alat profiling seperti NVIDIA Nsight</div>
                          <div>6. Implementasi algoritma paralel kompleks: matrix multiplication</div>
                          <div>7. Aplikasi GPU: simulasi fisika, grafis komputer, data analytics</div>
                          <div>8. Aplikasi GPU: deep learning, pengenalan tanpa framework spesifik</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Referensi */}
          <table className="rps-table">
            <tbody>
              <tr>
                <td rowSpan={3} style={{width: '15%', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'top', padding: '12px 8px'}}>
                  Referensi
                </td>
                <td style={{fontSize: '11px', fontWeight: 'bold', padding: '6px 8px', backgroundColor: '#f0f0f0'}}>
                  Referensi Utama
                </td>
              </tr>
              <tr>
                <td style={{fontSize: '11px', padding: '6px 8px', lineHeight: '1.6'}}>
                  <div>1. Deakin, Tom dan Mattson, Timothy G., 2023, Programming Your GPU with OpenMP, Penguin Books, London.</div>
                  <div style={{marginTop: '4px'}}>2. Cook, Shane, 2012, CUDA Programming: A Developer's Guide to Parallel Computing with GPUs, Morgan Kaufmann, Burlington</div>
                </td>
              </tr>
              <tr>
                <td style={{padding: 0}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr>
                        <td style={{border: '1px solid #000', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', fontSize: '11px', fontWeight: 'bold', padding: '6px 8px', backgroundColor: '#f0f0f0'}}>
                          Referensi Tambahan
                        </td>
                      </tr>
                      <tr>
                        <td style={{border: 'none', fontSize: '11px', padding: '6px 8px'}}>
                          -
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tim Pengajaran */}
          <table className="rps-table">
            <tbody>
              <tr>
                <td style={{width: '15%', fontWeight: 'bold', textAlign: 'center', padding: '8px'}}>
                  Tim Pengajaran
                </td>
                <td style={{fontSize: '11px', padding: '8px', textAlign: 'center'}}>
                  Dr. Eng. Ir. Muhammad Niswar, S.T., M.InfoTech , Dr. Adnan, ST.,MT.
                </td>
              </tr>
              <tr>
                <td style={{fontWeight: 'bold', textAlign: 'center', padding: '8px'}}>
                  Mata kuliah<br/>syarat
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tabel Rencana Pembelajaran */}
          <table className="rps-table">
            <thead>
              <tr>
                <th rowSpan={2} style={{width: '6%'}}>Pertemuan<br/>Ke-</th>
                <th rowSpan={2} style={{width: '15%'}}>Sub CPMK<br/>(Kemampuan akhir tiap tahapan belajar)</th>
                <th colSpan={2}>Penilaian (Assessment)</th>
                <th colSpan={2}>Bentuk dan Metode Pembelajaran<br/>[estimasi waktu] (Learning Method)</th>
                <th rowSpan={2} style={{width: '15%'}}>Materi Pembelajaran<br/>(Content)</th>
                <th rowSpan={2} style={{width: '6%'}}>Bobot Penilaian<br/>(%)</th>
              </tr>
              <tr>
                <th style={{width: '10%'}}>Indikator (Indicator)</th>
                <th style={{width: '15%'}}>Teknik & Kriteria<br/>(Techniques &<br/>Criteria)</th>
                <th style={{width: '15%'}}>Luring (Offline System)</th>
                <th style={{width: '13%'}}>Daring (Online<br/>System)</th>
              </tr>
              <tr>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
                <th>8</th>
              </tr>
            </thead>
            <tbody>
              {/* Minggu 1-6 */}
              <tr>
                <td className="text-center" style={{fontSize: '11px', verticalAlign: 'top'}}>1-6</td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  CPL 1 : Memahami konsep dasar komputasi GPU. (CPMK-1)
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '8px'}}><strong>Formative:</strong></div>
                  <div style={{marginBottom: '8px'}}>-</div>
                  <div><strong>Sumative:</strong></div>
                  <div>-</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '4px'}}><strong style={{color: '#0066cc'}}>Kriteria Formative:</strong></div>
                  <div style={{marginBottom: '8px'}}><strong style={{color: '#0066cc'}}>Kriteria Sumative:</strong></div>
                  <div style={{marginBottom: '4px'}}>Hasil Project (30) dinilai dengan rubrik 23D121</div>
                  <div style={{marginBottom: '8px'}}><strong style={{color: '#0066cc'}}>Teknik Penilaian:</strong></div>
                  <div>None</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '4px'}}><strong>Kuliah:</strong></div>
                  <div style={{marginBottom: '8px'}}>Discovery Learning, Pembelajaran Berbasis Projek (Project-based Learning)</div>
                  <div style={{marginBottom: '4px'}}>6 × 2 × 50</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}></td>
                <td style={{fontSize: '10px', padding: '8px', lineHeight: '1.6'}}>
                  <div>1. Arsitektur GPU, perbedaan CPU vs GPU</div>
                  <div>2. Paralelism: SIMD, MIMD, thread hierarchy</div>
                  <div>3. Pengenalan CUDA/OpenCL, penulisan kernel sederhana</div>
                </td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>30</td>
              </tr>

              {/* Minggu 7-10 */}
              <tr>
                <td className="text-center" style={{fontSize: '11px', verticalAlign: 'top'}}>7-10</td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  CPL 3 : Mampu mengimplementasikan algoritma paralel menggunakan GPU. (CPMK-2)
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '8px'}}><strong>Formative:</strong></div>
                  <div style={{marginBottom: '8px'}}>-</div>
                  <div><strong>Sumative:</strong></div>
                  <div>-</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '4px'}}><strong style={{color: '#0066cc'}}>Kriteria Formative:</strong></div>
                  <div style={{marginBottom: '8px'}}><strong style={{color: '#0066cc'}}>Kriteria Sumative:</strong></div>
                  <div style={{marginBottom: '4px'}}>Hasil Project (30) dinilai dengan rubrik 23D121</div>
                  <div style={{marginBottom: '8px'}}><strong style={{color: '#0066cc'}}>Teknik Penilaian:</strong></div>
                  <div>None</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '4px'}}><strong>Kuliah:</strong></div>
                  <div style={{marginBottom: '8px'}}>Discovery Learning, Pembelajaran Berbasis Projek (Project-based Learning)</div>
                  <div style={{marginBottom: '4px'}}>4 × 2 × 50</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}></td>
                <td style={{fontSize: '10px', padding: '8px', lineHeight: '1.6'}}>
                  <div>1. Optimasi memori: global, shared, dan local memory</div>
                  <div>2. Penggunaan alat profiling seperti NVIDIA Nsight</div>
                </td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>30</td>
              </tr>

              {/* Minggu 11-16 */}
              <tr>
                <td className="text-center" style={{fontSize: '11px', verticalAlign: 'top'}}>11-16</td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  CPL 6 : Menguasai penggunaan perangkat lunak dan framework untuk pengembangan komputasi GPU (CPMK-3)
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '8px'}}><strong>Formative:</strong></div>
                  <div style={{marginBottom: '8px'}}>-</div>
                  <div><strong>Sumative:</strong></div>
                  <div>-</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '4px'}}><strong style={{color: '#0066cc'}}>Kriteria Formative:</strong></div>
                  <div style={{marginBottom: '8px'}}><strong style={{color: '#0066cc'}}>Kriteria Sumative:</strong></div>
                  <div style={{marginBottom: '4px'}}>Hasil Project (40) dinilai dengan rubrik 23D121</div>
                  <div style={{marginBottom: '8px'}}><strong style={{color: '#0066cc'}}>Teknik Penilaian:</strong></div>
                  <div>None</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}>
                  <div style={{marginBottom: '4px'}}><strong>Kuliah:</strong></div>
                  <div style={{marginBottom: '8px'}}>Discovery Learning, Pembelajaran Berbasis Projek (Project-based Learning)</div>
                  <div style={{marginBottom: '4px'}}>6 × 2 × 50</div>
                </td>
                <td style={{fontSize: '11px', padding: '8px'}}></td>
                <td style={{fontSize: '10px', padding: '8px', lineHeight: '1.6'}}>
                  <div>1. Implementasi algoritma paralel kompleks: matrix multiplication</div>
                  <div>2. Aplikasi GPU: simulasi fisika, grafis komputer, data analytics</div>
                  <div>3. Aplikasi GPU: deep learning, pengenalan tanpa framework spesifik</div>
                </td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>40</td>
              </tr>

              {/* Total Row */}
              <tr>
                <td colSpan={7}></td>
                <td className="text-center" style={{fontSize: '11px', fontWeight: 'bold'}}>100</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </DashboardLayout>
  );
}