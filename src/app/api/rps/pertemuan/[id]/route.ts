import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// UPDATE
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    // Ambil data dari body, abaikan rps_id karena tidak berubah
    const { 
        pekan_ke, kemampuan_akhir, bahan_kajian, metode_pembelajaran, 
        waktu, pengalaman_belajar, kriteria_penilaian, bobot_nilai 
    } = body;

    const updated = await prisma.rPSPertemuan.update({
      where: { id: Number(id) },
      data: {
        pekan_ke: Number(pekan_ke),
        kemampuan_akhir,
        bahan_kajian,
        metode_pembelajaran,
        waktu,
        pengalaman_belajar,
        kriteria_penilaian,
        bobot_nilai: Number(bobot_nilai)
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.rPSPertemuan.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}