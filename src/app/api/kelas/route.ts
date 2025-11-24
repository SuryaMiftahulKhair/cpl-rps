// file: src/app/api/kelas/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // Pastikan path ini sesuai
import { z } from "zod"; // Import Zod untuk validasi

// === Skema Validasi untuk POST ===
const createKelasSchema = z.object({
  mata_kuliah_id: z.number().int({ message: "ID Mata Kuliah harus berupa angka integer" }),
  tahun_ajaran_id: z.number().int({ message: "ID Tahun Ajaran harus berupa angka integer" }),
  nama_kelas: z.string().min(1, "Nama kelas wajib diisi"),
});

/**
 * Handler untuk GET /api/kelas
 * Mengambil daftar kelas berdasarkan 'semesterId'.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get("semesterId");

    // Validasi: Pastikan semesterId ada
    if (!semesterId) {
      return NextResponse.json(
        { error: "Query parameter 'semesterId' wajib diisi." },
        { status: 400 }
      );
    }

    const id = parseInt(semesterId, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Query parameter 'semesterId' harus berupa angka." },
        { status: 400 }
      );
    }

    // 1. Ambil data Kelas dari database
    const kelasList = await prisma.kelas.findMany({
      where: {
        tahun_ajaran_id: id,
      },
      include: {
        mataKuliah: true,
      },
      orderBy: {
        nama_kelas: "asc",
      },
    });

    // 2. Map data
    const mappedData = kelasList.map((kelas) => ({
      id: kelas.id,
      semesterKur: kelas.mataKuliah.kurikulum_id,
      namaKelas: kelas.nama_kelas,
      kodeMatakuliah: kelas.mataKuliah.kode_mk,
      namaMatakuliah: kelas.mataKuliah.nama,
      sks: kelas.mataKuliah.sks,
    }));

    return NextResponse.json(mappedData, { status: 200 });

  } catch (err) {
    console.error("GET /api/kelas error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data kelas" },
      { status: 500 }
    );
  }
}

/**
 * Handler untuk POST /api/kelas
 * Membuat kelas baru.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validasi input menggunakan Zod
    const parsed = createKelasSchema.parse(body);

    // 2. Cek Duplikasi (Opsional tapi disarankan)
    // Mencegah pembuatan kelas dengan nama yang sama untuk matkul yang sama di semester yang sama
    const existing = await prisma.kelas.findFirst({
      where: {
        mata_kuliah_id: parsed.mata_kuliah_id,
        tahun_ajaran_id: parsed.tahun_ajaran_id,
        nama_kelas: { equals: parsed.nama_kelas, mode: "insensitive" } // Case insensitive
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kelas '${parsed.nama_kelas}' sudah ada untuk mata kuliah ini di semester ini.` },
        { status: 409 } // 409 Conflict
      );
    }

    // 3. Simpan ke database
    const newKelas = await prisma.kelas.create({
      data: {
        mata_kuliah_id: parsed.mata_kuliah_id,
        tahun_ajaran_id: parsed.tahun_ajaran_id,
        nama_kelas: parsed.nama_kelas,
      },
      // Include mataKuliah agar data balikan bisa langsung dipakai frontend jika perlu
      include: {
        mataKuliah: true, 
      }
    });

    return NextResponse.json(newKelas, { status: 201 });

  } catch (err) {
    // Handle Error Validasi Zod
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    
    // Handle Error Database (Foreign Key tidak ketemu, dll)
    if ((err as any).code === 'P2003') { // Foreign key constraint failed
        return NextResponse.json({ error: "Mata kuliah atau Tahun Ajaran tidak valid/tidak ditemukan." }, { status: 400 });
    }

    console.error("POST /api/kelas error:", err);
    return NextResponse.json({ error: "Gagal membuat kelas" }, { status: 500 });
  }
}