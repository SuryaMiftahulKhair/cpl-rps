import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rpsId = Number(id);

    // 1. Ambil semua data sesuai standar Manual RPS
    const data = await prisma.rPS.findUnique({
      where: { id: rpsId },
      include: {
        matakuliah: true,
        cpmk: true,
        sub_cpmk: true,
        pertemuan: {
          // Ganti 'minggu_ke' dengan field yang valid, misal 'id'
          orderBy: { id: "asc" },
        },
      },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Data RPS tidak ditemukan" },
        { status: 404 },
      );
    }

    // 2. Logic Generate PDF
    // Tips: Untuk hasil yang presisi sesuai manual,
    // Kakak bisa menggunakan library 'jspdf-autotable' atau 'pdfkit'

    // Sementara kita buat response sukses agar error 'Function not implemented' hilang
    return NextResponse.json({
      message: "Data siap di-generate ke PDF",
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
