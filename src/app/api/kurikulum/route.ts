// src/app/api/kurikulum/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../../lib/prisma";
import { z } from "zod";

// Validasi data POST (nama wajib, lainnya opsional)
const postSchema = z.object({
  nama: z.string().min(2),
  tahun: z.number().int().optional(),
  programStudiId: z.string().uuid().optional(),
  deskripsi: z.string().optional(),
  versi: z.string().optional(),
});

// GET: ambil daftar kurikulum
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const limit = Math.min(Number(url.searchParams.get("limit") || 10), 100);
  const q = url.searchParams.get("q") || "";
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.kurikulum.findMany({
      where: { nama: { contains: q, mode: "insensitive" } },
      include: { programStudi: true, mataKuliahs: { select: { id: true } } },
      skip,
      take: limit,
      orderBy: { tahun: "desc" },
    }),
    prisma.kurikulum.count({ where: { nama: { contains: q, mode: "insensitive" } } }),
  ]);

  const mapped = data.map((k) => ({
    id: k.id,
    nama: k.nama,
    tahun: k.tahun,
    versi: k.versi,
    deskripsi: k.deskripsi,
    programStudi: k.programStudi,
    mataKuliahsCount: k.mataKuliahs.length,
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
  }));

  return NextResponse.json({ data: mapped, meta: { page, limit, total } });
}

// POST: tambah kurikulum baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = postSchema.parse(body);

    // Cari ProgramStudi default kalau tidak dikirim
    let prodiId = parsed.programStudiId ?? null;
    if (!prodiId) {
      const prodi = await prisma.programStudi.upsert({
        where: { kode: "IF" },
        update: {},
        create: { kode: "IF", nama: "Informatika" },
      });
      prodiId = prodi.id;
    }

    const tahun = parsed.tahun ?? new Date().getFullYear();

    const created = await prisma.kurikulum.create({
      data: {
        nama: parsed.nama,
        tahun,
        programStudiId: prodiId,
        deskripsi: parsed.deskripsi ?? null,
        versi: parsed.versi ?? null,
      },
      include: { programStudi: true },
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
