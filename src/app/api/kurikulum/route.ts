// src/app/api/kurikulum/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { z } from "zod";

// === Validasi untuk POST ===
const postSchema = z.object({
  nama: z.string().min(2),
  tahun: z.number().int().optional(),
  program_studi_id: z.number().int().optional(),
});

// === GET: ambil daftar kurikulum ===
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Math.min(Number(url.searchParams.get("limit") || 10), 100);
    const q = url.searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.kurikulum.findMany({
        where: { nama: { contains: q, mode: "insensitive" } },
        include: {
          mataKuliah: { select: { id: true } },
        },
        skip,
        take: limit,
        orderBy: { tahun: "desc" },
      }),
      prisma.kurikulum.count({
        where: { nama: { contains: q, mode: "insensitive" } },
      }),
    ]);

    const mapped = data.map((k) => ({
      id: k.id,
      nama: k.nama,
      tahun: k.tahun,
      mataKuliahCount: k.mataKuliah.length,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    }));

    return NextResponse.json({ data: mapped, meta: { page, limit, total } });
  } catch (err) {
    console.error("GET /api/kurikulum error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data kurikulum" },
      { status: 500 }
    );
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
