import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rps_id = Number(body.rps_id);
    const pekan_ke = Number(body.pekan_ke);
    const bobot_cpmk = Number(body.bobot_nilai);
    const cpmk_id = body.cpmk_id ? Number(body.cpmk_id) : null; // Ambil cpmk_id dari body

    if (!rps_id || !pekan_ke) {
      return NextResponse.json(
        { error: "Data rps_id atau pekan_ke tidak valid" },
        { status: 400 },
      );
    }

    const pertemuan = await prisma.rPSPertemuan.create({
      data: {
        rps_id: rps_id,
        pekan_ke: pekan_ke,
        bobot_cpmk: bobot_cpmk,
        bahan_kajian: body.kemampuan_akhir,
        pengalaman_belajar: body.kriteria_penilaian,
        waktu: body.metode_pembelajaran,

        // KUNCI PERBAIKAN: Hubungkan ke CPMK agar relasi terisi
        // Menggunakan Many-to-Many connect
        cpmk: cpmk_id
          ? {
              connect: { id: cpmk_id },
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, data: pertemuan });
  } catch (error: any) {
    console.error("ERROR POST PERTEMUAN:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan: " + error.message },
      { status: 500 },
    );
  }
}
