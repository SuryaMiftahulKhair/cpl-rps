import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rps_id, kode_cpmk, deskripsi, ik_id } = body;

    // 1. Validasi
    if (!rps_id || !kode_cpmk) {
        return NextResponse.json({ error: "Data wajib diisi" }, { status: 400 });
    }

    // 2. Simpan ke Database (FIXED)
    const newCpmk = await prisma.cPMK.create({
      data: {
        // HAPUS rps_id KARENA TIDAK ADA KOLOMNYA
        kode_cpmk,
        deskripsi,
        
        // HUBUNGKAN KE RPS (Relasi Many-to-Many)
        rps: {
            connect: { id: Number(rps_id) }
        },

        // HUBUNGKAN KE IK (Relasi Many-to-Many)
        // Gunakan Array [{ id: ... }] 
        ik: ik_id ? { connect: [{ id: Number(ik_id) }] } : undefined
      }
    });

    return NextResponse.json({ success: true, data: newCpmk });

  } catch (err: any) {
    console.error("Create CPMK Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}