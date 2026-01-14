import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Destructure data sesuai form frontend
    const { 
      rps_id, pekan_ke, kemampuan_akhir, bahan_kajian, 
      metode_pembelajaran, waktu, kriteria_penilaian, bobot_nilai 
    } = body;

    // Validasi dasar
    if (!rps_id || !pekan_ke) {
        return NextResponse.json({ error: "RPS ID dan Pekan Ke wajib diisi" }, { status: 400 });
    }

    const newPertemuan = await prisma.rPSPertemuan.create({
      data: {
        rps_id: Number(rps_id),
        pekan_ke: Number(pekan_ke),
        kemampuan_akhir,        // Ini Sub-CPMK
        bahan_kajian,           // Ini Materi
        metode_pembelajaran,
        waktu,
        kriteria_penilaian,     // Ini Indikator (IK)
        bobot_nilai: Number(bobot_nilai) || 0
      }
    });

    return NextResponse.json({ success: true, data: newPertemuan });

  } catch (err: any) {
    console.error("Create Pertemuan Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}