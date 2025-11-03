// src/app/api/kurikulum/[id]/matakuliah/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // pastikan file src/lib/prisma.ts ada dan export default prisma
import { z } from "zod";

const createSchema = z.object({
  kode_mk: z.string().min(1, "Kode mata kuliah wajib diisi"),
  nama: z.string().min(1, "Nama mata kuliah wajib diisi"),
  sks: z.number().int().nonnegative("SKS harus >= 0"),
  semester: z.number().int().optional(),
  sifat: z.string().optional(),
});

function parseId(paramsId: string | undefined, nextUrl?: any) {
  if (paramsId) return Number(paramsId);
  try {
    const p = nextUrl?.pathname?.split("/").pop();
    return p ? Number(p) : NaN;
  } catch {
    return NaN;
  }
}

export async function GET(request: Request, { params }: { params: { id?: string } }) {
  try {
    const id = parseId(params?.id, (request as any).nextUrl);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "kurikulum id tidak valid (harus integer)" }, { status: 400 });
    }

    // ambil mata_kuliah yang punya kurikulum_id = id
    const list = await prisma.mataKuliah.findMany({
      where: { kurikulum_id: id },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(list);
  } catch (err: any) {
    console.error("GET /api/kurikulum/[id]/matakuliah error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: { id?: string } }) {
  try {
    const kurikulumId = parseId(params?.id, (request as any).nextUrl);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json({ error: "kurikulum id tidak valid (harus integer)" }, { status: 400 });
    }

    // pastikan kurikulum ada
    const kur = await prisma.kurikulum.findUnique({ where: { id: kurikulumId } });
    if (!kur) {
      return NextResponse.json({ error: "Kurikulum tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse({
      kode_mk: String(body.kode_mk ?? body.kode ?? ""),
      nama: String(body.nama ?? ""),
      sks: Number(body.sks ?? 0),
      semester: body.semester != null ? Number(body.semester) : undefined,
      sifat: body.sifat ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
    }

    // cek unique kode_mk
    const exist = await prisma.mataKuliah.findUnique({ where: { kode_mk: parsed.data.kode_mk } });
    if (exist) {
      return NextResponse.json({ error: `kode_mk '${parsed.data.kode_mk}' sudah ada.` }, { status: 409 });
    }

    const created = await prisma.mataKuliah.create({
      data: {
        kode_mk: parsed.data.kode_mk,
        nama: parsed.data.nama,
        sks: parsed.data.sks,
        kurikulum_id: kurikulumId,
        // jika kolom semester / sifat ada di DB maka akan tersimpan, kalau tidak ada property ini di DB, Prisma akan error —
        // pastikan schema prisma sudah sesuai (kamu sebutkan schema di atas, jadi ok).
        ...(parsed.data.semester !== undefined ? { semester: parsed.data.semester } : {}),
        ...(parsed.data.sifat ? { sifat: parsed.data.sifat } : {}),
      } as any,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/kurikulum/[id]/matakuliah error:", err);
    if (err?.code === "P2003") return NextResponse.json({ error: "Foreign key invalid (kurikulum_id)." }, { status: 400 });
    if (err?.code === "P2002") return NextResponse.json({ error: "Conflict: unique constraint." }, { status: 409 });
    return NextResponse.json({ error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) }, { status: 500 });
  }
}
