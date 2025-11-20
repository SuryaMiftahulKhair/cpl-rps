import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { CPL, PerformanceIndicator } from "@prisma/client";

type PIRow = {
  area: string;       
  piCode: string;     
  iloCode: string;    
  ilo: string;        
  indicators: string[]; 
};

// Fungsi parseId baru
function parseId(paramsId: string | undefined, nextUrl?: any) {
  if (paramsId) return Number(paramsId);
  try {
    const url = nextUrl?.pathname ?? "";
    const segments = url.split('/');
    const idIndex = segments.indexOf('kurikulum') + 1; 
    const id = segments[idIndex];
    return id ? Number(id) : NaN;
  } catch {
    return NaN;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string } } // <-- PERBAIKAN: Pakai 'id'
) {
  try {
    // --- PERBAIKAN: Baca 'params.id' ---
    const kurikulumId = parseId(params.id, (request as any).nextUrl);
    
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json(
        { error: "kurikulum id tidak valid (harus integer)" },
        { status: 400 }
      );
    }

    const groups = await prisma.pIGroup.findMany({
      where: { kurikulum_id: kurikulumId },
      include: {
        assasment: true,
        indicators: {
          include: {
            cpl: true,
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: "asc" },
    });

    const rows: PIRow[] = groups.flatMap((g) => {
      const area = g.assasment?.nama ?? "-";
      const piCode = g.kode_grup;
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