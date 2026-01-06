import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma"; // Pastikan path import ini benar

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matakuliahId: string }> }
) {
  try {
    // 1. Await Params (Next.js 15)
    const { matakuliahId } = await params;
    const id = Number(matakuliahId);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID Mata Kuliah tidak valid" }, { status: 400 });
    }

    // 2. Query ke Tabel RPS (Bukan Kelas lagi)
    // Kita cari semua RPS yang punya matakuliah_id tersebut
    const rpsList = await prisma.rPS.findMany({
      where: {
        matakuliah_id: id
      },
      orderBy: {
        updatedAt: 'desc' // Urutkan dari yang paling baru diupdate
      },
      include: {
        // Kita hitung jumlah pertemuan untuk ditampilkan di List Card
        _count: {
          select: { pertemuan: true }
        }
      }
    });

    // 3. Return Data
    return NextResponse.json({ success: true, data: rpsList });

  } catch (err: any) {
    console.error("Get Riwayat RPS Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}