import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rps_id, kode_cpmk, deskripsi, ik_id } = body;

    // Simpan ke Database
    const newCpmk = await prisma.cPMK.create({
      data: {
        kode_cpmk: kode_cpmk,
        deskripsi: deskripsi,
        bobot_to_cpl: 0.0, // WAJIB ada karena di model bukan 'Float?'
        is_locked: false, // Default di model true, kita set false agar bisa diedit

        // Relasi Many-to-Many ke RPS
        rps: {
          connect: { id: Number(rps_id) },
        },

        // Relasi ke IK (Indikator Kinerja)
        ik: ik_id
          ? {
              connect: { id: Number(ik_id) },
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, data: newCpmk });
  } catch (error: any) {
    console.error("CREATE CPMK ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal simpan: " + error.message,
      },
      { status: 500 },
    );
  }
}
