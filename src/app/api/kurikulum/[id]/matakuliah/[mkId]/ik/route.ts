import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mkId: string }> },
) {
  try {
    const { mkId } = await params;
    const body = await req.json();
    const { kode_ik, action } = body;

    // Cari ID Indikator Kinerja berdasarkan kode_ik
    const ik = await prisma.ik.findUnique({
      where: { kode_ik: kode_ik },
    });

    if (!ik)
      return NextResponse.json(
        { error: "IK tidak ditemukan" },
        { status: 404 },
      );

    const updatedMK = await prisma.mataKuliah.update({
      where: { id: Number(mkId) },
      data: {
        // Jika action 'add', maka connect. Jika 'remove', maka disconnect.
        cpl: {
          [action === "add" ? "connect" : "disconnect"]: { id: ik.cpl_id },
        },
        // Jika Kakak punya relasi langsung ke IK (opsional sesuai schema)
        // iks: { [action === "add" ? "connect" : "disconnect"]: { id: ik.id } }
      },
    });

    return NextResponse.json({ success: true, data: updatedMK });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
