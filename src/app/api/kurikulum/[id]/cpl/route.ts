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
     if (err.code === 'P2002') {
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