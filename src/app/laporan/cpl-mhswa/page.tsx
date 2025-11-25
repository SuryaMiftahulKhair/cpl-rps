'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Printer } from 'lucide-react';
import DashboardLayout from "@/app/components/DashboardLayout";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Type definitions
interface Student {
  id: number;
  nim: string;
  name: string;
  angkatan: string;
}

interface CPL {
  code: string;
  description: string;
  descriptionEn: string;
}

interface StudentCPL {
  code: string;
  cplLo: string;
  nilai: number;
  description: string;
  descriptionEn: string;
}

// Data CPL Kurikulum
const cplData: CPL[] = [
  {
    code: 'CPL-1',
    description: 'Memiliki dasar pengetahuan Teknik Informatika yang meliputi teori dan konsep dasar dari Ilmu Komputer, Matematika dan Statistika, Algoritma dan Pemrograman, Rekayasa Perangkat Lunak, Manajemen Informasi dan Ketahanan Digital, serta pengetahuan tingkat lanjut pada bidang-bidang khusus Teknik Informatika, seperti Kecerdasan Buatan, Data Science, Jaringan Komputer, Komputasi Awan dan Internet of Things.',
    descriptionEn: 'Have the knowledge of fundamental in Computing Science that includes basic theory and concepts of computer science, Mathematics and Statistics, Programming Algorithm, Software Engineering, Information Management and Digital Resilience, also the advance topics of either Artificial Intelligence, Data Science, Computer Network, Cloud Computing or Internet of Things.'
  },
  {
    code: 'CPL-2',
    description: 'Memiliki pengetahuan dasar kewirausahaan, pengetahuan terhadap dasar-dasar pemanfaatan teknologi serta pengetahuan terhadap pembangunan sistem berbasis web.',
    descriptionEn: 'Have the knowledge of basic entrepreneurship, full technology stack and web development.'
  },
  {
    code: 'CPL-3',
    description: 'Mampu mengaplikasikan pengetahuan bidang Teknik Informatika yang dipadankan dengan bidang ilmu lainnya untuk menganalisa dan mencari solusi dari berbagai masalah berbasis komputasi.',
    descriptionEn: 'Apply the knowledge of computing and other related disciplines to analyse and identify solutions for any computing-based problem.'
  },
  {
    code: 'CPL-4',
    description: 'Mampu mendesain, mengimplementasikan dan mengevaluasi solusi berbasis komputasi dengan mengaplikasikan ilmu Teknik Informatika dan dasar-dasar pembangunan perangkat lunak.',
    descriptionEn: 'Design, implement and evaluate computing solution by applying the knowledge of Computing and basic software development.'
  },
  {
    code: 'CPL-5',
    description: 'Mampu menyelesaikan tugas-tugas dalam tanggung jawab profesi dengan menegakkan prinsip-prinsip hukum dan etika.',
    descriptionEn: 'Accomplish the professional responsibility by upholding the law and ethical principles.'
  },
  {
    code: 'CPL-6',
    description: 'Mampu bekerja secara efektif dalam tim, baik sebagai pimpinan atau anggota, pada berbagai kegiatan yang berhubungan dengan tanggung jawab profesional.',
    descriptionEn: 'Work effectively in team, as a leader or a member, in various activities related to professional responsibility.'
  }
];

// Data mahasiswa sample
const studentsData: Student[] = [
  { id: 1, nim: 'D121181507', name: 'ANDI ENDANG ADININSI', angkatan: '2018' },
  { id: 2, nim: 'D121201013', name: 'DIETRICH BITE\' LEBANG', angkatan: '2020' },
  { id: 3, nim: 'D121201025', name: 'GABRIEL DYLAN VALENTINO', angkatan: '2020' },
  { id: 4, nim: 'D121201069', name: 'MARSELINUS JEFFRY PARAMMA', angkatan: '2020' },
  { id: 5, nim: 'D121201087', name: 'MUH. BINTANG ISLAMI M.O', angkatan: '2020' },
  { id: 6, nim: 'D121211001', name: 'ARDRIA AULIYA', angkatan: '2021' },
  { id: 7, nim: 'D121211002', name: 'NURUNNISA FATHANAH DZ.S.B.', angkatan: '2021' },
  { id: 8, nim: 'D121211003', name: 'MUTHIA ANASHYA SALAM', angkatan: '2021' },
  { id: 9, nim: 'D121211004', name: 'NURFADILLAH', angkatan: '2021' },
  { id: 10, nim: 'D121211005', name: 'AUDY FEBRYANTI', angkatan: '2021' }
];

