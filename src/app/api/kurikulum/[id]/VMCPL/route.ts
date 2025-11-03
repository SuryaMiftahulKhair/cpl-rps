// src/app/api/kurikulum/[id]/VMCPL/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // sesuaikan kalau prisma-mu ada di path lain

type PIRow = {
  area: string;         // AssasmentArea.nama
  piCode: string;       // PIGroup.kode_grup
  iloCode: string;      // CPL.kode_cpl
  ilo: string;          // CPL.deskripsi
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

    // Ambil semua PIGroup milik kurikulum beserta relasinya
    const groups = await prisma.pIGroup.findMany({
      where: { kurikulum_id: kurikulumId },
      include: {
        assasment: true,     // AssasmentArea (nama area)
        cpl: true,           // CPL[] (kode_cpl, deskripsi)
        indicators: true,    // PerformanceIndicator[] (deskripsi)
      },
      orderBy: { id: "asc" },
    });

    // Map ke bentuk baris tabel UI
    const rows: PIRow[] = groups.flatMap((g) => {
      const area = g.assasment?.nama ?? "-";
      const piCode = g.kode_grup;
      const indicators = (g.indicators ?? []).map((p) => p.deskripsi);

      // jika tidak ada CPL, tetap buat satu baris dummy agar PI & indikator terlihat
      const cpls = g.cpl && g.cpl.length > 0 ? g.cpl : [null];

      return cpls.map((c) => ({
        area,
        piCode,
        iloCode: c?.kode_cpl ?? "-",
        ilo: c?.deskripsi ?? "-",
        indicators,
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
