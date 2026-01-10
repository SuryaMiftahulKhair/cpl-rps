import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matakuliahId: string }> }
) {
  try {
    // 1. Ambil ID Matkul
    const { matakuliahId } = await params;
    const idMk = Number(matakuliahId);

    // 2. Cek Session
    const session = await getSession();
    if (!session || !session.prodiId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userProdiId = Number(session.prodiId);

    // 3. Query RPS dengan Filter Berantai (RPS -> Matkul -> Kurikulum -> Prodi)
    const rpsList = await prisma.rPS.findMany({
      where: {
        matakuliah_id: idMk, // Filter 1: RPS milik Matkul ini
        
        // Filter 2 (SECURITY): Pastikan Matkul ini milik Prodi User
        matakuliah: {
            kurikulum: {
                prodi_id: userProdiId 
            }
        }
      },
      orderBy: {
        updatedAt: 'desc' 
      },
      include: {
        _count: {
          select: { pertemuan: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: rpsList });

  } catch (err: any) {
    console.error("Get Riwayat RPS Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}