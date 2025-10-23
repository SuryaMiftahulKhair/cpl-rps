// src/app/api/kurikulum/[id]/matakuliah/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // <- pastikan file src/lib/prisma.ts ada
import { z } from "zod";

const createSchema = z.object({
  kode: z.string().min(1, "Kode mata kuliah wajib diisi"),
  nama: z.string().min(1, "Nama mata kuliah wajib diisi"),
  sks: z.number().int().positive("SKS harus bernilai positif"),
  semester: z.number().int().positive("Semester harus bernilai positif"),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const kurikulumId = params?.id;
    if (!kurikulumId) {
      return NextResponse.json({ error: "Parameter kurikulumId tidak ditemukan." }, { status: 400 });
    }

    const list = await prisma.mataKuliah.findMany({
      where: { kurikulumId },
      include: { cplItems: true },
      orderBy: { semester: "asc" },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("GET /api/kurikulum/[id]/matakuliah error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const kurikulumId = params?.id;
    if (!kurikulumId) {
      return NextResponse.json({ error: "Parameter kurikulumId tidak ditemukan." }, { status: 400 });
    }

    // pastikan kurikulum ada
    const kurikulum = await prisma.kurikulum.findUnique({ where: { id: kurikulumId } });
    if (!kurikulum) {
      return NextResponse.json({ error: "Kurikulum tidak ditemukan di database." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse({
      kode: String(body.kode ?? ""),
      nama: String(body.nama ?? ""),
      sks: Number(body.sks ?? 0),
      semester: Number(body.semester ?? 0),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    }

    const { kode, nama, sks, semester } = parsed.data;

    // unique check
    const existing = await prisma.mataKuliah.findUnique({ where: { kode } });
    if (existing) {
      return NextResponse.json({ error: `Kode mata kuliah '${kode}' sudah terdaftar.` }, { status: 409 });
    }

    const created = await prisma.mataKuliah.create({
      data: { kode, nama, sks, semester, kurikulumId },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/kurikulum/[id]/matakuliah error:", error);
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Foreign key tidak valid: kurikulumId tidak ditemukan." }, { status: 400 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Kode mata kuliah sudah digunakan." }, { status: 409 });
    }
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
