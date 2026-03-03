import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET() {
  try {
    // Mengambil data Program Studi dari database
    const prodis = await prisma.programStudi.findMany({
      select: {
        id: true,
        nama: true,
        jenjang: true,
      },
      orderBy: [
        { jenjang: "asc" }, // S1 dulu, baru S2, lalu S3
        { nama: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: prodis,
    });
  } catch (err: any) {
    console.error("API Public Prodi Error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar program studi" },
      { status: 500 },
    );
  }
}
