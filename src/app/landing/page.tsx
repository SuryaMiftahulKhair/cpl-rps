// ============================================================
// STANDALONE LANDING PAGE - Main Website Face
// File: app/page.tsx (or app/landing/page.tsx)
// No sidebar, no header - pure landing page
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Grid3x3, Loader2, AlertCircle, RefreshCw, 
  Layers, Target, CheckCircle, BookOpen,
  ArrowRight, TrendingUp, LogIn, User, Lock,
  Sparkles, Zap, Shield
} from "lucide-react";
import MatriksCPLTable from "@/app/components/MatriksCPLTable";

export default function LandingPage() {
  const router = useRouter();
  
  // State untuk kurikulum
  const [kurikulumList, setKurikulumList] = useState<any[]>([]);
  const [selectedKurikulum, setSelectedKurikulum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  
  // Default prodiId for demo/public view
  const prodiId = 1;

  // Stats state
  const [stats, setStats] = useState({
    totalMK: 0,
    totalCPL: 0,
    totalIK: 0,
    totalMapping: 0
  });

  const fetchKurikulum = async () => {
    setLoading(true);
    setError(null);
    setDemoMode(false);
    
    try {
      const res = await fetch(`/api/kurikulum?prodiId=${prodiId}`, {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        // Get error details from response
        let errorMessage = `Server error: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      
      if (data.success && data.data?.length > 0) {
        setKurikulumList(data.data);
        setSelectedKurikulum(data.data[0].id);
      } else {
        setKurikulumList([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch kurikulum:', err);
      setError(err.message || 'Gagal mengambil data kurikulum');
      // Set empty list on error
      setKurikulumList([]);
    } finally {
      setLoading(false);
    }
  };

  const enableDemoMode = () => {
    setDemoMode(true);
    setError(null);
    // Set demo data
    const demoKurikulum = [
      { 
        id: 999, 
        nama: 'Kurikulum Demo 2024', 
        tahun: '2024',
        isDemoData: true 
      }
    ];
    setKurikulumList(demoKurikulum);
    setSelectedKurikulum(999);
    setLoading(false);
  };

  useEffect(() => {
    fetchKurikulum();
  }, []);

  const fetchStats = async () => {
    if (!selectedKurikulum) return;
    
    try {
      const [cplRes, mkRes] = await Promise.all([
        fetch(`/api/kurikulum/${selectedKurikulum}/VMCPL?prodiId=${prodiId}`, { cache: "no-store" }),
        fetch(`/api/kurikulum/${selectedKurikulum}/matakuliah?prodiId=${prodiId}`, { cache: "no-store" })
      ]);
      
      if (cplRes.ok && mkRes.ok) {
        const cplData = await cplRes.json();
        const mkData = await mkRes.json();
        
        const totalCPL = cplData.data?.cpl?.length || 0;
        let totalIK = 0;
        cplData.data?.cpl?.forEach((cpl: any) => {
          totalIK += cpl.iks?.length || 0;
        });
        
        const totalMK = mkData.data?.length || 0;
        let totalMapping = 0;
        mkData.data?.forEach((mk: any) => {
          const ikList = mk.indikator_kinerja || mk.iks || [];
          totalMapping += ikList.length;
        });
        
        setStats({
          totalMK,
          totalCPL,
          totalIK,
          totalMapping
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    if (selectedKurikulum) {
      fetchStats();
    }
  }, [selectedKurikulum]);

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* FLOATING LOGIN BUTTON */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
        >
          <LogIn size={20} strokeWidth={2.5} />
          <span>Masuk</span>
        </button>
      </div>

      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-white">

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          
          {/* University Branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Logo Unhas */}
              <div className="relative">
                <img 
                  src="/logo-unhas.png" 
                  alt="Logo Universitas Hasanuddin" 
                  className="relative w-24 h-24 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
                />
              </div>
              {/* Divider */}
              <div className="hidden sm:block w-px h-20 bg-gray-200"></div>
              {/* App Icon */}
              <div className="relative">
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Grid3x3 className="w-10 h-10 lg:w-12 lg:h-12 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            
            {/* University Name */}
            <div className="mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Universitas Hasanuddin
              </h2>
              <p className="text-base lg:text-lg font-semibold text-indigo-600">
                Program Studi Teknik Informatika
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-px w-12 bg-indigo-200"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div className="h-px w-12 bg-indigo-200"></div>
              </div>
            </div>
          </div>

          {/* Logo/Brand - Now System Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
              Sistem Matriks CPL
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 font-medium max-w-3xl mx-auto">
              Platform pemetaan <span className="text-indigo-600 font-bold">Capaian Pembelajaran Lulusan (CPL)</span> terhadap Mata Kuliah secara visual dan interaktif
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Visual & Intuitif</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Interface modern dengan color-coding untuk setiap CPL, memudahkan identifikasi dan navigasi</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Real-time Update</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Perubahan mapping tersimpan otomatis dengan feedback visual yang jelas</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Terstruktur & Akurat</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Sistem tracking yang komprehensif untuk memastikan kelengkapan pemetaan CPL</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">

        {/* SUMMARY CARDS */}
        {!loading && selectedKurikulum && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Layers className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mata Kuliah</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMK}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Target className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total CPL</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCPL}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <CheckCircle className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total IK</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalIK}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Mapping</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMapping}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ERROR DISPLAY */}
        {error && !demoMode && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-base font-bold text-red-900 mb-1">Terjadi Kesalahan</h4>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <p className="text-xs text-red-600">
                  API endpoint mungkin belum tersedia atau terjadi masalah pada server.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchKurikulum}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm shadow-sm"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
              <button
                onClick={enableDemoMode}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm shadow-sm"
              >
                <Sparkles size={16} />
                Mode Demo
              </button>
            </div>
          </div>
        )}

        {/* DEMO MODE NOTICE */}
        {demoMode && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-base font-bold text-blue-900 mb-1">Mode Demo Aktif</h4>
              <p className="text-sm text-blue-700">
                Anda sedang melihat data demo. Untuk mengakses data sebenarnya, silakan periksa koneksi API atau login ke sistem.
              </p>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-20">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={56} strokeWidth={2.5} />
              <p className="text-lg text-gray-700 font-semibold">Memuat data kurikulum...</p>
            </div>
          </div>
        )}

        {/* KURIKULUM SELECTOR */}
        {!loading && !error && kurikulumList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                  <BookOpen className="w-7 h-7 text-indigo-600" strokeWidth={2.5} />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-1">
                    Pilih Kurikulum
                  </label>
                  <p className="text-sm text-gray-600">Lihat matriks pemetaan CPL untuk kurikulum yang dipilih</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={selectedKurikulum || ''}
                  onChange={(e) => setSelectedKurikulum(Number(e.target.value))}
                  className="px-6 py-3.5 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-900 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white shadow-sm min-w-[320px]"
                >
                  {kurikulumList.map(k => (
                    <option key={k.id} value={k.id} className="text-gray-900 font-semibold">
                      {k.nama} ({k.tahun})
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={fetchKurikulum}
                  className="inline-flex items-center gap-2 px-4 py-3.5 bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold shadow-sm"
                  title="Refresh data"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MATRIKS CPL TABLE */}
        {!loading && !error && selectedKurikulum ? (
          <div className="space-y-8">
            <MatriksCPLTable 
              kurikulumId={selectedKurikulum}
              prodiId={prodiId}
              compactMode={false}
              maxHeight="max-h-[600px]"
              showControls={true}
              onMappingChange={() => {
                fetchStats();
              }}
            />

            {/* TIPS SECTION */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-3xl">💡</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-blue-900 mb-5">Cara Menggunakan Sistem</h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    <ul className="space-y-3 text-sm text-blue-800">
                      <li className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>Setiap CPL memiliki <strong>warna berbeda</strong> untuk memudahkan identifikasi visual dan navigasi</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>Gunakan tombol <strong>collapse/expand (▼/▶)</strong> untuk fokus pada CPL tertentu</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span><strong>Klik sel</strong> untuk menambah atau menghapus mapping IK ke mata kuliah</span>
                      </li>
                    </ul>
                    <ul className="space-y-3 text-sm text-blue-800">
                      <li className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>Status sel: <strong>Putih</strong> (belum mapped), <strong>Berwarna</strong> (sudah mapped), <strong>Kuning</strong> (sedang menyimpan)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>Hover pada header IK untuk melihat <strong>deskripsi lengkap</strong> indikator kinerja</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>Gunakan mode <strong>Fullscreen</strong> untuk pengalaman viewing yang lebih optimal</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA FOR LOGIN */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-10 shadow-2xl text-center">
              <h3 className="text-3xl font-bold text-white mb-3">
                Ingin Akses Penuh?
              </h3>
              <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
                Login untuk mengelola kurikulum, menambah mata kuliah, dan melakukan pemetaan CPL secara lengkap
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <LogIn size={24} strokeWidth={2.5} />
                <span>Masuk ke Sistem</span>
              </button>
            </div>
          </div>
        ) : !loading && !error && kurikulumList.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-20">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mb-8">
                <AlertCircle className="w-14 h-14 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Belum Ada Data Kurikulum
              </h3>
              <p className="text-lg text-gray-500 mb-8 max-w-md">
                Sistem belum memiliki data kurikulum untuk ditampilkan. Silakan login untuk mengelola kurikulum.
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-bold text-lg shadow-xl hover:shadow-2xl"
              >
                <LogIn size={24} />
                <span>Masuk ke Sistem</span>
              </button>
            </div>
          </div>
        ) : null}

      </div>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-gray-900 to-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Left: University Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo-unhas.png" 
                  alt="Logo Universitas Hasanuddin" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <p className="font-bold text-base">Universitas Hasanuddin</p>
                  <p className="text-xs text-gray-400">Teknik Informatika</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Jl. Perintis Kemerdekaan KM.10<br />
                Tamalanrea, Makassar<br />
                Sulawesi Selatan 90245
              </p>
            </div>

            {/* Middle: System Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Grid3x3 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-bold text-base">Sistem Matriks CPL</p>
                  <p className="text-xs text-gray-400">Pemetaan Capaian Pembelajaran</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Platform digital untuk manajemen dan pemetaan Capaian Pembelajaran Lulusan (CPL) terhadap Mata Kuliah.
              </p>
            </div>

            {/* Right: Quick Links */}
            <div>
              <h4 className="font-bold text-base mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/login" className="hover:text-white transition-colors">
                    Login
                  </a>
                </li>
                <li>
                  <a href="https://informatika.unhas.ac.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Website Prodi
                  </a>
                </li>
                <li>
                  <a href="https://unhas.ac.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Website Unhas
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom: Copyright */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>
                © 2024 Universitas Hasanuddin - Program Studi Teknik Informatika. All rights reserved.
              </p>
              <p className="text-xs">
                Developed with ❤️ for Academic Excellence
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}