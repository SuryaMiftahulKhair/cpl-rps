// 'use client';

// import React, { useState, useEffect, useRef, use } from 'react';
// import { useRouter } from 'next/navigation';
// import { ChevronLeft, Menu as MenuIcon, Printer, X, RefreshCw, Loader2 } from 'lucide-react';
// import DashboardLayout from "@/app/components/DashboardLayout";

// // --- KOMPONEN CANVAS (DARI KODE ANDA - TIDAK DIUBAH) ---
// // Radar Chart Component
// const RadarChart: React.FC<{ data: any[]; labels: string[]; datasets: any[] }> = ({ data, labels, datasets }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const centerX = canvas.width / 2;
//     const centerY = canvas.height / 2;
//     const radius = Math.min(centerX, centerY) - 60;
//     const angleStep = (Math.PI * 2) / labels.length;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Grid circles
//     ctx.strokeStyle = '#e5e7eb';
//     ctx.lineWidth = 1;
//     for (let i = 1; i <= 5; i++) {
//       ctx.beginPath();
//       ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
//       ctx.stroke();
//     }

//     // Grid lines
//     labels.forEach((_, i) => {
//       const angle = angleStep * i - Math.PI / 2;
//       const x = centerX + Math.cos(angle) * radius;
//       const y = centerY + Math.sin(angle) * radius;
//       ctx.beginPath();
//       ctx.moveTo(centerX, centerY);
//       ctx.lineTo(x, y);
//       ctx.stroke();
//     });

//     // Labels
//     ctx.fillStyle = '#374151';
//     ctx.font = '12px sans-serif';
//     ctx.textAlign = 'center';
//     labels.forEach((label, i) => {
//       const angle = angleStep * i - Math.PI / 2;
//       const x = centerX + Math.cos(angle) * (radius + 30);
//       const y = centerY + Math.sin(angle) * (radius + 30);
//       ctx.fillText(label, x, y);
//     });

//     // Datasets
//     datasets.forEach((dataset) => {
//       ctx.strokeStyle = dataset.borderColor;
//       ctx.fillStyle = dataset.backgroundColor;
//       ctx.lineWidth = 2;
//       ctx.beginPath();
//       data.forEach((point, i) => {
//         const value = point[dataset.dataKey] || 0; // Handle null/undefined
//         const angle = angleStep * i - Math.PI / 2;
//         const r = (radius / 100) * Math.min(value, 100); // Cap at 100
//         const x = centerX + Math.cos(angle) * r;
//         const y = centerY + Math.sin(angle) * r;
//         if (i === 0) ctx.moveTo(x, y);
//         else ctx.lineTo(x, y);
//       });
//       ctx.closePath();
//       ctx.fill();
//       ctx.stroke();
//     });
//   }, [data, labels, datasets]);

//   return <canvas ref={canvasRef} width={400} height={400} className="mx-auto" />;
// };

// // Bar Chart Component (Kode Anda)
// const BarChart: React.FC<{ data: any[]; dataKeys: string[]; colors: string[] }> = ({ data, dataKeys, colors }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const padding = 50;
//     const chartWidth = canvas.width - padding * 2;
//     const chartHeight = canvas.height - padding * 2;
//     // Prevent division by zero/NaN if empty
//     const itemCount = data.length || 1; 
//     const barWidth = chartWidth / (itemCount * dataKeys.length + itemCount + 1);
//     const groupWidth = barWidth * dataKeys.length;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Axes
//     ctx.strokeStyle = '#e5e7eb';
//     ctx.lineWidth = 1;
//     ctx.beginPath();
//     ctx.moveTo(padding, padding);
//     ctx.lineTo(padding, canvas.height - padding);
//     ctx.lineTo(canvas.width - padding, canvas.height - padding);
//     ctx.stroke();

//     // Y Labels
//     ctx.fillStyle = '#6b7280';
//     ctx.font = '11px sans-serif';
//     ctx.textAlign = 'right';
//     for (let i = 0; i <= 5; i++) {
//       const y = canvas.height - padding - (chartHeight / 5) * i;
//       const value = (100 / 5) * i;
//       ctx.fillText(value.toString(), padding - 10, y + 4);
//       ctx.strokeStyle = '#f3f4f6';
//       ctx.beginPath();
//       ctx.moveTo(padding, y);
//       ctx.lineTo(canvas.width - padding, y);
//       ctx.stroke();
//     }

