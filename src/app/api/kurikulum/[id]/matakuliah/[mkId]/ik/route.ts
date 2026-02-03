// src/app/api/kurikulum/[id]/matakuliah/[mkId]/ik/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mkId: string }> }, // Mengambil mkId
) {
  try {
    const { mkId } = await params;
    const body = await req.json();
    const { kode_ik, action } = body;

    // 1. Cari data IK berdasarkan kode_ik
    const ikData = await prisma.ik.findUnique({
      where: { kode_ik: kode_ik },
    });

    if (!ikData) {
      return NextResponse.json(
        { error: "IK tidak ditemukan" },
        { status: 404 },
      );
    }

    // 2. Update relasi 'iks' di model MataKuliah sesuai schema terbaru
    const updatedMK = await prisma.mataKuliah.update({
      where: { id: Number(mkId) },
      data: {
        iks: {
          [action === "add" ? "connect" : "disconnect"]: { id: ikData.id },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERROR CENTANG:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
