import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matakuliah_id, keterangan } = body;

    // Ambil data matkul untuk generate nomor dokumen
    const matkul = await prisma.mataKuliah.findUnique({
      where: { id: Number(matakuliah_id) }
    });

    if (!matkul) return NextResponse.json({ error: "Matkul tidak valid" }, { status: 404 });

    // Buat RPS Baru
    const newRps = await prisma.rPS.create({
      data: {
        matakuliah_id: Number(matakuliah_id),
        deskripsi: keterangan,
        // Format Nomor Dokumen: RPS-[KODE]-TIMESTAMP (biar unik)
        nomor_dokumen: `RPS-${matkul.kode_mk}-${Date.now().toString().slice(-4)}`, 
        is_locked: false
      }
    });

    return NextResponse.json({ success: true, data: newRps });

  } catch (err: any) {
    console.error("Create RPS Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}