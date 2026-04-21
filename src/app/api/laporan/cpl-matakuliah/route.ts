import { NextResponse } from "next/server";
import { CplService } from "@/services/cpl.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matakuliah_id, tahun_ajaran_ids } = body;

    if (!matakuliah_id) {
      return NextResponse.json({ error: "ID Matakuliah wajib diisi" }, { status: 400 });
    }

    // Memanggil mesin hitung pusat (Menggunakan Bobot Dinamis RPS)
    const result = await CplService.getMatakuliahReport(
      Number(matakuliah_id),
      tahun_ajaran_ids
    );

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Course Report Error:", error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}