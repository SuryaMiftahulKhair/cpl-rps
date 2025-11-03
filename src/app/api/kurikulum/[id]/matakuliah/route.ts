import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // pastikan path ini sesuai strukturmu
import { z } from "zod";

// HANYA field yang ada di schema
const createSchema = z.object({
  kode_mk: z.string().min(1, "Kode mata kuliah wajib diisi"),
  nama: z.string().min(1, "Nama mata kuliah wajib diisi"),
  sks: z.number().int().nonnegative("SKS harus >= 0"),
  // tambah pi_group_id karena di Prisma schema field ini required pada unchecked create
  pi_group_id: z.number().int().nonnegative().optional(),
  // semester & sifat sengaja TIDAK dimasukkan karena tidak ada di schema
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

    const raw = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse({
      kode_mk: String(raw.kode_mk ?? raw.kode ?? "").trim(),
      nama: String(raw.nama ?? "").trim(),
      sks: Number(raw.sks ?? 0),
      // accept either snake_case or camelCase from clients, default to 0 when not provided
      pi_group_id: Number(raw.pi_group_id ?? raw.piGroupId ?? 0),
    });

    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // cek unique kode_mk
    const exist = await prisma.mataKuliah.findUnique({
      where: { kode_mk: parsed.data.kode_mk },
    });
    if (exist) {
      return NextResponse.json({ error: `kode_mk '${parsed.data.kode_mk}' sudah ada.` }, { status: 409 });
    }

    // HANYA field yang ada di schema
    const created = await prisma.mataKuliah.create({
      data: {
        kode_mk: parsed.data.kode_mk,
        nama: parsed.data.nama,
        sks: parsed.data.sks,
        kurikulum_id: kurikulumId,
        // pastikan required field pi_group_id disertakan (gunakan 0 jika tidak diberikan)
        pi_group_id: parsed.data.pi_group_id ?? 0,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/kurikulum/[id]/matakuliah error:", {
      message: err?.message,
      code: err?.code,
      meta: err?.meta,
      stack: err?.stack,
    });
    if (err?.code === "P2003") return NextResponse.json({ error: "Foreign key invalid (kurikulum_id)." }, { status: 400 });
    if (err?.code === "P2002") return NextResponse.json({ error: "Conflict: unique constraint." }, { status: 409 });
    return NextResponse.json({ error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) }, { status: 500 });
  }
}
