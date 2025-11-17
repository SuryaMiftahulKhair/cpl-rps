import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

// --- PERBAIKAN 1: Update fungsi parseId ---
function parseId(paramsId: string | undefined, nextUrl?: any) {
  if (paramsId) return Number(paramsId);
  try {
    // Fallback jika params.id tidak ada
    const p = nextUrl?.pathname?.split("/").pop();
    return p ? Number(p) : NaN;
  } catch {
    return NaN;
  }
}

/**
 * GET: Mengambil semua Assasment Area untuk satu kurikulum.
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

    const areas = await prisma.assasmentArea.findMany({
      where: { kurikulum_id: kurikulumId },
      orderBy: { nama: "asc" },
    });
    
    return NextResponse.json(areas);

  } catch (err: any) {
    console.error("GET /api/kurikulum/[id]/assasment-area error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

/**
 * POST: Membuat Assasment Area baru.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    // --- PERBAIKAN 3 (juga di POST): Gunakan 'req' di parseId ---
    const kurikulumId = parseId(params?.id, (request as any).nextUrl);

    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json({ error: "ID kurikulum tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { nama } = body;

    if (!nama) {
      return NextResponse.json({ error: "Nama Area wajib diisi" }, { status: 400 });
    }

    const newArea = await prisma.assasmentArea.create({
      data: {
        nama,
        kurikulum_id: kurikulumId,
      },
    });

    return NextResponse.json(newArea, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/kurikulum/[id]/assasment-area error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}