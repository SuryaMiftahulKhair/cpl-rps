import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import prisma from "@/../lib/prisma";

// Fungsi parseId baru yang lebih aman
function parseId(paramsId: string | undefined, nextUrl?: any, segmentName?: string) {
  if (paramsId) return Number(paramsId);
  try {
    const url = nextUrl?.pathname ?? "";
    const segments = url.split('/');
    // Diharapkan URL: /api/kurikulum/2/pi-group/1/indicator
    // segmentName = 'kurikulum' atau 'pi-group'
    const idIndex = segments.indexOf(segmentName ?? 'kurikulum') + 1; 
    const id = segments[idIndex];
    return id ? Number(id) : NaN;
  } catch {
    return NaN;
  }
}

/**
 * GET: Mengambil semua Indikator untuk SATU PI Group.
 */
export async function GET(
  request: NextRequest, // Gunakan NextRequest
  { params }: { params: { piGroupId?: string } }
) {
  try {
    // Ambil piGroupId dari params
    const piGroupId = parseId(params.piGroupId); 

    if (Number.isNaN(piGroupId)) {
      return NextResponse.json({ error: "ID PI Group tidak valid" }, { status: 400 });
    }

    const indicators = await prisma.performanceIndicator.findMany({
      where: { pi_group_id: piGroupId },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(indicators);
  } catch (err: any) {
    console.error("GET .../indicator error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

/**
 * POST: Membuat Indikator baru di dalam SATU PI Group.
 */
export async function POST(
  req: Request,
  { params }: { params: { piGroupId?: string } }
) {
  try {
    const piGroupId = parseId(params.piGroupId);
    if (Number.isNaN(piGroupId)) {
      return NextResponse.json({ error: "ID PI Group tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { deskripsi, cpl_id } = body;

    if (!deskripsi || !cpl_id) {
       return NextResponse.json({ error: "Deskripsi dan CPL wajib diisi" }, { status: 400 });
    }

    const newIndicator = await prisma.performanceIndicator.create({
      data: {
        deskripsi: String(deskripsi),
        cpl_id: Number(cpl_id),
        pi_group_id: piGroupId,
      },
    });

    return NextResponse.json(newIndicator, { status: 201 });
  } catch (err: any) {
    console.error("POST .../indicator error:", err);
     if (err.code === 'P2003') { // Foreign key constraint
       return NextResponse.json(
         { error: "Gagal. Pastikan CPL ID atau PI Group ID valid." },
         { status: 400 }
       );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}