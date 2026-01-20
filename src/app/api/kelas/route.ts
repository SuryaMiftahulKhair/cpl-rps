// file: src/app/api/kelas/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

// GET: Ambil daftar kelas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taId = searchParams.get("tahun_ajaran_id");

    const where = taId ? { tahun_ajaran_id: Number(taId) } : {};

    const data = await prisma.kelas.findMany({
      where,
      include: {
        matakuliah: true,
        dosen_pengampu: { include: { dosen: true } }
      },
      orderBy: { nama_kelas: 'asc' }
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tambah Kelas Baru (Manual Tanpa Neosia)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validasi input dasar
    if (!body.tahun_ajaran_id || !body.kode_mk || !body.nama_kelas) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // --- BAGIAN INI DIHAPUS (Tidak perlu ID unik manual lagi) ---
    // const manualNeosiaId = `MANUAL-${body.kode_mk}-...`;

    // 2. Simpan ke Database
    const newKelas = await prisma.kelas.create({
      data: {
        tahun_ajaran_id: Number(body.tahun_ajaran_id),
        nama_kelas: body.nama_kelas, 
        kode_mk: body.kode_mk,       
        nama_mk: body.nama_mk,       
        sks: Number(body.sks || 0),
        
        matakuliah_id: body.matakuliah_id ? Number(body.matakuliah_id) : null,

        // HAPUS BARIS INI:
        // neosia_id: manualNeosiaId 
      }
    });

    return NextResponse.json({ success: true, data: newKelas });

  } catch (err: any) {
    console.error("POST Kelas Error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Gagal menyimpan kelas" 
    }, { status: 500 });
  }
}