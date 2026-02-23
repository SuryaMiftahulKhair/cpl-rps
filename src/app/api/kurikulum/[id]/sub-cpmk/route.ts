import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { cpmk_id, kode_sub_cpmk, deskripsi, ik_id } = body;

    if (!cpmk_id || !kode_sub_cpmk || !deskripsi || !ik_id) {
      return NextResponse.json({ error: "Data (termasuk IK) wajib diisi" }, { status: 400 });
    }

    const newSubCpmk = await prisma.subCpmk.create({
      data: {
        kode_sub_cpmk: kode_sub_cpmk, 
        deskripsi: deskripsi,
        cpmk: {
          connect: { id: Number(cpmk_id) },
        },
        ik: { 
          connect: { id: Number(ik_id) }
        }
      },
    });

    return NextResponse.json({ success: true, data: newSubCpmk });
  } catch (err: any) {
    console.error("Create Sub-CPMK Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}