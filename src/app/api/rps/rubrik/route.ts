import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rps_id, kode_rubrik, nama_rubrik, deskripsi } = body;

    // Sesuai manual: Kode (misal R-1), Nama Rubrik, dan Isi Kriteria [cite: 342, 343, 344]
    const newRubrik = await prisma.rubrik.create({
      data: {
        rps_id: Number(rps_id),
        kode_rubrik, 
        nama_rubrik, 
        deskripsi    
      }
    });

    return NextResponse.json({ success: true, data: newRubrik });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}