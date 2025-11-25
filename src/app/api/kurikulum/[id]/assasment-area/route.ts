import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// Fungsi parseId baru
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
  { params }: { params: { id?: string } } // <-- PERBAIKAN: Pakai 'id'
) {
  try {
    // --- PERBAIKAN: Baca 'params.id' ---
    const kurikulumId = parseId(params.id, (request as any).nextUrl);
    
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

export async function POST(
  req: NextRequest,
  { params }: { params: { id?: string } } // <-- PERBAIKAN: Pakai 'id'
) {
  try {
    // --- PERBAIKAN: Baca 'params.id' ---
    const kurikulumId = parseId(params.id, (req as any).nextUrl);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json({ error: "ID kurikulum tidak valid" }, { status: 400 });
    }

    const body = await req.json();
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