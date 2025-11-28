import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { z } from "zod";

// Skema Zod
const createSchema = z.object({
  kode_mk: z.string().min(1, "Kode mata kuliah wajib diisi"),
  nama: z.string().min(1, "Nama mata kuliah wajib diisi"),
  sks: z.number().int().nonnegative("SKS harus >= 0"),
  sifat: z.string(), // Dibuat wajib
  semester: z.number().int().positive(), // Dibuat wajib
});

// Fungsi parseId
function parseId(paramsId: string | undefined, nextUrl?: any) {
  if (paramsId) return Number(paramsId);
  try {
    const url = nextUrl?.pathname ?? "";
    const segments = url.split('/');
    const idIndex = segments.indexOf('kurikulum') + 1; 
    const id = segments[idIndex];
    return id ? Number(id) : NaN;
  } catch {
    return NaN;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params:Promise < { id?: string } >} // <-- PERBAIKAN: Pakai 'id'
) {
  try {
    // --- PERBAIKAN: Baca 'params.id' ---
    const kurikulumId = parseId((await params).id, (request as any).nextUrl);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json({ error: "kurikulum id tidak valid (harus integer)" }, { status: 400 });
    }

    const list = await prisma.mataKuliah.findMany({
      where: { kurikulum_id: kurikulumId },
      orderBy: { semester: "asc" },
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id?: string } } // <-- PERBAIKAN: Pakai 'id'
) {
  try {
    // --- PERBAIKAN: Baca 'params.id' ---
    const kurikulumId = parseId(params.id, (request as any).nextUrl);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json({ error: "kurikulum id tidak valid (harus integer)" }, { status: 400 });
    }

    const kur = await prisma.kurikulum.findUnique({ where: { id: kurikulumId } });
    if (!kur) {
      return NextResponse.json({ error: "Kurikulum tidak ditemukan." }, { status: 404 });
    }

    const raw = await request.json().catch(() => ({}));
    
    const parsed = createSchema.safeParse({
      kode_mk: String(raw.kode_mk ?? "").trim(),
      nama: String(raw.nama ?? "").trim(),
      sks: Number(raw.sks ?? 0),
      sifat: String(raw.sifat ?? ""), // Wajib
      semester: Number(raw.semester ?? 0), // Wajib
    });

    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
     if (!parsed.data.sifat) {
        return NextResponse.json({ error: "Sifat wajib diisi" }, { status: 400 });
     }
     if (!parsed.data.semester || parsed.data.semester <= 0) {
        return NextResponse.json({ error: "Semester wajib diisi" }, { status: 400 });
     }

    const exist = await prisma.mataKuliah.findUnique({
      where: { kode_mk: parsed.data.kode_mk },
    });
    if (exist) {
      return NextResponse.json({ error: `Kode MK '${parsed.data.kode_mk}' sudah ada.` }, { status: 409 });
    }

    const created = await prisma.mataKuliah.create({
      data: {
        kode_mk: parsed.data.kode_mk,
        nama: parsed.data.nama,
        sks: parsed.data.sks,
        sifat: parsed.data.sifat,
        semester: parsed.data.semester,
        kurikulum_id: kurikulumId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/kurikulum/[id]/matakuliah error:", err);
    if (err?.code === "P2002") return NextResponse.json({ error: "Conflict: Kode MK sudah ada." }, { status: 409 });
    return NextResponse.json({ error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) }, { status: 500 });
  }
}