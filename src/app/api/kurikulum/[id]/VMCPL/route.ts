import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // sesuaikan kalau prisma-mu ada di path lain
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
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    // `params` may be an async object in some Next.js runtimes — await it
    const resolvedParams = await (params as any);
    const kurikulumId = parseId(resolvedParams?.id); // Ini sekarang akan aman
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
        
        // --- Ini sudah benar ---
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
    const rows: PIRow[] = groups.flatMap((g) => {
      const area = g.assasment?.nama ?? "-";
      const piCode = g.kode_grup;

      // --- LOGIKA MAPPING BARU (Ini sudah benar) ---
      const cplGroupMap = new Map<number, { cpl: CPL, indicators: PerformanceIndicator[] }>();

      for (const indicator of g.indicators) {
        if (indicator.cpl) {
          const cpl = indicator.cpl;
          if (!cplGroupMap.has(cpl.id)) {
            cplGroupMap.set(cpl.id, { cpl: cpl, indicators: [] });
          }
          cplGroupMap.get(cpl.id)!.indicators.push(indicator);
        }
      }

      if (cplGroupMap.size === 0) {
        return [{
          area,
          piCode,
          iloCode: "-",
          ilo: "-",
          indicators: g.indicators.map(ind => ind.deskripsi), 
        }];
      }

      return Array.from(cplGroupMap.values()).map(grouped => ({
        area,
        piCode,
        iloCode: grouped.cpl.kode_cpl,
        ilo: grouped.cpl.deskripsi,
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