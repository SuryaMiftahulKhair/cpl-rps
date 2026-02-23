// src/app/api/kurikulum/[id]/VMCPL/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth";

// --- FUNGSI GET (Tetap aman) ---
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const kurikulumId = Number(id);

    const session = await getSession();
    if (!session || !session.prodiId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kurikulum = await prisma.kurikulum.findUnique({
      where: { id: kurikulumId },
      include: {
        cpl: {
          include: { iks: true },
          orderBy: { kode_cpl: "asc" },
        },
        AssasmentArea: { orderBy: { nama: "asc" } },
      },
    });

    if (!kurikulum) {
      return NextResponse.json(
        { error: "Kurikulum tidak ditemukan" },
        { status: 404 },
      );
    }

    if (kurikulum.prodi_id !== Number(session.prodiId)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: kurikulum });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// --- FUNGSI PATCH (REVISI TOTAL UNTUK VERCEL) ---
export async function PATCH(
  req: NextRequest, // Gunakan NextRequest agar konsisten
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Await params terlebih dahulu
    const { id } = await params;
    const kurikulumId = parseInt(id);

    // 2. Ambil data dari body
    const body = await req.json();
    const { visi, misi } = body;

    // 3. Update database
    const updated = await prisma.kurikulum.update({
      where: { id: kurikulumId },
      data: {
        visi: visi,
        misi: misi,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH VMCPL Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal update Visi Misi Kurikulum" },
      { status: 500 },
    );
  }
}
