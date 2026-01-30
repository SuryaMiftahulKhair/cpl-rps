import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rps_id, kode_cpmk, deskripsi, ik_id, bobot } = body;

    if (!rps_id || !kode_cpmk) {
        return NextResponse.json({ error: "Data wajib diisi" }, { status: 400 });
    }

    const newCpmk = await prisma.cPMK.create({
      data: {
        kode_cpmk,
        deskripsi,
        bobot_to_cpl: bobot ? parseFloat(bobot) : 0, 

        rps: {
            connect: { id: Number(rps_id) }
        },

        ik: ik_id ? { connect: [{ id: Number(ik_id) }] } : undefined
      }
    });

    return NextResponse.json({ success: true, data: newCpmk });

  } catch (err: any) {
    console.error("Create CPMK Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}