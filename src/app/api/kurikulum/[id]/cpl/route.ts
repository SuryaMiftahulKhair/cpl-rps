import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // sesuaikan path prisma

// --- PERBAIKAN 1: Update fungsi parseId ---
function parseId(paramsId: string | undefined, nextUrl?: any) {
  if (paramsId) return Number(paramsId);
  try {
    const p = nextUrl?.pathname?.split("/").pop();
    return p ? Number(p) : NaN;
  } catch {
    return NaN;
  }
}

/**
 * GET: Mengambil semua CPL untuk satu kurikulum.
 */
export async function GET(
  request: NextRequest, // <-- PERBAIKAN 2: Kembalikan 'request'
  { params }: { params: { id?: string } }
) {
  try {
    // --- PERBAIKAN 3: Gunakan 'request' di parseId ---
    const kurikulumId = parseId(params?.id, (request as any).nextUrl);

    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json({ error: "ID kurikulum tidak valid" }, { status: 400 });
    }

    const cpls = await prisma.cPL.findMany({
      where: { kurikulum_id: kurikulumId },
      orderBy: { kode_cpl: "asc" },
    });
    
    return NextResponse.json(cpls);

  } catch (err: any) {
    console.error("GET /api/kurikulum/[id]/cpl error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

/**
 * POST: Membuat CPL baru.
 */
export async function POST(
  request:NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    // --- PERBAIKAN 3 (juga di POST): Gunakan 'req' di parseId ---
    const kurikulumId = parseId(params?.id, (request as any).nextUrl);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json({ error: "ID kurikulum tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { kode_cpl, deskripsi } = body;

    if (!kode_cpl || !deskripsi) {
      return NextResponse.json({ error: "Kode CPL dan Deskripsi wajib diisi" }, { status: 400 });
    }

    const newCpl = await prisma.cPL.create({
      data: {
        kode_cpl,
        deskripsi,
        kurikulum_id: kurikulumId,
      },
    });

    return NextResponse.json(newCpl, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/kurikulum/[id]/cpl error:", err);
     if (err.code === 'P2002') { // Unique constraint violation
      return NextResponse.json(
        { error: "Kode CPL sudah ada. Gunakan kode lain." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
} 