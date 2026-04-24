import { NextResponse } from "next/server";
import { MahasiswaService } from "@/services/mahasiswa.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await MahasiswaService.importMahasiswa(body.dataMahasiswa);

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil memproses ${result.processed} data mahasiswa.` 
    });
  } catch (error: any) {
    console.error("API Import Mahasiswa Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}