import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // sesuaikan path prisma
import { CPL, PerformanceIndicator } from "@prisma/client"; // Import tipe

// Tipe DTO untuk baris tabel
type PIRow = {
  area: string;       // AssasmentArea.nama
  piCode: string;     // PIGroup.kode_grup
  iloCode: string;    // CPL.kode_cpl
  ilo: string;        // CPL.deskripsi
  indicators: string[]; // PerformanceIndicator[].deskripsi
};

function parseId(paramsId?: string) {
  const n = Number(paramsId);
  return Number.isFinite(n) ? n : NaN;
}

export async function GET(
  _req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const kurikulumId = parseId(params?.id);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json(
        { error: "kurikulum id tidak valid (harus integer)" },
        { status: 400 }
      );
    }

    // Ambil semua PIGroup milik kurikulum
    const groups = await prisma.pIGroup.findMany({
      where: { kurikulum_id: kurikulumId },
      include: {
        assasment: true, // Relasi ke AssasmentArea (untuk 'area')
        
        // --- INI PERBAIKANNYA ---
        // Kita tidak bisa lagi 'include: { cpl: true }' karena relasi itu sudah dihapus.
        // Kita ambil 'cpl' melalui 'indicators'
        indicators: {
          include: {
            cpl: true, // Ambil CPL yang terhubung ke setiap indicator
          },
          orderBy: { id: 'asc' },
        },
        // ---------------------
      },
      orderBy: { id: "asc" },
    });

    // Map ke bentuk baris tabel UI
    // 'groups' sekarang memiliki tipe yang benar, 'g.cpl' tidak ada
    const rows: PIRow[] = groups.flatMap((g) => {
      const area = g.assasment?.nama ?? "-";
      const piCode = g.kode_grup;

      // --- LOGIKA MAPPING BARU (FIX) ---
      // Ini memperbaiki error 'Parameter 'c' implicitly has an 'any' type.'
      // Kita group semua indicator berdasarkan CPL-nya.
      const cplGroupMap = new Map<number, { cpl: CPL, indicators: PerformanceIndicator[] }>();

      // Loop semua indicator yang dimiliki PIGroup ini
      for (const indicator of g.indicators) {
        if (indicator.cpl) { // Hanya proses indicator yang terhubung ke CPL
          const cpl = indicator.cpl;
          if (!cplGroupMap.has(cpl.id)) {
            // Jika CPL ini baru, buat entri baru di Map
            cplGroupMap.set(cpl.id, { cpl: cpl, indicators: [] });
          }
          // Tambahkan indicator ke grup CPL yang sesuai
          // '!' aman digunakan di sini karena kita baru cek/buat entri di atas
          cplGroupMap.get(cpl.id)!.indicators.push(indicator);
        }
      }

      // Jika PI Group tidak punya indicator yang terhubung CPL,
      // (misal: PI Group baru dibuat tapi indicator-nya belum dipetakan ke CPL)
      // tetap tampilkan barisnya dengan CPL kosong.
      if (cplGroupMap.size === 0) {
        return [{
          area,
          piCode,
          iloCode: "-",
          ilo: "-",
          // Tampilkan semua indicator (walaupun tidak terhubung CPL)
          indicators: g.indicators.map(ind => ind.deskripsi), 
        }];
      }

      // Ubah Map (data yang sudah ter-grup) menjadi array PIRow
      return Array.from(cplGroupMap.values()).map(grouped => ({
        area,
        piCode,
        iloCode: grouped.cpl.kode_cpl,
        ilo: grouped.cpl.deskripsi,
        // Ambil deskripsi dari indicator yang sudah di-grup
        indicators: grouped.indicators.map(ind => ind.deskripsi),
      }));
      // -------------------------------
    });

    return NextResponse.json(rows, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("GET /api/kurikulum/[id]/VMCPL error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}