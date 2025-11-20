'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Menu as MenuIcon, Printer, X, RefreshCw } from 'lucide-react';
import DashboardLayout from "@/app/components/DashboardLayout";

// Type definitions
interface Course {
  code: string;
  name: string;
  semester: number;
}

// Data mata kuliah
const courseData: Course[] = [
  { code: '23D12110102', name: 'Pengantar Teknologi Informasi', semester: 1 },
  { code: '23D12110203', name: 'Dasar Pemrograman Komputer', semester: 1 },
  { code: '23D12110303', name: 'Sistem Digital', semester: 1 },
  { code: '23D12110403', name: 'Dasar Listrik dan Elektronika', semester: 1 },
  { code: '23D12110503', name: 'Matematika Diskrit', semester: 2 },
  { code: '23D12110604', name: 'Algoritma dan Struktur Data', semester: 2 },
  { code: '23D12110702', name: 'Dasar Multimedia', semester: 2 },
  { code: '23D12110802', name: 'Interaksi Manusia dan Komputer', semester: 2 },
  { code: '23D12120103', name: 'Aljabar Linear', semester: 3 },
  { code: '23D12120202', name: 'Basis Data', semester: 3 },
  { code: '23D12120303', name: 'Arsitektur dan Organisasi Komputer', semester: 3 },
  { code: '23D12120403', name: 'Pemrograman Berorientasi Obyek', semester: 3 },
  { code: '23D12120503', name: 'Kecerdasan Buatan', semester: 3 },
  { code: '23D12120602', name: 'Teori Bahasa dan Otomata', semester: 3 },
  { code: '23D12120702', name: 'Pemrograman Script', semester: 3 },
  { code: '23D12120803', name: 'Probabilitas dan Statistika', semester: 3 },
  { code: '23D12120902', name: 'Manajemen Basis Data', semester: 4 },
  { code: '23D12121003', name: 'Metode Komputasi Numerik', semester: 4 },
  { code: '23D12121103', name: 'Sistem Operasi', semester: 4 },
  { code: '23D12121203', name: 'Rekayasa Perangkat Lunak', semester: 4 },
  { code: '23D12121303', name: 'Keamanan Digital', semester: 4 },
  { code: '23D12121403', name: 'Jaringan Komputer', semester: 4 },
  { code: '23D12121503', name: 'Technopreneurship', semester: 4 },
  { code: '23D12130103', name: 'Pemrograman Web', semester: 5 }
];

// Data ILO
const iloDescriptions: Record<string, string> = {
  'ILO-1': 'Memiliki dasar pengetahuan Teknik Informatika yang meliputi teori dan konsep dasar dari Ilmu Komputer, Matematika dan Statistika, Algoritma dan Pemrograman, Rekayasa Perangkat Lunak, Basis Data, Jaringan Komputer dan Ketahanan Digital, serta pengetahuan tingkat lanjut pada bidang-bidang khusus Teknik Informatika, seperti Kecerdasan Buatan, Data Science, Jaringan Komputer, Komputasi Awan dan Internet of Things.',
  'ILO-2': 'Memiliki pengetahuan dasar kewirausahaan, pengetahuan terhadap dasar-dasar pemanfaatan teknologi serta pengetahuan terhadap pembangunan sistem berbasis web.',
  'ILO-3': 'Mampu mengaplikasikan pengetahuan bidang Teknik Informatika yang dipadankan dengan bidang ilmu lainnya untuk menganalisa dan mencari solusi dari berbagai masalah berbasis komputasi.',
  'ILO-4': 'Mampu mendesain, mengimplementasikan dan mengevaluasi solusi berbasis komputasi dengan mengaplikasikan ilmu Teknik Informatika dan dasar-dasar pembangunan perangkat lunak.',
  'ILO-5': 'Mampu menyelesaikan tugas-tugas dalam tanggung jawab profesi dengan menegakkan prinsip-prinsip hukum dan etika.',
  'ILO-6': 'Mampu bekerja secara efektif dalam tim, baik sebagai pimpinan atau anggota, pada berbagai kegiatan yang berhubungan dengan tanggung jawab profesional.',
  'ILO-7': 'Mampu melakukan prosedur logis dan sistematis untuk menyelesaikan suatu masalah dan selanjutnya mengkomunikasikan ide secara meyakinkan dan efektif baik secara lisan maupun tulisan menyampaikan suatu solusi.',
  'ILO-8': 'Menyadari sifat dinamis dari perkembangan Teknologi Informatik serta menghormati adanya perbedaan-perbedaan sudut pandang, baik dalam hal kepercayaan, budaya, ide, dan hasil karya pribadi.'
};

