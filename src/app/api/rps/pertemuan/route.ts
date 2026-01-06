import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      rps_id, 
      pekan_ke, 
      kemampuan_akhir, 
      bahan_kajian, 
      metode_pembelajaran, 
      waktu, 
      pengalaman_belajar, 
      kriteria_penilaian, 
      bobot_nilai 
    } = body;

    if (!rps_id || !pekan_ke) {
      return NextResponse.json({ success: false, error: "ID RPS dan Pekan Ke wajib diisi" }, { status: 400 });
    }

    const newPertemuan = await prisma.rPSPertemuan.create({
      data: {
        rps_id: Number(rps_id),
        pekan_ke: Number(pekan_ke),
        kemampuan_akhir,
        bahan_kajian,
        metode_pembelajaran,
        waktu,
        pengalaman_belajar,
        kriteria_penilaian,
        bobot_nilai: Number(bobot_nilai) || 0
      }
    });

    return NextResponse.json({ success: true, data: newPertemuan });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}