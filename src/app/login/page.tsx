"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutPanelTop, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  ArrowLeft,
  Grid3x3,
  CheckCircle,
  Shield,
  Sparkles,
  LogIn
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // --- MENGHUBUNGI API LOGIN (BACKEND) ---
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // JIKA SUKSES (Status 200)
        console.log("Login sukses, mengalihkan...");
        router.push("/home"); // <--- INI PERINTAH PINDAHNYA
        router.refresh(); // Paksa refresh komponen
      } else {
        const errorData = await res.json().catch(() => ({ message: "Login gagal" }));
        setError(errorData.message || "Username atau password salah");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan pada server");
      setIsLoading(false);
    }
  }

  const handleBackToLanding = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Back to Landing Button - Top Left */}
      <button
        onClick={handleBackToLanding}
        className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white border-2 border-gray-200 hover:border-gray-300 transition-all font-semibold shadow-md hover:shadow-lg group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
        <span>Kembali</span>
      </button>

      {/* Main Login Card */}
      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side - Branding & Info */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-12 flex flex-col justify-between text-white overflow-hidden">
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Logo & Branding */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                {/* Logo Unhas */}
                <img 
                  src="/logo-unhas.png" 
                  alt="Logo Universitas Hasanuddin" 
                  className="w-16 h-16 object-contain drop-shadow-lg"
                />
                {/* App Icon */}
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Grid3x3 className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              
              <h1 className="text-4xl font-black mb-3 leading-tight">
                APP-CPL
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Universitas Hasanuddin
              </p>
              <p className="text-blue-200 text-base">
                Sistem Informasi Capaian Pembelajaran Lulusan
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-6">Platform Features</h3>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-white/30">
                  <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Pemetaan CPL Visual</h4>
                  <p className="text-sm text-blue-100">
                    Interface intuitif dengan color-coding untuk setiap CPL
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-white/30">
                  <Shield className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Data Terstruktur</h4>
                  <p className="text-sm text-blue-100">
                    Tracking komprehensif kelengkapan pemetaan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-white/30">
                  <Sparkles className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Real-time Update</h4>
                  <p className="text-sm text-blue-100">
                    Perubahan mapping tersimpan otomatis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div className="relative z-10">
            <p className="text-sm text-blue-100">
              © 2025 Universitas Hasanuddin. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-12 flex flex-col justify-center">
          
          {/* Form Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Selamat Datang
            </h2>
            <p className="text-gray-600 text-base">
              Masuk ke akun Anda untuk mengakses sistem
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Login Gagal</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                USERNAME
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan username"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-900 mb-2"
              >
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={20} strokeWidth={2.5} />
                  ) : (
                    <Eye size={20} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Ingat saya
                </span>
              </label>
              
              <button
                type="button"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Lupa password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500 font-medium">
                Atau
              </span>
            </div>
          </div>

          {/* Back to Landing Link */}
          <button
            onClick={handleBackToLanding}
            type="button"
            className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Halaman Utama</span>
          </button>

          {/* Help Text */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <button type="button" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Hubungi Administrator
            </button>
          </p>
        </div>

      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-sm text-gray-600">
          Developed with ❤️ for Academic Excellence
        </p>
      </div>

    </div>
  );
}