// src/app/api/kurikulum/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// Fungsi parseId baru yang lebih aman
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

/**
 * GET: Mengambil detail SATU kurikulum berdasarkan ID-nya.
 * Dipanggil oleh: /rps/[id]/list/page.tsx
 */
export async function GET(
  request: NextRequest,
  // 1. Definisikan params sebagai Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 2. Await params terlebih dahulu (Wajib di Next.js 15)
    const { id: idString } = await params;
    
    // 3. Konversi ke Number
    const id = Number(idString);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID Kurikulum tidak valid" }, { status: 400 });
    }

    const kurikulum = await prisma.kurikulum.findUnique({
      where: { id: id },
    });

    if (!kurikulum) {
      return NextResponse.json({ error: "Kurikulum tidak ditemukan" }, { status: 404 });
    }
    
    return NextResponse.json(kurikulum);

  } catch (err: any) {
    console.error("GET /api/kurikulum/[id] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

import { getSession } from "@/../lib/auth";

/**
 * PUT: Mengupdate nama dan tahun kurikulum berdasarkan ID.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idString } = await params;
    const id = Number(idString);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { nama, tahun } = body;

    if (!nama || !tahun) {
      return NextResponse.json({ error: "Nama dan tahun wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.kurikulum.update({
      where: { id },
      data: { nama: nama.trim(), tahun: Number(tahun) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PUT /api/kurikulum/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE: Menghapus kurikulum berdasarkan ID.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idString } = await params;
    const id = Number(idString);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Cek relasi yang masih ada sebelum menghapus
    const [mkCount, cplCount, areaCount] = await Promise.all([
      prisma.mataKuliah.count({ where: { kurikulum_id: id } }),
      prisma.cPL.count({ where: { kurikulum_id: id } }),
      prisma.assasmentArea.count({ where: { kurikulum_id: id } }),
    ]);

    const blockers: string[] = [];
    if (mkCount > 0) blockers.push(`${mkCount} Mata Kuliah`);
    if (cplCount > 0) blockers.push(`${cplCount} CPL`);
    if (areaCount > 0) blockers.push(`${areaCount} Assessment Area`);

    if (blockers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Kurikulum tidak dapat dihapus karena masih memiliki: ${blockers.join(", ")}. Hapus semua data terkait terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    await prisma.kurikulum.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/kurikulum/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}