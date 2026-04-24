import { NextResponse } from "next/server";
import { CplService } from "@/services/cpl.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mahasiswa_id, semester_ids } = body;

    if (!mahasiswa_id) {
      return NextResponse.json(
        { error: "Parameter mahasiswa_id sangat diperlukan" },
        { status: 400 }
      );
    }

    const reportData = await CplService.getMahasiswaReport(
      Number(mahasiswa_id),
      semester_ids && semester_ids.length > 0 ? semester_ids : undefined
    );

    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error("API Laporan Mahasiswa Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}