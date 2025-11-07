// file: src/app/api/tahunAjaran/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // Pastikan path ke prisma.ts Anda benar
import { Prisma } from "@prisma/client";
import { z } from "zod";

// === Skema Validasi untuk POST ===
// Sesuai dengan schema.prisma Anda
const postSchema = z.object({
  tahun: z.string().min(4, "Tahun harus diisi"), // misal: "2024/2025"
  semester: z.enum(["GANJIL", "GENAP"]),
});

// === GET: Ambil daftar Tahun Ajaran ===
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Math.min(Number(url.searchParams.get("limit") || 10), 100);
    const q = url.searchParams.get("q") || ""; // Search query untuk 'tahun'
    const skip = (page - 1) * limit;

    // Kondisi pencarian
    const whereCondition = {
      tahun: { contains: q, mode: Prisma.QueryMode.insensitive },
    };

    // 1. Ambil data dengan paginasi, search, dan urutan
    const [data, total] = await Promise.all([
      prisma.tahunAjaran.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        // Urutkan berdasarkan tahun terbaru, lalu semester (Genap dulu)
        orderBy: [{ tahun: "desc" }, { semester: "desc" }],
      }),
      // 2. Hitung total data untuk paginasi
      prisma.tahunAjaran.count({
        where: whereCondition,
      }),
    ]);

    // 3. Kembalikan data dalam format yang sama seperti contoh Kurikulum
    return NextResponse.json({ data, meta: { page, limit, total } });
  } catch (err) {
    console.error("GET /api/tahunAjaran error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data tahun ajaran" },
      { status: 500 }
    );
  }
}

// === POST: Tambah Tahun Ajaran baru ===
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 1. Validasi input menggunakan Zod
    const parsed = postSchema.parse(body);

    // 2. Buat data baru di database
    const created = await prisma.tahunAjaran.create({
      data: {
        tahun: parsed.tahun,
        semester: parsed.semester,
      },
    });

    // 3. Kembalikan data yang baru dibuat
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    // 4. Tangani error validasi dari Zod
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    // 5. Tangani error unik (jika tahun + semester sudah ada)
    if ((err as any).code === "P2002") {
      return NextResponse.json(
        { error: "Tahun ajaran dan semester ini sudah ada." },
        { status: 409 } // 409 Conflict
      );
    }
    // 6. Tangani error server lainnya
    console.error("POST /api/tahunAjaran error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}