// file: src/app/api/kelas/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // Pastikan path ke prisma.ts Anda benar

/**
 * Handler untuk GET /api/kelas
 * Mengambil daftar kelas berdasarkan 'semesterId' (yang merupakan 'tahun_ajaran_id').
 *
 * Contoh pemanggilan: /api/kelas?semesterId=1
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
        tahun_ajaran_id: id, // Filter berdasarkan ID TahunAjaran (semester)
      },
      // 2. Sertakan data MataKuliah yang terhubung
      include: {
        mataKuliah: true,
      },
      orderBy: {
        nama_kelas: "asc", // Urutkan berdasarkan nama kelas
      },
    });

    // 3. Map data agar sesuai dengan format yang diharapkan frontend
    const mappedData = kelasList.map((kelas) => ({
      id: kelas.id, // <-- Penting untuk key dan link
      semesterKur: kelas.mataKuliah.kurikulum_id, // Anda bisa kembangkan ini
      namaKelas: kelas.nama_kelas,
      kodeMatakuliah: kelas.mataKuliah.kode_mk,
      namaMatakuliah: kelas.mataKuliah.nama,
      sks: kelas.mataKuliah.sks,
    }));

    // 4. Kembalikan data yang sudah dimapping
    return NextResponse.json(mappedData, { status: 200 });

  } catch (err) {
    console.error("GET /api/kelas error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data kelas" },
      { status: 500 }
    );
  }
}