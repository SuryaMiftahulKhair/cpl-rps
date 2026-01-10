import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma"; // Sesuaikan path import prisma kakak

// --- 1. GET: Ambil Daftar Mata Kuliah (Fix Error _count) ---
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kurikulumId = Number(id);

    const data = await prisma.mataKuliah.findMany({
      where: {
        kurikulum_id: kurikulumId,
      },
      include: {
        // PERBAIKAN: Jangan count 'rps'. Cukup include 'rps' biasa atau ambil ID-nya saja.
        rps: {
          select: { id: true, is_locked: true } // Cek apakah RPS ada & statusnya
        },
        cpl: true, // Include data CPL biar bisa dilihat matkul ini dukung CPL apa aja
        _count: {
          select: {
            kelas: true, // Ini BISA dicount karena array
            cpl: true    // Ini BISA dicount karena array
            // rps: true <--- INI PENYEBAB ERROR KAKAK TADI (HAPUS BARIS INI)
          }
        }
      },
      orderBy: {
        semester: 'asc' // Urutkan berdasarkan semester dulu
        // kode_mk: 'asc'
      }
    });

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("API GET Matkul Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// --- 2. POST: Tambah Mata Kuliah dengan Multi CPL ---
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kurikulumId = Number(id);

    const body = await req.json();
    
    // cpl_ids adalah Array angka, misal: [1, 4, 5]
    const { kode_mk, nama, sks, semester, sifat, cpl_ids } = body; 

    // Validasi sederhana
    if (!kode_mk || !nama) {
        return NextResponse.json({ error: "Kode dan Nama MK wajib diisi" }, { status: 400 });
    }

    // Logic Simpan dengan Relasi Many-to-Many (Connect)
    const newMatkul = await prisma.mataKuliah.create({
      data: {
        kode_mk,
        nama,
        sks: Number(sks),
        semester: Number(semester),
        sifat, // "Wajib" atau "Pilihan"
        kurikulum_id: kurikulumId,
        
        // FITUR UTAMA: Hubungkan ke banyak CPL sekaligus
        cpl: {
            connect: Array.isArray(cpl_ids) 
                ? cpl_ids.map((cplId: number) => ({ id: Number(cplId) })) 
                : [] 
        }
      }
    });

    return NextResponse.json({ success: true, data: newMatkul });

  } catch (err: any) {
    // Handle error duplicate kode_mk
    if (err.code === 'P2002') {
        return NextResponse.json({ error: "Kode Mata Kuliah sudah ada!" }, { status: 400 });
    }
    console.error("API POST Matkul Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}