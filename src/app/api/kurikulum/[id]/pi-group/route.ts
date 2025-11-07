import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // sesuaikan path prisma

function parseId(paramsId?: string) {
  const n = Number(paramsId);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * GET handler untuk mengambil semua PI Group dalam satu kurikulum.
 * Digunakan oleh tab "Manajemen PI & Indikator".
 */
export async function GET(
  _req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const kurikulumId = parseId(params?.id);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json(
        { error: "ID kurikulum tidak valid (harus integer)" },
        { status: 400 }
      );
    }

    // Ambil data PI Group
    const groups = await prisma.pIGroup.findMany({
      where: { kurikulum_id: kurikulumId },
      include: {
        assasment: true, // Untuk menampilkan nama Area
        // Hitung jumlah indikator yang dimiliki
        _count: { select: { indicators: true } },
      },
      orderBy: { kode_grup: "asc" },
    });

    return NextResponse.json(groups);
  } catch (err: any) {
    console.error("GET /api/kurikulum/[id]/pi-group error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

/**
 * POST handler untuk membuat PI Group BARU beserta Performance Indicator-nya
 * dalam satu transaksi (untuk modal "Kompleks")
 * ATAU
 * hanya membuat PI Group (untuk modal "Manajemen")
 */
export async function POST(
  req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const kurikulumId = parseId(params?.id);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json(
        { error: "ID kurikulum tidak valid (harus integer)" },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    // Cek apakah ini dari modal "Kompleks" (ada 'indicators')
    // atau modal "Manajemen" (tidak ada 'indicators')
    const {
      assesment_id, // dari modal manajemen
      kode_grup,    // dari modal manajemen
      assesmentId,  // dari modal kompleks
      kodeGrup,     // dari modal kompleks
      indicators,   // dari modal kompleks
    } = body;

    // --- Kasus 1: Modal "Kompleks" (TambahPIRowModal) ---
    if (indicators && Array.isArray(indicators)) {
      const finalAssesmentId = Number(assesmentId);
      const finalKodeGrup = String(kodeGrup);

      if (!finalAssesmentId || !finalKodeGrup || indicators.length === 0) {
        return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        // A: Buat PIGroup
        const newPiGroup = await tx.pIGroup.create({
          data: {
            kode_grup: finalKodeGrup,
            assesment_id: finalAssesmentId,
            kurikulum_id: kurikulumId,
          },
        });

        // B: Siapkan data Indikator
        const indicatorData = indicators.map(
          (ind: { deskripsi: string; cplId: number | string }) => {
            if (!ind.deskripsi || !ind.cplId) {
              throw new Error("Data indikator tidak lengkap (deskripsi/cplId).");
            }
            return {
              deskripsi: ind.deskripsi,
              cpl_id: Number(ind.cplId),
              pi_group_id: newPiGroup.id,
            };
          }
        );

        // C: Buat semua Indikator
        await tx.performanceIndicator.createMany({
          data: indicatorData,
        });

        return newPiGroup;
      });

      return NextResponse.json(result, { status: 201 });
    }

    // --- Kasus 2: Modal "Manajemen" (PiGroupManagementModal) ---
    if (assesment_id && kode_grup) {
      const newPiGroup = await prisma.pIGroup.create({
        data: {
          kode_grup: String(kode_grup),
          assesment_id: Number(assesment_id),
          kurikulum_id: kurikulumId,
        },
      });
      return NextResponse.json(newPiGroup, { status: 201 });
    }
    
    // Jika body tidak cocok
    return NextResponse.json({ error: "Body request tidak valid" }, { status: 400 });

  } catch (err: any) {
    console.error("POST /api/kurikulum/[id]/pi-group error:", err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: "Kode PI Group sudah ada." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Gagal membuat PI Group", detail: err.message },
      { status: 500 }
    );
  }
}