"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function ImportMahasiswaPage() {
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { NIM: "D12121001", Nama: "Contoh Nama 1" },
      { NIM: "D12121002", Nama: "Contoh Nama 2" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Mahasiswa.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      setDataPreview(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmitImport = async () => {
    if (!confirm(`Yakin ingin mengimport ${dataPreview.length} data mahasiswa?`)) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/mahasiswa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataMahasiswa: dataPreview }),
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Gagal import");
      
      alert(json.message);
      setDataPreview([]); // Reset preview
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <Link href="/referensi/mahasiswa" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft size={20} /> Kembali ke Data Mahasiswa
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Data Mahasiswa</h1>
          <p className="text-gray-500 mb-8">Upload file Excel (.xlsx) berisi data mahasiswa baru. Pastikan format sesuai template.</p>

          <div className="flex justify-center gap-4 mb-8">
            <button onClick={handleDownloadTemplate} className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 flex items-center gap-2">
              <Download size={18} /> Download Template
            </button>
            <div className="relative">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200">
                <Upload size={18} /> Pilih File Excel
              </button>
            </div>
          </div>

         
          {dataPreview.length > 0 && (
            <div className="mt-8 text-left">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Preview Data ({dataPreview.length} baris)</h3>
                <button onClick={handleSubmitImport} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-md flex items-center gap-2">
                   {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />} Proses Import
                </button>
              </div>
              <div className="border rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3 border-b">NIM</th>
                      <th className="p-3 border-b">Nama</th>
    
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-mono text-gray-500">{row.NIM || row.nim}</td>
                        <td className="p-3 text-gray-500">{row.Nama || row.nama}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dataPreview.length > 10 && <div className="p-3 text-center text-gray-500 text-xs bg-gray-50">... dan {dataPreview.length - 10} baris lainnya</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}