// Radar Chart Component
const RadarChart: React.FC<{ data: any[]; labels: string[]; datasets: any[] }> = ({ data, labels, datasets }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    const angleStep = (Math.PI * 2) / labels.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid circles
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw grid lines
    labels.forEach((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius + 30);
      const y = centerY + Math.sin(angle) * (radius + 30);
      ctx.fillText(label, x, y);
    });

    // Draw datasets
    datasets.forEach((dataset) => {
      ctx.strokeStyle = dataset.borderColor;
      ctx.fillStyle = dataset.backgroundColor;
      ctx.lineWidth = 2;

      ctx.beginPath();
      data.forEach((point, i) => {
        const value = point[dataset.dataKey];
        const angle = angleStep * i - Math.PI / 2;
        const r = (radius / 100) * value;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }, [data, labels, datasets]);

  return <canvas ref={canvasRef} width={400} height={400} className="mx-auto" />;
};

// Bar Chart Component
const BarChart: React.FC<{ data: any[]; dataKeys: string[]; colors: string[] }> = ({ data, dataKeys, colors }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 50;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / (data.length * dataKeys.length + data.length + 1);
    const groupWidth = barWidth * dataKeys.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = canvas.height - padding - (chartHeight / 5) * i;
      const value = (100 / 5) * i;
      ctx.fillText(value.toString(), padding - 10, y + 4);
      
      ctx.strokeStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw bars
    data.forEach((item, i) => {
      const groupX = padding + (i * (groupWidth + barWidth)) + barWidth;
      
      dataKeys.forEach((key, j) => {
        const value = item[key] || 0;
        const barHeight = (chartHeight / 100) * value;
        const x = groupX + (j * barWidth);
        const y = canvas.height - padding - barHeight;

        ctx.fillStyle = colors[j];
        ctx.fillRect(x, y, barWidth - 4, barHeight);

        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(2), x + barWidth / 2 - 2, y - 5);
      });

      ctx.fillStyle = '#6b7280';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, groupX + groupWidth / 2 - barWidth / 2, canvas.height - padding + 20);
    });
  }, [data, dataKeys, colors]);

  return <canvas ref={canvasRef} width={600} height={350} className="mx-auto" />;
};

