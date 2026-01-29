import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Pastikan semua angka dikonversi dengan benar
    const rps_id = Number(body.rps_id);
    const pekan_ke = Number(body.pekan_ke);
    const bobot_cpmk = Number(body.bobot_nilai); // Map dari 'bobot_nilai' ke 'bobot_cpmk'

    if (!rps_id || !pekan_ke) {
      return NextResponse.json(
        { error: "Data rps_id atau pekan_ke tidak valid" },
        { status: 400 },
      );
    }

    // 2. Gunakan Nama Kolom yang sesuai dengan Schema Prisma Kakak
    const pertemuan = await prisma.rPSPertemuan.create({
      data: {
        rps_id: rps_id,
        pekan_ke: pekan_ke,
        bobot_cpmk: bobot_cpmk,
        bahan_kajian: body.kemampuan_akhir, // Map kemampuan_akhir -> bahan_kajian
        pengalaman_belajar: body.kriteria_penilaian, // Map kriteria -> pengalaman_belajar
        waktu: body.metode_pembelajaran, // Map metode -> waktu
      },
    });

    return NextResponse.json({ success: true, data: pertemuan });
  } catch (error: any) {
    console.error("ERROR POST PERTEMUAN:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menyimpan: " + error.message,
      },
      { status: 500 },
    );
  }
}
