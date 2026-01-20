import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mataKuliahId = Number(id);

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');
    const tahun = searchParams.get('tahun') || new Date().getFullYear().toString();
    const semester = searchParams.get('semester') || "1";

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
      return NextResponse.json({ success: true, data: listRps });
    }

    // ==========================================
    // KONDISI 2: DEFAULT (DETAIL / GET OR CREATE)
    // ==========================================
    
    // 1. Cek Matkul
    const matkul = await prisma.mataKuliah.findUnique({
      where: { id: mataKuliahId },
      include: {
        cpl: { include: { iks: true } }
      }
    });

    if (!matkul) return NextResponse.json({ error: "Mata kuliah tidak ditemukan" }, { status: 404 });

    // 2. Cari RPS yang sesuai dengan Matkul + Tahun + Semester (Untuk Laporan)
    // Kita tidak pakai upsert, tapi findFirst. Jika tidak ada, baru create.
    let rps = await prisma.rPS.findFirst({
      where: { 
        matakuliah_id: mataKuliahId,
        // Kita bisa tambahkan filter tahun di sini nanti jika field sudah ada
      },
      include: {
        cpmk: {
          include: { ik: true },
          orderBy: { kode_cpmk: 'asc' }
        }
      }
    });

    // 3. Jika belum ada RPS sama sekali, buatkan satu sebagai draft
    if (!rps) {
      rps = await prisma.rPS.create({
        data: {
          matakuliah_id: mataKuliahId,
          nomor_dokumen: `RPS-${matkul.kode_mk}-${tahun}-${semester}`,
          deskripsi: "Rencana Pembelajaran Semester...",
          nama_penyusun: "Dosen Pengampu",
        },
        include: {
          cpmk: { include: { ik: true }, orderBy: { kode_cpmk: 'asc' } }
        }
      });
    }

    // 4. Mapping Available IKs (Untuk Dropdown di Frontend)
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

    return NextResponse.json({
      success: true,
      data: {
        ...rps, // Mengembalikan object rps lengkap (termasuk id, nomor_dokumen, dll)
        available_iks: availableIks
      }
    });

  } catch (err: any) {
    console.error("GET RPS Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}