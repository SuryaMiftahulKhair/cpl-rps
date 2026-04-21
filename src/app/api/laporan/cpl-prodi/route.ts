import { NextResponse, NextRequest } from "next/server";
import { CplService } from "@/services/cpl.service";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("DEBUG: Payload masuk ke API Prodi:", body);

    let kId = body.kurikulum_id || body.kurikulumId;
    const taIdsRaw = body.tahun_ajaran_ids || body.tahunAjaranIds || body.semester_ids;

    // 1. Normalisasi Tahun Ajaran (Pindah ke atas agar bisa digunakan untuk pelacakan)
    let taIds: number[] = [];
    if (Array.isArray(taIdsRaw)) {
      taIds = taIdsRaw.map(Number).filter(id => !isNaN(id));
    } else if (taIdsRaw) {
      taIds = [Number(taIdsRaw)];
    }

    // --- CADANGAN SUPER CERDAS (AUTO-DETECT KURIKULUM) ---
    if (!kId) {
      if (taIds.length > 0) {
        console.log("DEBUG: kId kosong. Melacak kurikulum dari data jadwal kelas di semester terpilih...");
        
        // Cari 1 kelas saja yang ada di semester yang dipilih user
        const kelasReferensi = await prisma.kelas.findFirst({
          where: { tahun_ajaran_id: { in: taIds } },
          include: { matakuliah: true }
        });

        if (kelasReferensi?.matakuliah?.kurikulum_id) {
          kId = kelasReferensi.matakuliah.kurikulum_id;
          console.log(`DEBUG: BINGO! Menggunakan Kurikulum ID ${kId} yang dipakai oleh MK: ${kelasReferensi.matakuliah.nama}`);
        }
      }
      
      // Jika semester tersebut benar-benar tidak ada jadwal kelas sama sekali
      if (!kId) {
        console.log("DEBUG: Tidak ada kelas. Mengambil Kurikulum pertama (terlama) sebagai default...");
        const defaultKurikulum = await prisma.kurikulum.findFirst({
          orderBy: { id: 'asc' }, // Mengambil ID terkecil (biasanya data master/asli ada di sini)
          select: { id: true }
        });
        kId = defaultKurikulum?.id;
      }
    }

    // 2. Validasi Akhir
    if (!kId) {
      return NextResponse.json(
        { success: false, error: "Sistem gagal menemukan ID Kurikulum." }, 
        { status: 400 }
      );
    }

    // 3. Eksekusi Mesin Hitung Utama
    const result = await CplService.getProdiReport(Number(kId), taIds);

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error("CRITICAL ERROR API PRODI:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal pada server" }, 
      { status: 500 }
    );
  }
}