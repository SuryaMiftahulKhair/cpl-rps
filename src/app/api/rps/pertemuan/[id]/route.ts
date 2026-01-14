import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// UPDATE Pertemuan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Kita update semua field yang dikirim
    const updated = await prisma.rPSPertemuan.update({
      where: { id: Number(id) },
      data: {
        pekan_ke: Number(body.pekan_ke),
        kemampuan_akhir: body.kemampuan_akhir,
        bahan_kajian: body.bahan_kajian,
        metode_pembelajaran: body.metode_pembelajaran,
        waktu: body.waktu,
        kriteria_penilaian: body.kriteria_penilaian,
        bobot_nilai: Number(body.bobot_nilai) || 0
      }
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE Pertemuan
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

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}