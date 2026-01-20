import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      rps_id, pekan_ke, kemampuan_akhir, bahan_kajian, 
      metode_pembelajaran, waktu, kriteria_penilaian, bobot_nilai 
    } = body;

    const newPertemuan = await prisma.rPSPertemuan.create({
      data: {
        rps_id: Number(rps_id),
        pekan_ke: Number(pekan_ke),
        kemampuan_akhir,        // Ini diisi Sub-CPMK
        bahan_kajian,           // Materi pembelajaran
        metode_pembelajaran,
        waktu,
        kriteria_penilaian,     // Indikator dan Kriteria (IK)
        bobot_nilai: Number(bobot_nilai) || 0
      }
    });

    return NextResponse.json({ success: true, data: newPertemuan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}