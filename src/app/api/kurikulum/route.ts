// src/app/api/kurikulum/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/../lib/auth";
import prisma from "@/../lib/prisma";
import { z } from "zod";

// === Validasi untuk POST ===
const postSchema = z.object({
  nama: z.string().min(2),
  tahun: z.number().int().optional(),
  program_studi_id: z.number().int().optional(),
});

// === GET: ambil daftar kurikulum ===
 // Fungsi untuk ambil session

export async function GET(req: NextRequest) {
  // 1. Ambil User dari Session
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil prodiId dari session (pastikan di login route tadi sudah disimpan)
  const userProdiId = Number(session.prodiId);

  // 2. Query Database dengan Filter Prodi
  try {
    // ... kode atas sama ...

    // 2. Query Database dengan Filter Prodi
    const data = await prisma.kurikulum.findMany({
      where: {
        prodi_id: userProdiId 
      },
      include: {
        _count: {
          // PERBAIKAN DI SINI:
          // Ganti 'matakuliah' menjadi 'mataKuliah' (atau 'mata_kuliah' cek schema.prisma)
          select: { mataKuliah: true } 
        },
        program_studi: true 
      },
      orderBy: {
        tahun: 'desc'
      }
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// === POST: tambah kurikulum baru ===
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = postSchema.parse(body);

    const tahun = parsed.tahun ?? new Date().getFullYear();

    const created = await prisma.kurikulum.create({
      data: {
        nama: parsed.nama,
        tahun,
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("POST /api/kurikulum error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
