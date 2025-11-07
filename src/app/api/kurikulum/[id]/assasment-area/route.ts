import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

function parseId(paramsId?: string) {
  const n = Number(paramsId);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * GET: Mengambil semua Assasment Area untuk satu kurikulum.
 * Digunakan oleh: AreaManagementModal, PiGroupManagementModal, TambahPIRowModal
 */
export async function GET(
  _req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const kurikulumId = parseId(params?.id);
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
 * Digunakan oleh: AreaManagementModal
 */
export async function POST(
  req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const kurikulumId = parseId(params?.id);
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

