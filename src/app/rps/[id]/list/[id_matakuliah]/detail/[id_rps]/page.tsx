"use client";

import { useState, use } from "react";
import Link from "next/link";
import { 
    ChevronLeft, 
    Edit, 
    FileText, 
    BookOpen,
    Users,
    Target,
    BookMarked,
    GraduationCap,
    ClipboardList
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

// --- Types ---
interface PageParams {
    id: string; // kurikulum ID
    id_matakuliah: string;
    id_rps: string;
}

// --- Data Placeholder ---
const rpsDetailData = {
    matakuliah: {
        nama: "Pengantar Teknologi Informasi",
        namaInggris: "(Information Technology Foundations)",
        kode: "23D12110102",
        rumpunMK: "Informatika",
        bobot: 2,
        semester: 1,
        tanggalPenyusunan: "None"
    },
    otorisasi: {
        timPengembangRPS: "Tim Pengembang RPS",
        koordinatorMK: "Koordinator MK",
        ketuaProgramStudi: "Ketua Program Studi"
    },
    cplProdi: [
        {
            kode: "CPL-1",
            deskripsi: "Memiliki dasar pengetahuan Teknik Informatika yang meliputi teori dan konsep dasar dari Ilmu Komputer, Matematika dan Statistika, Algoritma dan Pemrograman, Rekayasa Perangkat Lunak, Manajemen Informasi dan Ketahanan Digital, serta pengetahuan tingkat lanjut pada bidang-bidang khusus Teknik Informatika, seperti Kecerdasan Buatan, Data Science, Jaringan Komputer, Komputasi Awan dan Internet of Things."
        },
        {
            kode: "CPL-6",
            deskripsi: "Mampu bekerja secara efektif dalam tim, baik sebagai pimpinan atau anggota, pada berbagai kegiatan yang berhubungan dengan tanggung jawab profesional."
        },
        {
            kode: "CPL-7",
            deskripsi: "Mampu melakukan prosedur logis dan sistematis untuk menyelesaikan suatu masalah dan selanjutnya mengkomunikasikan ide secara meyakinkan dan efektif baik secara lisan maupun tulisan untuk menawarkan suatu solusi."
        }
    ],
    cplToCpmk: [
        { cpl: "CPL-1", cpmk: "CPMK-1", deskripsi: "Mahasiswa mampu mengkarakteristikkan data dan informasi" },
        { cpl: "CPL-6", cpmk: "CPMK-2", deskripsi: "Mahasiswa mampu bekerja sama dalam menganalisis penggunaan IT dan dampaknya" },
        { cpl: "CPL-7", cpmk: "CPMK-3", deskripsi: "Mahasiswa mampu mempresentasikan implementasi dari konsep IT" }
    ],
    cpmkToSubCpmk: [
        {
            cpmk: "CPMK-1",
            subCpmk: "SUB-CPMK-1",
            deskripsi: "Mahasiswa mampu mengklasifikasikan jenis data dan mengimplementasikan informasi serta konsep basis data"
        },
        {
            cpmk: "CPMK-2",
            subCpmk: "SUB-CPMK-2",
            deskripsi: "Mahasiswa mampu bekerja sama dalam mengidentifikasi dasar sistem operasi dan etika penggunaan IT dan dampaknya"
        },
        {
            cpmk: "CPMK-3",
            subCpmk: "SUB-CPMK-3",
            deskripsi: "Mahasiswa mampu mempresentasikan konsep hardware and software, sistem numerik dan kode ASCII, syntax sederhana dengan Bahasa Pemrograman, konsep jaringan komputer, kecerdasan buatan, Internet of Things, Big Data dan Cloud Computing."
        }
    ],
    deskripsiMatakuliah: "Mata kuliah Pengantar Teknologi Informasi membahas tentang teori dasar dari teknologi informasi yang meliputi informasi terkait data dan pengolahan informasi, bahasa pemrograman, perangkat lunak dan keras, sistem operasi dan jaringan komputer, aplikasi perangkat lunak sehari-hari, serta dampak dan etika penggunaan IT. Mata kuliah ini disajikan untuk mahasiswa semester satu dan Laboratorium Komputer menjadi penanggungjawab Mata Kuliah ini. Metode Pembelajaran bauran, teori dan praktik.",
    materiPembelajaran: [
        "Data dan Informasi",
        "Sistem Komputerisasi, Perangkat Keras dan Lunak",
        "Sistem bilangan dan kode ASCII",
        "Bahasa Pemrograman",
        "Pengantar Basis Data",
        "Sistem Operasi",
        "Jaringan Komputer",
        "Perangkat Lunak Aplikasi di berbagai kepentingan",
        "Pemanfaatan IT di berbagai bidang",
        "Etika Pemanfaatan IT dan dampaknya",
        "Pengenalan Big Data, AI, dan IOT"
    ],
    referensiUtama: [
        'V. Rajaraman, "Introduction to Information Technology (second edition)", Eleventh Printing, 2013'
    ],
    referensiPendukung: [
        'David Bainbridge, "Introduction to Information Technology Law", Trans Atlantic Publication, 2007',
        'Brian K. Williams; Stacey C. Sawyer, "Using information technology : a practical introduction to computers & communications", 2015',
        'Indrabayu, I., Zainuddin, Z., Nurtanio, I., Ilham, A., Niswar, M., Adnan, A., Warni, E., Tahir, Z., Pauudu, A., Yohanes, C., Yusuf, M., A., Bustamin, A., Aswad, I., Oemar, M. A., Areni, I., Muslimin, Z., Putri, R., & Damilasari, A. (2022). Strategi Pembelajaran Menggunakan Metaverse Bagi Guru Di Madrasah Aliyah Al Hidayah. JURNAL EPAI eknologi erapan ntuk engabdian asyarakat, 5(2), 254-262. https://doi.org/10.25042/jurnal_tepat.v5i2.287'
    ],
    timPengajaran: [
        "Prof. Dr. Ir. Indrabayu, S.T., M.T., M.Bus.Sys., IPM., ASEAN.Eng.",
        "Anugrayani Bustamin, S.T., M.T."
    ],
    matakuliahSyarat: [],
    penilaian: [
        {
            pertemuan: 1,
            subCpmk: "SUB-CPMK-1",
            indikator: "Mahasiswa mampu mengklasifikasikan jenis data dan mengimplementasikan informasi serta konsep basis data (CPMK-1)",
            kriteria: {
                formatif: "Mendefinisikan data dan informasi",
                sumatif: "Tugas (5) dinilai dengan rubrik"
            },
            bentukPembelajaran: "Kuliah: Metode lainnya",
            luringOffline: "TM : 2 x 50 menit",
            daringOnline: "+",
            materiPembelajaran: [
                "Data dan Informasi",
                "Klasifikasi tipe data yang dapat diolah di komputer",
                "Mendeskripsikan bagaimana data diolah"
            ],
            bobotPenilaian: 5
        }
    ]
};

// --- Sub Components ---
interface SectionHeaderProps {
    title: string;
    icon?: React.ReactNode;
    onEdit?: () => void;
}

function SectionHeader({ title, icon, onEdit }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between bg-slate-600 text-white px-4 py-3 rounded-t-lg">
            <h3 className="font-bold text-sm flex items-center gap-2">
                {icon}
                {title}
            </h3>
            {onEdit && (
                <button 
                    onClick={onEdit}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    title="Edit"
                >
                    <Edit size={16} />
                </button>
            )}
        </div>
    );
}

