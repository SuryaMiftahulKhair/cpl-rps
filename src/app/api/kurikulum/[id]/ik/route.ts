import { NextResponse, NextRequest} from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Baca Body (Hanya SATU KALI)
    const body = await req.json();
    const { kode_ik, deskripsi, cpl_id } = body;

    // 2. Validasi input sederhana
    if (!cpl_id) {
      return NextResponse.json({ error: "CPL ID wajib diisi" }, { status: 400 });
    }

    // 3. Simpan ke Database
    // Pastikan nama model prisma sesuai schema kakak ('ik' atau 'indikatorKinerja')
    // Berdasarkan schema terakhir kakak: model Ik { ... } -> prisma.ik
    const data = await prisma.ik.create({
      data: { 
        kode_ik, 
        deskripsi, 
        cpl_id: Number(cpl_id) // Ambil ID dari Body, bukan dari URL params
      }
    });

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("POST IK Error:", err); // Log error ke terminal
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}