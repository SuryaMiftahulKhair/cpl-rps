// file: src/app/api/kelas/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { z } from "zod";

// === Skema Validasi untuk POST (Disesuaikan dengan tabel Kelas baru) ===
const createKelasSchema = z.object({
  tahun_ajaran_id: z.number().int({ message: "ID Tahun Ajaran harus berupa angka integer" }),
  nama_kelas: z.string().min(1, "Nama kelas wajib diisi"),
  // Tambahan field baru karena tabel MataKuliah sudah tidak ada
  kode_mk: z.string().min(1, "Kode MK wajib diisi"),
  nama_mk: z.string().min(1, "Nama MK wajib diisi"),
  sks: z.number().int().min(0, "SKS harus angka positif"),
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
      // HAPUS include: { mataKuliah: true } karena relasi sudah tidak ada
      orderBy: {
        nama_kelas: "asc",
      },
    });

    // 2. Map data (Sesuaikan dengan kolom langsung di tabel Kelas)
    const mappedData = kelasList.map((kelas) => ({
      id: kelas.id,
      semesterKur: 0, // Placeholder karena data kurikulum_id hilang/tidak ada di tabel kelas saat ini
      namaKelas: kelas.nama_kelas,
      
      // PERBAIKAN: Akses langsung field dari tabel Kelas
      kodeMatakuliah: kelas.kode_mk, 
      namaMatakuliah: kelas.nama_mk,
      sks: kelas.sks,
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

    // 2. Cek Duplikasi
    // Cek berdasarkan Kode MK + Nama Kelas + Tahun Ajaran
    const existing = await prisma.kelas.findFirst({
      where: {
        kode_mk: parsed.kode_mk, // Cek Kode MK
        tahun_ajaran_id: parsed.tahun_ajaran_id,
        nama_kelas: { equals: parsed.nama_kelas, mode: "insensitive" }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kelas '${parsed.nama_kelas}' untuk MK '${parsed.nama_mk}' sudah ada di semester ini.` },
        { status: 409 }
      );
    }

    // 3. Simpan ke database (Tanpa mata_kuliah_id)
    const newKelas = await prisma.kelas.create({
      data: {
        tahun_ajaran_id: parsed.tahun_ajaran_id,
        nama_kelas: parsed.nama_kelas,
        // Isi data MK manual
        kode_mk: parsed.kode_mk,
        nama_mk: parsed.nama_mk,
        sks: parsed.sks,
        // Buat ID unik untuk neosia_id agar konsisten (opsional jika manual)
        neosia_id: `MANUAL-${parsed.kode_mk}-${parsed.nama_kelas}-${Date.now()}`
      },
    });

    return NextResponse.json(newKelas, { status: 201 });

  } catch (err) {
    // Handle Error Validasi Zod
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    
    console.error("POST /api/kelas error:", err);
    return NextResponse.json({ error: "Gagal membuat kelas" }, { status: 500 });
  }
}