//     // Bars
//     data.forEach((item, i) => {
//       const groupX = padding + (i * (groupWidth + barWidth)) + barWidth;
      
//       dataKeys.forEach((key, j) => {
//         const value = item[key] || 0;
//         const barHeight = (chartHeight / 100) * value;
//         const x = groupX + (j * barWidth);
//         const y = canvas.height - padding - barHeight;

//         ctx.fillStyle = colors[j];
//         ctx.fillRect(x, y, barWidth - 4, barHeight);

//         ctx.fillStyle = '#1f2937';
//         ctx.font = 'bold 10px sans-serif';
//         ctx.textAlign = 'center';
//         ctx.fillText(value.toFixed(1), x + barWidth / 2 - 2, y - 5);
//       });

//       ctx.fillStyle = '#6b7280';
//       ctx.font = '11px sans-serif';
//       ctx.textAlign = 'center';
//       // Truncate long names
//       const displayName = item.name.length > 10 ? item.name.substring(0,8)+".." : item.name;
//       ctx.fillText(displayName, groupX + groupWidth / 2 - barWidth / 2, canvas.height - padding + 20);
//     });
//   }, [data, dataKeys, colors]);

//   return <canvas ref={canvasRef} width={600} height={350} className="mx-auto" />;
// };

// // --- MAIN PAGE ---

// export default function CPLProdiGrafikPage({ params }: { params: Promise<{ id: string }> }) {
//   const resolvedParams = use(params);
//   const router = useRouter();
//   const tahunAjaranId = resolvedParams.id;
  
//   const [loading, setLoading] = useState(true);
  
//   // Data dari API
//   const [radarData, setRadarData] = useState<any[]>([]);
//   const [courseList, setCourseList] = useState<any[]>([]);
  
//   // Data untuk Modal (Bar Chart per MK)
//   const [showModal, setShowModal] = useState(false);
//   const [selectedMK, setSelectedMK] = useState<any | null>(null);
//   const [barDataMK, setBarDataMK] = useState<any[]>([]);

//   // Fetch Data
//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/laporan/cpl-prodi/${tahunAjaranId}`);
//       const json = await res.json();
      
//       if (json.radarData) setRadarData(json.radarData);
//       if (json.courseData) setCourseList(json.courseData);
      
//     } catch (err) {
//       console.error('Load error:', err);
//       alert("Gagal memuat data grafik");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, [tahunAjaranId]);

//   // Handler Open Modal Detail MK
//   const handleOpenModal = (course: any) => {
//     setSelectedMK(course);
    
//     // Transform data scores { "ILO-1": 80 } menjadi Array untuk BarChart
//     // [{ name: "ILO-1", value: 80, target: 75 }]
//     const transformedBarData = Object.entries(course.scores || {}).map(([key, val]) => ({
//         name: key,
//         value: val,
//         target: 75 // Target statis
//     }));
    
//     setBarDataMK(transformedBarData);
//     setShowModal(true);
//   };

//   // Extract keys (CPL Codes) untuk Header Tabel secara dinamis
//   const cplKeys = radarData.map(r => r.subject); 

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex h-screen items-center justify-center">
//            <Loader2 className="animate-spin text-indigo-600" size={40}/>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="p-8 bg-gray-50 min-h-screen">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Grafik CPL Prodi</h1>
//             <p className="text-sm text-gray-500 mt-1">Analisis Pencapaian Pembelajaran</p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <button onClick={loadData} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg shadow hover:bg-sky-700">
//               <RefreshCw size={18} /> Refresh
//             </button>
//             <button onClick={() => router.back()} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600">
//               <ChevronLeft size={18} /> Kembali
//             </button>
//           </div>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           {/* Radar Chart */}
//           <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h4 className="text-base font-semibold text-gray-800">Grafik Capaian Lulusan (Prodi)</h4>
//               <MenuIcon size={20} className="text-gray-400" />
//             </div>
            
