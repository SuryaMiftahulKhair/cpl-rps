import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matakuliah_id, tahun, semester, keterangan } = body;

    // 1. Validasi Input
    if (!matakuliah_id) {
      return NextResponse.json({ error: "ID Mata Kuliah wajib ada" }, { status: 400 });
    }

    // 2. Cari Data Mata Kuliah (Untuk memastikan ID valid & ambil Kode MK)
    const mk = await prisma.mataKuliah.findUnique({ 
      where: { id: Number(matakuliah_id) } 
    });

    if (!mk) {
      return NextResponse.json({ error: "Mata kuliah tidak ditemukan" }, { status: 404 });
    }

    // 3. Generate Nomor Dokumen Otomatis (Opsional)
    // Contoh format: RPS-[KODE_MK]-[TAHUN]
    const docNumber = `RPS-${mk.kode_mk}-${tahun || new Date().getFullYear()}`;

    // 4. LANGSUNG BUAT RPS (Tanpa Buat Kelas)
    const newRPS = await prisma.rPS.create({
      data: {
        // Relasi langsung ke Mata Kuliah
        matakuliah_id: mk.id, 
        
        // Metadata RPS
        nomor_dokumen: docNumber,
        tanggal_penyusunan: new Date(),
        
        // Isi default kosong (agar tidak error null)
        deskripsi: keterangan || `RPS untuk ${mk.nama}`,
        materi_pembelajaran: "",
        pustaka_utama: "",
        pustaka_pendukung: "",
        
        // Otorisasi Default (Bisa diedit nanti)
        nama_penyusun: "Tim Dosen",
        nama_koordinator: "Koordinator MK",
        nama_kaprodi: "Ketua Prodi"
      }
    });

    // 5. Response Sukses
    return NextResponse.json(
      { 
        success: true,
        message: "RPS berhasil dibuat",
        data: newRPS // Mengembalikan object RPS yang baru dibuat
      }, 
      { status: 201 }
    );

  } catch (err: any) {
    console.error("Create RPS Error:", err);
    return NextResponse.json(
      { 
        error: err.message || "Gagal membuat RPS",
        details: err.meta || {}
      }, 
      { status: 500 }
    );
  }
}