// Generate sample CPL values for a student
const generateStudentCPL = (studentId: number): StudentCPL[] => {
  const baseValues = [0, 63.75, 0, 0, 0, 0];
  
  return cplData.map((cpl, index) => ({
    code: cpl.code,
    cplLo: `CPL/LO ${index + 1}`,
    nilai: baseValues[index] || 0,
    description: cpl.description,
    descriptionEn: cpl.descriptionEn
  }));
};

export default function CPLMahasiswaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchNim, setSearchNim] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentCPLData, setStudentCPLData] = useState<StudentCPL[]>([]);
  const [activeTab, setActiveTab] = useState<'radar' | 'bar'>('radar');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchNim, searchName, students]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulasi fetch data - nanti bisa diganti dengan API call
      setTimeout(() => {
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Load data error:', err);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;
    
    if (searchNim) {
      filtered = filtered.filter(s => 
        s.nim.toLowerCase().includes(searchNim.toLowerCase())
      );
    }
    
    if (searchName) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    setFilteredStudents(filtered);
  };

  const handleOpenCPL = (student: Student) => {
    setSelectedStudent(student);
    setStudentCPLData(generateStudentCPL(student.id));
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setStudentCPLData([]);
    setActiveTab('radar');
  };

  const handlePrint = () => {
    window.print();
  };

  // Prepare data for radar chart
  const radarData = studentCPLData.map(item => ({
    subject: item.code,
    value: item.nilai,
    fullMark: 100
  }));

  // Prepare data for bar chart
  const barData = studentCPLData.map(item => ({
    name: item.code,
    nilai: item.nilai
  }));

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">CPL Mahasiswa</h1>
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-sky-700"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-700">Data</h2>
            </div>

            <div className="p-6">
              {/* Search Filters */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="NIM"
                  value={searchNim}
                  onChange={(e) => setSearchNim(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Nama"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-gray-500 mt-3">Memuat data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">NIM</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">NAMA</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-indigo-50/50 transition">
                          <td className="py-3 px-4 text-sm text-gray-700">{index + 1}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{student.nim}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{student.name}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenCPL(student)}
                              className="px-6 py-1.5 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition"
                            >
                              CPL
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - CPL List */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6 sticky top-0 bg-white border-b border-gray-200">
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <option>CPL Kurikulum Sarjana K-23</option>
            </select>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600 mb-4 pb-2 border-b border-gray-200">
              <div>KODE</div>
              <div>KETERANGAN</div>
            </div>

            {cplData.map((cpl) => (
              <div key={cpl.code} className="border-b border-gray-100 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold text-gray-700">{cpl.code}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{cpl.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Data</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-24">NIM</span>
                    <span className="font-medium">{selectedStudent.nim}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">Nama</span>
                    <span className="font-medium">{selectedStudent.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">Angkatan</span>
                    <span className="font-medium">{selectedStudent.angkatan}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Printer size={20} />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6 bg-white">
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'radar'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Grafik Radar
              </button>
              <button
                onClick={() => setActiveTab('bar')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'bar'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Grafik Batang
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Chart Content */}
              <div className="mb-8">
                {activeTab === 'radar' ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                        />
                        <Radar
                          name="CPL"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar dataKey="nilai" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* CPL Details Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">KODE</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">CPL/LO</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">NILAI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentCPLData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-4 text-sm font-medium text-gray-700 align-top">
                          {item.code}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">{item.cplLo}</div>
                          <div className="text-xs text-gray-600 mb-2 leading-relaxed">{item.description}</div>
                          <div className="text-xs text-gray-500 italic leading-relaxed">{item.descriptionEn}</div>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-right text-gray-700 align-top">
                          {item.nilai.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}