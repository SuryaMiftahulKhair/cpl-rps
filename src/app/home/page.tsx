import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="p-6">
          <h2 className="text-xl font-semibold mb-4">Home</h2>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2 ">APP-CPL</h3>
            <p className="text-gray-600 mb-4">
              Selamat datang pada Aplikasi Pengukuran CPL Program Studi pada Universitas Hasanuddin berbasis Kurikulum K-23.
            </p>
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
              Pastikan Semester pada Data Kelas telah disinkronkan sebelum melakukan meminta dosen menginput nilai.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
