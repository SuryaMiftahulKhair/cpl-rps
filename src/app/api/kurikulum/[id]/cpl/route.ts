import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // sesuaikan path prisma

function parseId(paramsId?: string) {
  const n = Number(paramsId);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * GET: Mengambil semua CPL untuk satu kurikulum.
 * Digunakan oleh: CplManagementModal, TambahPIRowModal
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
 * Digunakan oleh: CplManagementModal
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

export async function PUT(
  req: Request,
  { params }: { params: { cplId?: string } }
) {
  try {
    const cplId = Number(params.cplId);
    if (Number.isNaN(cplId)) {
      return NextResponse.json({ error: "ID CPL tidak valid" }, { status: 400 });
    }
    
    const body = await req.json();
    const { kode_cpl, deskripsi } = body;

    if (!kode_cpl || !deskripsi) {
      return NextResponse.json({ error: "Kode CPL dan Deskripsi wajib diisi" }, { status: 400 });
    }

    const updatedCpl = await prisma.cPL.update({
      where: { id: cplId },
      data: { kode_cpl, deskripsi },
    });

    return NextResponse.json(updatedCpl);
  } catch (err: any) {
    console.error("PUT /api/kurikulum/[id]/cpl/[cplId] error:", err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: "Kode CPL sudah ada." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Menghapus CPL.
 * Digunakan oleh: CplManagementModal
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { cplId?: string } }
) {
  try {
    const cplId = Number(params.cplId);
    if (Number.isNaN(cplId)) {
      return NextResponse.json({ error: "ID CPL tidak valid" }, { status: 400 });
    }
    
    // Hapus CPL
    await prisma.cPL.delete({ where: { id: cplId } });
    
    return NextResponse.json({ message: "CPL berhasil dihapus" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/kurikulum/[id]/cpl/[cplId] error:", err);
     if (err.code === 'P2003') { // Foreign key constraint
      return NextResponse.json(
        { error: "Gagal hapus. CPL ini masih terhubung ke Performance Indicator. Hapus Indikator terlebih dahulu." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}