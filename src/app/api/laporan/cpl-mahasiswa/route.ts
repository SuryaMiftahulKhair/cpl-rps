import { NextResponse } from "next/server";
import { CplService } from "@/services/cpl.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mahasiswa_id, tahun_ajaran_ids } = body;

    if (!mahasiswa_id) {
      return NextResponse.json({ error: "ID Mahasiswa wajib diisi" }, { status: 400 });
    }

    // Memanggil mesin hitung pusat (Logika otomatis sinkron dengan Prodi)
    const result = await CplService.getMahasiswaReport(
      Number(mahasiswa_id),
      tahun_ajaran_ids
    );

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Student Report Error:", error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}