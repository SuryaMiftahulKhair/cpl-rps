import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

// --- 1. FUNGSI UPDATE (PUT) ---
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { deskripsi, cpmk_id, ik_id, kode_sub_cpmk } = body;

    const updatedSub = await prisma.subCpmk.update({
      where: { id: Number(id) },
      data: {
        deskripsi: deskripsi,
        cpmk_id: Number(cpmk_id),
        // Logika S2/S3: Jika ik_id tidak ada, set null di database
        ik_id: ik_id ? Number(ik_id) : null,
        kode_sub_cpmk: kode_sub_cpmk,
      },
    });

    return NextResponse.json({ success: true, data: updatedSub });
  } catch (err: any) {
    console.error("ERROR UPDATE SUB-CPMK:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// --- 2. FUNGSI HAPUS (DELETE) ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.subCpmk.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Sub-CPMK berhasil dihapus permanen dari database",
    });
  } catch (err: any) {
    console.error("ERROR DELETE SUB-CPMK:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
