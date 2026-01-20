import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { Semester } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      matakuliah_id, 
      keterangan, 
      is_new_ta, 
      new_tahun, 
      new_semester, 
      tahun_ajaran_id 
    } = body;

    let selectedTa: any;

    // ==========================================
    // 1. LOGIKA PENENTUAN TAHUN AJARAN (UPSERT)
    // ==========================================
    if (is_new_ta) {
      // Validasi input tahun baru
      if (!new_tahun) return NextResponse.json({ error: "Tahun Ajaran baru harus diisi" }, { status: 400 });

      selectedTa = await prisma.tahunAjaran.upsert({
        where: {
          tahun_semester: { 
            tahun: new_tahun,
            semester: new_semester as Semester,
          },
        },
        update: {}, 
        create: {
          tahun: new_tahun,
          semester: new_semester as Semester,
        },
      });
    } else {
      selectedTa = await prisma.tahunAjaran.findUnique({
        where: { id: Number(tahun_ajaran_id) }
      });

      if (!selectedTa) {
        return NextResponse.json({ error: "Tahun Ajaran tidak ditemukan" }, { status: 404 });
      }
    }

    // ==========================================
    // 2. VALIDASI MATA KULIAH
    // ==========================================
    const matkul = await prisma.mataKuliah.findUnique({
      where: { id: Number(matakuliah_id) }
    });

    if (!matkul) {
      return NextResponse.json({ error: "Mata kuliah tidak ditemukan" }, { status: 404 });
    }

    // ==========================================
    // 3. BUAT DOKUMEN RPS BARU
    // ==========================================
    const newRps = await prisma.rPS.create({
      data: {
        matakuliah_id: Number(matakuliah_id),
        // Simpan String & Enum untuk pencarian cepat
        tahun: selectedTa.tahun,
        semester: selectedTa.semester as Semester, 
        
        // Deskripsi otomatis jika kosong
        deskripsi: keterangan || `RPS TA ${selectedTa.tahun} - ${selectedTa.semester}`,
        
        // Nomor dokumen format rapi
        nomor_dokumen: `RPS-${matkul.kode_mk}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        
        nama_penyusun: "Dosen Pengampu", 
        is_locked: false,
        tanggal_penyusunan: new Date(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "RPS berhasil disinkronkan dengan Tahun Ajaran",
      data: newRps 
    });

  } catch (err: any) {
    console.error("Create RPS Error:", err);
    // Cek jika ada error unique constraint dari database
    if (err.code === 'P2002') {
        return NextResponse.json({ error: "RPS untuk Matakuliah dan periode ini sudah ada." }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}