//             {radarData.length > 0 ? (
//                 <RadarChart 
//                   data={radarData}
//                   labels={radarData.map(d => d.subject)}
//                   datasets={[
//                     { dataKey: 'target', borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' }, // Merah
//                     { dataKey: 'prodi', borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' }  // Biru
//                   ]}
//                 />
//             ) : (
//                 <div className="h-[300px] flex items-center justify-center text-gray-400">Belum ada data nilai</div>
//             )}

//             <div className="flex justify-center gap-4 mt-4 text-xs">
//               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div><span>Target</span></div>
//               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span>Capaian Prodi</span></div>
//             </div>
//           </div>

//           {/* Statistik Ringkas (Optional Placeholder) */}
//           <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col justify-center items-center text-center">
//              <h3 className="text-xl font-bold text-gray-700 mb-2">Total Mata Kuliah Dinilai</h3>
//              <span className="text-5xl font-bold text-indigo-600 mb-4">{courseList.length}</span>
//              <p className="text-sm text-gray-500">Mata kuliah yang telah memiliki data nilai dan pemetaan CPL pada semester ini.</p>
//           </div>
//         </div>

//         {/* Data Table */}
//         <div className="bg-white rounded-xl shadow-xl mb-6">
//           <div className="border-b border-gray-200 px-6 py-4">
//             <h4 className="text-lg font-semibold text-gray-800">Detail Capaian Per Mata Kuliah</h4>
//           </div>

//           <div className="p-6 overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead className="bg-indigo-50">
//                 <tr>
//                   <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase border">KODE</th>
//                   <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase border">MATA KULIAH</th>
//                   <th className="py-3 px-4 text-left text-xs font-bold text-indigo-700 uppercase border">KELAS</th>
//                   {/* Dynamic CPL Headers */}
//                   {cplKeys.map(key => (
//                       <th key={key} className="py-3 px-2 text-center text-xs font-bold text-indigo-700 uppercase border">{key}</th>
//                   ))}
//                   <th className="py-3 px-4 text-center text-xs font-bold text-indigo-700 uppercase border">AKSI</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {courseList.length === 0 ? (
//                     <tr><td colSpan={4 + cplKeys.length} className="p-8 text-center text-gray-500">Tidak ada data mata kuliah.</td></tr>
//                 ) : (
//                     courseList.map((course) => (
//                     <tr key={course.id} className="border-b hover:bg-gray-50">
//                         <td className="py-3 px-4 text-sm font-medium text-gray-700 border">{course.code}</td>
//                         <td className="py-3 px-4 text-sm text-gray-700 border">{course.name}</td>
//                         <td className="py-3 px-4 text-sm text-gray-700 border">{course.class_name}</td>
                        
//                         {/* Dynamic CPL Scores */}
//                         {cplKeys.map(key => (
//                             <td key={key} className="py-3 px-2 text-center text-sm text-gray-700 border">
//                                 {course.scores[key] ? course.scores[key].toFixed(1) : "-"}
//                             </td>
//                         ))}

//                         <td className="py-3 px-4 text-center border">
//                         <button
//                             onClick={() => handleOpenModal(course)}
//                             className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
//                         >
//                             Detail
//                         </button>
//                         </td>
//                     </tr>
//                     ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Modal Detail MK */}
//       {showModal && selectedMK && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
//               <div>
//                   <h3 className="text-lg font-bold text-gray-800">{selectedMK.name}</h3>
//                   <p className="text-sm text-gray-500">{selectedMK.class_name}</p>
//               </div>
//               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
//             </div>

//             <div className="p-6">
//                 <div className="bg-white border rounded-xl p-4 shadow-sm">
//                     <h4 className="text-center font-semibold mb-4 text-gray-700">Grafik Capaian CPL Mata Kuliah</h4>
//                     {barDataMK.length > 0 ? (
//                         <BarChart 
//                             data={barDataMK}
//                             dataKeys={['value', 'target']}
//                             colors={['#3b82f6', '#ef4444']} // Biru (Nilai), Merah (Target)
//                         />
//                     ) : (
//                         <p className="text-center py-10 text-gray-400">Tidak ada data CPL yang dinilai pada MK ini.</p>
//                     )}
//                     <div className="flex justify-center gap-4 mt-4 text-xs">
//                         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span>Capaian Kelas</span></div>
//                         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div><span>Target</span></div>
//                     </div>
//                 </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </DashboardLayout>
//   );
// }