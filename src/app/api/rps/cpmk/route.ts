import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rps_id, kode_cpmk, deskripsi, ik_ids } = body; // ik_ids adalah array [1, 2, 5]

    // Validasi
    if (!rps_id || !kode_cpmk) {
        return NextResponse.json({ error: "Data wajib diisi" }, { status: 400 });
    }

    const newCpmk = await prisma.cPMK.create({
      data: {
        rps_id: Number(rps_id),
        kode_cpmk,
        deskripsi,
        // MAGIC NYA DISINI: Hubungkan CPMK ke banyak IK sekaligus
        ik: {
            connect: Array.isArray(ik_ids) 
                ? ik_ids.map((id: number) => ({ id: Number(id) })) 
                : []
        }
      }
    });

    return NextResponse.json({ success: true, data: newCpmk });

  } catch (err: any) {
    console.error("Create CPMK Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}