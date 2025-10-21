"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutPanelTop, User, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulasi loading
    setTimeout(() => {
      if (username === "admin" && password === "1234") {
        router.push("/home");
      } else {
        setError("Username atau Password salah!");
        setIsLoading(false);
      }
    }, 800);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo-unhas.png" 
                alt="Logo UNHAS" 
                className="h-20 w-20 object-contain"
              />
            </div>
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <LayoutPanelTop size={28} className="text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                APP-CPL
              </h1>
            </div>
            <p className="text-gray-600 font-medium">
              Universitas Hasanuddin
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Sistem Informasi Capaian Pembelajaran Lulusan
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  Silakan coba lagi dengan kredensial yang benar
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                USERNAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan Username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan Password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Lupa password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-800 mb-2">
              Demo Credentials:
            </p>
            <div className="space-y-1 text-xs text-blue-700">
              <p>• Username: <span className="font-mono font-semibold">admin</span></p>
              <p>• Password: <span className="font-mono font-semibold">1234</span></p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-8">
            © 2025 Universitas Hasanuddin. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-12 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white max-w-lg">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <LayoutPanelTop size={40} />
              </div>
              <div>
                <h2 className="text-4xl font-bold">APP-CPL</h2>
                <p className="text-indigo-200 text-sm">Learning Outcomes</p>
              </div>
            </div>
            <p className="text-xl font-semibold mb-4">
              Sistem Informasi Capaian Pembelajaran Lulusan
            </p>
            <p className="text-indigo-100 leading-relaxed">
              Platform terpadu untuk mengelola dan memantau capaian pembelajaran
              lulusan di lingkungan Universitas Hasanuddin.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Manajemen Kurikulum</h3>
                <p className="text-sm text-indigo-100">
                  Kelola visi, misi, dan target CPL dengan mudah
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Monitoring Real-time</h3>
                <p className="text-sm text-indigo-100">
                  Pantau perkembangan pembelajaran secara langsung
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Laporan Komprehensif</h3>
                <p className="text-sm text-indigo-100">
                  Generate laporan akreditasi dan evaluasi
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold mb-1">15+</div>
              <div className="text-sm text-indigo-100">Program Studi</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-sm text-indigo-100">Mata Kuliah</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">2K+</div>
              <div className="text-sm text-indigo-100">Mahasiswa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
