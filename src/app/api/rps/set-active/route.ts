import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { rpsId, matakuliahId } = await req.json();

    // TRANSAKSI: Memastikan kedua proses ini berhasil atau gagal bersamaan
    await prisma.$transaction([
      // 1. Matikan semua RPS untuk mata kuliah ini
      prisma.rPS.updateMany({
        where: { matakuliah_id: Number(matakuliahId) },
        data: { is_active: false },
      }),
      // 2. Aktifkan hanya satu RPS yang dipilih
      prisma.rPS.update({
        where: { id: Number(rpsId) },
        data: { is_active: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "RPS Aktif berhasil diperbarui",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
