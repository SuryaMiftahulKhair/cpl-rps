import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

/**
 * GET: Mengambil semua Indikator untuk SATU PI Group.
 * Digunakan oleh: IndicatorModal
 */
export async function GET(
  _req: Request,
  { params }: { params: { piGroupId?: string } }
) {
  try {
    const piGroupId = Number(params.piGroupId);
    if (Number.isNaN(piGroupId)) {
      return NextResponse.json({ error: "ID PI Group tidak valid" }, { status: 400 });
    }

    const indicators = await prisma.performanceIndicator.findMany({
      where: { pi_group_id: piGroupId },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(indicators);
  } catch (err: any) {
    console.error("GET /api/kurikulum/[id]/pi-group/[piGroupId]/indicator error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

/**
 * POST: Membuat Indikator baru di dalam SATU PI Group.
 * Digunakan oleh: IndicatorModal
 */
export async function POST(
  req: Request,
  { params }: { params: { piGroupId?: string } }
) {
  try {
    const piGroupId = Number(params.piGroupId);
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
    console.error("POST /api/kurikulum/[id]/pi-group/[piGroupId]/indicator error:", err);
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