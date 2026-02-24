import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rpsId = Number(id);

    // 1. Ambil data dengan relasi yang VALID sesuai schema.prisma
    const data = await prisma.rPS.findUnique({
      where: { id: rpsId },
      include: {
        matakuliah: true,
        cpmk: {
          include: {
            sub_cpmk: true, // SubCpmk diambil lewat CPMK (Sesuai Schema)
          },
        },
        pertemuan: {
          // Gunakan 'pekan_ke' (sesuai schema) bukan 'id' agar urutan rapi
          orderBy: { pekan_ke: "asc" },
          include: {
            sub_cpmk: true, // Ambil juga SubCpmk yang dibahas di tiap pertemuan
          },
        },
        ikas: true, // Relasi many-to-many ke model Ik
      },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Data RPS tidak ditemukan" },
        { status: 404 },
      );
    }

    // 2. Response Sukses
    // Data ini sekarang sudah lengkap untuk di-render ke PDF di sisi Frontend
    return NextResponse.json({
      success: true,
      message: "Data berhasil ditarik sesuai schema",
      data: data,
    });
  } catch (error: any) {
    console.error("BUILD ERROR FIX:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
