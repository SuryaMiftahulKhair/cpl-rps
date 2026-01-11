import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mataKuliahId = Number(id);

    // Ambil Parameter URL (Contoh: ?mode=history)
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');

    // ==========================================
    // KONDISI 1: JIKA MINTA HISTORY (LIST DATA)
    // ==========================================
    if (mode === 'history') {
      const listRps = await prisma.rPS.findMany({
        where: { matakuliah_id: mataKuliahId },
        orderBy: { createdAt: 'desc' },
        include: {
          matakuliah: { select: { nama: true, kode_mk: true } }
        }
      });
      // Mengembalikan ARRAY
      return NextResponse.json({ success: true, data: listRps });
    }

    // ==========================================
    // KONDISI 2: DEFAULT (DETAIL / UPSERT)
    // ==========================================
    
    // 1. Cek Matkul
    const matkul = await prisma.mataKuliah.findUnique({
      where: { id: mataKuliahId },
      include: {
        cpl: { include: { iks: true } }
      }
    });

    if (!matkul) {
      return NextResponse.json({ error: "Mata kuliah tidak ditemukan" }, { status: 404 });
    }

    // 2. Upsert RPS (Cari atau Buat Baru)
    const rps = await prisma.rPS.upsert({
      where: { matakuliah_id: mataKuliahId },
      create: {
        matakuliah_id: mataKuliahId,
        nomor_dokumen: `RPS-${matkul.kode_mk}-${new Date().getFullYear()}`,
        deskripsi: "Rencana Pembelajaran Semester...",
      },
      update: {},
      include: {
        cpmk: {
          include: { ik: true },
          orderBy: { kode_cpmk: 'asc' }
        }
      }
    });

    // 3. Mapping Available IKs
    const availableIks: any[] = [];
    matkul.cpl.forEach(c => {
      if (c.iks) {
        c.iks.forEach(item => {
          availableIks.push({
            id: item.id,
            kode: item.kode_ik,
            deskripsi: item.deskripsi,
            cpl_kode: c.kode_cpl
          });
        });
      }
    });

    // Mengembalikan OBJECT Single
    return NextResponse.json({
      success: true,
      data: {
        rps_id: rps.id,
        nomor_dokumen: rps.nomor_dokumen,
        deskripsi: rps.deskripsi,
        cpmk_list: rps.cpmk,
        available_iks: availableIks
      }
    });

  } catch (err: any) {
    console.error("GET RPS Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}