interface InfoRowProps {
    label: string;
    value: string | number | React.ReactNode;
    labelClassName?: string;
}

function InfoRow({ label, value, labelClassName = "" }: InfoRowProps) {
    return (
        <div className="flex py-2 border-b border-gray-100 last:border-0">
            <div className={`w-1/3 font-semibold text-gray-700 text-sm ${labelClassName}`}>
                {label}
            </div>
            <div className="w-2/3 text-gray-800 text-sm">
                {value}
            </div>
        </div>
    );
}

// --- Main Component ---
export default function DetailRPSPage({ 
    params 
}: { 
    params: Promise<PageParams>
}) {
    // Unwrap params Promise using React.use()
    const { id, id_matakuliah, id_rps } = use(params);
    
    const [activeTab, setActiveTab] = useState<"pertemuan" | "evaluasi">("pertemuan");

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <FileText size={28} className="text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                                RPS Matakuliah
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Detail Rencana Pembelajaran Semester
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow">
                            Kembali
                        </button>
                        <button className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow">
                            Manual
                        </button>
                        <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow">
                            PDF
                        </button>
                        <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors shadow">
                            PDF Eng
                        </button>
                    </div>
                </div>

                {/* Main Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                        {/* Left Column */}
                        <div className="space-y-3">
                            <InfoRow 
                                label="MATA KULIAH" 
                                value={
                                    <div>
                                        <div className="font-semibold">{rpsDetailData.matakuliah.nama}</div>
                                        <div className="text-gray-500 text-xs">{rpsDetailData.matakuliah.namaInggris}</div>
                                    </div>
                                }
                            />
                            <InfoRow label="KODE" value={rpsDetailData.matakuliah.kode} />
                            <InfoRow label="RUMPUN MK" value={rpsDetailData.matakuliah.rumpunMK} />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                            <InfoRow label="BOBOT (SKS)" value={rpsDetailData.matakuliah.bobot} />
                            <InfoRow label="SEMESTER" value={rpsDetailData.matakuliah.semester} />
                            <InfoRow label="TANGGAL PENYUSUNAN" value={rpsDetailData.matakuliah.tanggalPenyusunan} />
                        </div>
                    </div>
                </div>

                {/* Otorisasi Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Otorisasi" onEdit={() => {}} />
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">{rpsDetailData.otorisasi.timPengembangRPS}</div>
                            <button className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
                                <Edit size={16} className="mx-auto" />
                            </button>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">{rpsDetailData.otorisasi.koordinatorMK}</div>
                            <button className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
                                <Edit size={16} className="mx-auto" />
                            </button>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">{rpsDetailData.otorisasi.ketuaProgramStudi}</div>
                            <button className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
                                <Edit size={16} className="mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* CPL-PRODI Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader 
                        title="CPL-PRODI yang dibebankan pada MK" 
                        icon={<Target size={18} />}
                        onEdit={() => {}} 
                    />
                    <div className="p-6">
                        {rpsDetailData.cplProdi.map((item, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                                <div className="flex gap-3">
                                    <div className="font-bold text-indigo-600 min-w-[60px]">{item.kode}</div>
                                    <div className="text-gray-700 text-sm leading-relaxed">{item.deskripsi}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CPL to CPMK Mapping */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader 
                        title="CPL → Capaian Pembelajaran Mata Kuliah (CPMK)" 
                        icon={<BookOpen size={18} />}
                        onEdit={() => {}} 
                    />
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">CPL-I</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">CPMK-1</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Deskripsi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rpsDetailData.cplToCpmk.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100">
                                            <td className="px-4 py-3 font-semibold text-indigo-600">{item.cpl}</td>
                                            <td className="px-4 py-3 font-semibold text-green-600">{item.cpmk}</td>
                                            <td className="px-4 py-3 text-gray-700">{item.deskripsi}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* CPMK to Sub-CPMK Mapping */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader 
                        title="CPMK → SUB-CPMK" 
                        icon={<BookMarked size={18} />}
                        onEdit={() => {}} 
                    />
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">CPMK-I</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">SUB-CPMK-1</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Deskripsi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rpsDetailData.cpmkToSubCpmk.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100">
                                            <td className="px-4 py-3 font-semibold text-green-600">{item.cpmk}</td>
                                            <td className="px-4 py-3 font-semibold text-purple-600">{item.subCpmk}</td>
                                            <td className="px-4 py-3 text-gray-700">{item.deskripsi}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Deskripsi Matakuliah */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader 
                        title="Deskripsi Matakuliah (Course Descriptions)" 
                        onEdit={() => {}} 
                    />
                    <div className="p-6">
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {rpsDetailData.deskripsiMatakuliah}
                        </p>
                    </div>
                </div>

                {/* Materi Pembelajaran */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader 
                        title="Materi Pembelajaran / Pokok Bahasan (Contents)" 
                        icon={<BookOpen size={18} />}
                        onEdit={() => {}} 
                    />
                    <div className="p-6">
                        <ol className="list-decimal list-inside space-y-2">
                            {rpsDetailData.materiPembelajaran.map((materi, index) => (
                                <li key={index} className="text-gray-700 text-sm">{materi}</li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Referensi Utama */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Referensi Utama:" onEdit={() => {}} />
                    <div className="p-6">
                        <ol className="list-decimal list-inside space-y-2">
                            {rpsDetailData.referensiUtama.map((ref, index) => (
                                <li key={index} className="text-gray-700 text-sm">{ref}</li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Referensi Pendukung */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Pendukung:" onEdit={() => {}} />
                    <div className="p-6">
                        <ol className="list-decimal list-inside space-y-2">
                            {rpsDetailData.referensiPendukung.map((ref, index) => (
                                <li key={index} className="text-gray-700 text-sm">{ref}</li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Pustaka */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader title="Pustaka" onEdit={() => {}} />
                    <div className="p-6">
                        <p className="text-gray-500 text-sm italic">Tidak ada data pustaka tambahan</p>
                    </div>
                </div>

                {/* Tim Pengajaran */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader 
                        title="Tim Pengajaran (Lectures)" 
                        icon={<Users size={18} />}
                        onEdit={() => {}} 
                    />
                    <div className="p-6">
                        <p className="text-gray-700 text-sm">
                            {rpsDetailData.timPengajaran.join(", ")}
                        </p>
                    </div>
                </div>

                {/* Mata Kuliah Syarat */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader 
                        title="Mata kuliah syarat (Recommended prerequisites)" 
                        icon={<GraduationCap size={18} />}
                        onEdit={() => {}} 
                    />
                    <div className="p-6">
                        <p className="text-gray-500 text-sm italic">Tidak ada mata kuliah prasyarat</p>
                    </div>
                </div>

                {/* Penilaian Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <SectionHeader 
                        title="Penilaian" 
                        icon={<ClipboardList size={18} />}
                    />
                    
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("pertemuan")}
                            className={`px-6 py-3 text-sm font-semibold transition-colors ${
                                activeTab === "pertemuan"
                                    ? "bg-indigo-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            +Pertemuan
                        </button>
                        <button
                            onClick={() => setActiveTab("evaluasi")}
                            className={`px-6 py-3 text-sm font-semibold transition-colors ${
                                activeTab === "evaluasi"
                                    ? "bg-indigo-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            +Evaluasi
                        </button>
                    </div>

                    {/* Penilaian Content */}
                    {activeTab === "pertemuan" && (
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">(1)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Pertemuan ke-<br/>(2)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Sub CPMK<br/>(3)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Indikator<br/>(4)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Kriteria<br/>(5)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Bentuk Pembelajaran (BP), Metode Pembelajaran (MP)<br/>(6)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Luring (Offline System)<br/>(6)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Daring (Online System)<br/>(7)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Materi Pembelajaran [Pustaka]<br/>(8)</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Bobot Penilaian (%)<br/>(9)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rpsDetailData.penilaian.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                    <div className="flex flex-col gap-1">
                                                        <button className="p-1 bg-cyan-500 text-white rounded hover:bg-cyan-600">
                                                            <Edit size={14} className="mx-auto" />
                                                        </button>
                                                        <button className="p-1 bg-orange-500 text-white rounded hover:bg-orange-600">
                                                            <Edit size={14} className="mx-auto" />
                                                        </button>
                                                        <button className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                                                            <Edit size={14} className="mx-auto" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{item.pertemuan}</td>
                                                <td className="border border-gray-300 px-3 py-2">{item.subCpmk}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.indikator}</td>
                                                <td className="border border-gray-300 px-3 py-2">
                                                    <div className="space-y-2">
                                                        <div className="bg-cyan-400 text-white px-2 py-1 rounded text-center font-semibold">
                                                            Formatif:
                                                        </div>
                                                        <p className="text-sm">{item.kriteria.formatif}</p>
                                                        <div className="bg-cyan-400 text-white px-2 py-1 rounded text-center font-semibold">
                                                            Sumatif:
                                                        </div>
                                                        <p className="text-sm">{item.kriteria.sumatif}</p>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2">
                                                    <div className="space-y-2">
                                                        <div className="flex gap-1">
                                                            <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold flex-1">
                                                                Kriteria Formatif: +
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold flex-1">
                                                                Kriteria Sumatif: +
                                                            </button>
                                                        </div>
                                                        <div className="bg-orange-400 text-white px-2 py-1 rounded text-center text-xs font-semibold">
                                                            +
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="font-semibold mb-1">Kuliah:</p>
                                                            <p>{item.bentukPembelajaran}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                    <div className="space-y-2">
                                                        <p className="text-sm">{item.luringOffline}</p>
                                                        <div className="flex gap-1">
                                                            <button className="bg-green-500 text-white px-2 py-1 rounded text-xs flex-1">
                                                                <Edit size={12} className="mx-auto" />
                                                            </button>
                                                            <button className="bg-red-500 text-white px-2 py-1 rounded text-xs flex-1">
                                                                <Edit size={12} className="mx-auto" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                    <div className="space-y-2">
                                                        <div className="bg-orange-400 text-white px-2 py-1 rounded text-xs font-semibold">
                                                            {item.daringOnline}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2">
                                                    <div className="space-y-1">
                                                        <div className="bg-cyan-400 text-white px-2 py-1 rounded text-center text-xs font-semibold">
                                                            Materi Pembelajaran:
                                                        </div>
                                                        <ol className="list-decimal list-inside text-sm space-y-1">
                                                            {item.materiPembelajaran.map((materi, idx) => (
                                                                <li key={idx}>{materi}</li>
                                                            ))}
                                                        </ol>
                                                        <p className="text-xs text-gray-600 mt-2">Pustaka : 1</p>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-center font-bold text-lg">
                                                    {item.bobotPenilaian}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button className="bg-cyan-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-cyan-600 transition-colors">
                                    Teknik Penilaian
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "evaluasi" && (
                        <div className="p-6">
                            <p className="text-gray-500 text-sm italic">Konten evaluasi akan ditampilkan di sini</p>
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
                        <ChevronLeft size={24} className="rotate-90" />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}