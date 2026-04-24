import { NextResponse } from "next/server";
import { CplService } from "@/services/cpl.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matakuliah_id, semester_ids } = body; 

    if (!matakuliah_id) {
      return NextResponse.json(
        { error: "Parameter matakuliah_id sangat diperlukan" },
        { status: 400 }
      );
    }

    const reportData = await CplService.getMatakuliahReport(
      Number(matakuliah_id),
      semester_ids && semester_ids.length > 0 ? semester_ids : undefined
    );

    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error("API Laporan Matakuliah Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}