export default function CPLProdiGrafikPage() {
  const params = useParams();
  const router = useRouter();
  const kurikulumId = params?.id ? Number(params.id) : null;
  
  const [kurikulumName, setKurikulumName] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMK, setSelectedMK] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [kurikulumId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulasi load data - nanti bisa diganti dengan API
      // const res = await fetch(`/api/kurikulum/${kurikulumId}`);
      
      // Mapping nama kurikulum berdasarkan ID
      const nameMap: Record<number, string> = {
        1003: 'Kurikulum Sarjana K-23',
        864: 'Kurikulum 2021',
        118: 'Kurikulum 2018',
        117: 'KPT 2016',
        116: 'KBK 2011',
        115: 'KURIKULUM 2008'
      };
      
      setTimeout(() => {
        if (kurikulumId) {
          setKurikulumName(nameMap[kurikulumId] || `Kurikulum ${kurikulumId}`);
        }
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Load error:', err);
      setLoading(false);
    }
  };

  const handleOpenModal = (course: Course) => {
    setSelectedMK(course);
    setShowModal(true);
  };

  // Data untuk radar chart
  const radarDataK23 = [
    { subject: 'ILO-1', target: 100, prodi: 95, ganjil: 90 },
    { subject: 'ILO-2', target: 100, prodi: 88, ganjil: 85 },
    { subject: 'ILO-3', target: 100, prodi: 92, ganjil: 88 },
    { subject: 'ILO-4', target: 100, prodi: 87, ganjil: 83 },
    { subject: 'ILO-5', target: 100, prodi: 90, ganjil: 86 },
    { subject: 'ILO-6', target: 100, prodi: 85, ganjil: 82 },
    { subject: 'ILO-7', target: 100, prodi: 93, ganjil: 89 },
    { subject: 'ILO-8', target: 100, prodi: 91, ganjil: 87 }
  ];

  const barDataMK = [
    { name: 'ILO-1', target: 80, ganjil: 84.18 },
    { name: 'ILO-6', target: 80, ganjil: 84.18 },
    { name: 'ILO-7', target: 80, ganjil: 76.82 }
  ];

  const radarDataSemester = [
    { subject: 'ILO-1', target: 100, prodi: 95 },
    { subject: 'ILO-2', target: 100, prodi: 88 },
    { subject: 'ILO-3', target: 100, prodi: 0 },
    { subject: 'ILO-4', target: 100, prodi: 0 },
    { subject: 'ILO-5', target: 100, prodi: 0 },
    { subject: 'ILO-6', target: 100, prodi: 85 },
    { subject: 'ILO-7', target: 100, prodi: 93 },
    { subject: 'ILO-8', target: 100, prodi: 91 }
  ];

  const barDataSemester = [
    { name: 'ILO-1', value: 66.41 },
    { name: 'ILO-2', value: 51.97 },
    { name: 'ILO-3', value: 72.65 },
    { name: 'ILO-4', value: 31.89 },
    { name: 'ILO-5', value: 76.96 },
    { name: 'ILO-6', value: 71.26 },
    { name: 'ILO-7', value: 85.29 },
    { name: 'ILO-8', value: 0 }
  ];

  const classDetailData = [
    { no: 1, code: '23D12110102', name: 'Pengantar Teknologi Informasi', class: 'Pengantar Teknologi Informasi Kls. A', cpl1: 84.37, cpl6: 83.76, cpl7: 85.6 },
    { no: 2, code: '23D12110102', name: 'Pengantar Teknologi Informasi', class: 'Pengantar Teknologi Informasi Kls. B', cpl1: 82.73, cpl6: 84.03, cpl7: 82.6 }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-500 mt-3">Memuat data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Grafik CPL Matakuliah</h1>
            <p className="text-sm text-gray-500 mt-1">{kurikulumName}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-sky-700"
            >
              <RefreshCw size={18} /> Update Grafik
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-gray-600"
            >
              <ChevronLeft size={18} /> Kembali
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Radar Chart */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-800">
                Grafik ILO ({kurikulumName})
              </h4>
              <MenuIcon size={20} className="text-gray-400" />
            </div>
            <RadarChart 
              data={radarDataK23}
              labels={radarDataK23.map(d => d.subject)}
              datasets={[
                { dataKey: 'target', borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' },
                { dataKey: 'prodi', borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                { dataKey: 'ganjil', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)' }
              ]}
            />
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Target ILO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>ILO Prodi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>GANJIL 2024/2025</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-800">
                Grafik ILO MK (Pengantar Teknologi Informasi)
              </h4>
              <MenuIcon size={20} className="text-gray-400" />
            </div>
            <BarChart 
              data={barDataMK}
              dataKeys={['target', 'ganjil']}
              colors={['#3b82f6', '#10b981']}
            />
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Target ILO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>GANJIL 2024/2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-xl mb-6">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800">Data Mata Kuliah</h4>
            <p className="text-sm text-gray-600">Tanggal Update: 13 Januari 2025</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Kode"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Nama"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Semester"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-bold text-indigo-700 uppercase">KODE</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-indigo-700 uppercase">NAMA</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-indigo-700 uppercase">SEMESTER</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-indigo-700 uppercase">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {courseData.slice(0, 10).map((course) => (
                    <tr key={course.code} className="border-b border-gray-100 hover:bg-indigo-50/30 transition">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700">{course.code}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{course.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 text-center">{course.semester}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenModal(course)}
                          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                        >
                          Tampil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ILO Descriptions */}
        <div className="bg-white rounded-xl shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md">
              GANJIL 2024/2025
            </div>
          </div>

          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-32">KODE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ILO</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(iloDescriptions).map(([code, description]) => (
                  <tr key={code} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-4 text-sm font-medium text-gray-700 align-top">{code}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedMK && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-800">Detail Mata Kuliah - {selectedMK.name}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Radar Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-800">
                      Grafik CPL/LO Semester GANJIL 2024/2025
                    </h4>
                    <MenuIcon size={20} className="text-gray-400" />
                  </div>
                  <RadarChart 
                    data={radarDataSemester}
                    labels={radarDataSemester.map(d => d.subject)}
                    datasets={[
                      { dataKey: 'target', borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' },
                      { dataKey: 'prodi', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)' }
                    ]}
                  />
                  <div className="flex justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Target CPL/LO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>ILO Prodi Semester</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-800">
                      Grafik CPL/LO Semester GANJIL 2024/2025
                    </h4>
                    <div className="flex items-center space-x-2">
                      <MenuIcon size={20} className="text-gray-400" />
                      <button className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                  <BarChart 
                    data={barDataSemester}
                    dataKeys={['value']}
                    colors={['#3b82f6']}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200" rowSpan={2}>NO</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200" rowSpan={2}>KODE MK</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200" rowSpan={2}>NAMA MK</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200" rowSpan={2}>KELAS</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200" colSpan={8}>CPL/LO</th>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200">1</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200">2</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200">3</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200">4</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200">5</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200">6</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 border-r border-gray-200">7</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700">8</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classDetailData.map((row) => (
                        <tr key={row.no} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-sm text-gray-700 text-center border-r border-gray-100">{row.no}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 border-r border-gray-100">{row.code}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 border-r border-gray-100">{row.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 border-r border-gray-100">{row.class}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center border-r border-gray-100">{row.cpl1}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center border-r border-gray-100">-</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center border-r border-gray-100">-</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center border-r border-gray-100">-</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center border-r border-gray-100">-</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center border-r border-gray-100">{row.cpl6}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center border-r border-gray-100">{row.cpl7}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}