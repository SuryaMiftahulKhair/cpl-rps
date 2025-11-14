import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // sesuaikan path prisma
import { z } from "zod";

// --- PERBAIKAN: Update fungsi parseId ---
function parseId(paramsId: string | undefined, nextUrl?: any) {
  if (paramsId) return Number(paramsId);
  try {
    // Fallback jika params.id tidak ada (bug Next.js)
    const url = nextUrl?.pathname ?? "";
    const segments = url.split('/');
    // Diharapkan URL: /api/kurikulum/2/pi-group
    const idIndex = segments.indexOf('kurikulum') + 1; 
    const id = segments[idIndex];
    return id ? Number(id) : NaN;
  } catch {
    return NaN;
  }
}

/**
 * GET handler untuk mengambil semua PI Group dalam satu kurikulum.
 * Digunakan oleh tab "Manajemen PI & Indikator".
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    // --- PERBAIKAN: Gunakan 'request' di parseId ---
    const kurikulumId = parseId(params?.id, (request as any).nextUrl);
    
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

// Skema Zod untuk validasi POST yang "simple" (dari PiGroupManagementModal)
const simpleCreateSchema = z.object({
  kode_grup: z.string().min(1, "Kode PI Group wajib diisi"),
  assesment_id: z.number().int().positive("Assasment Area wajib dipilih"),
});

// Skema Zod untuk validasi POST yang "kompleks" (dari TambahPIRowModal)
const complexCreateSchema = z.object({
  kodeGrup: z.string().min(1, "Kode PI Group wajib diisi"),
  assesmentId: z.number().int().positive("Assasment Area wajib dipilih"),
  indicators: z.array(
    z.object({
      deskripsi: z.string().min(1, "Deskripsi indikator wajib diisi"),
      cplId: z.number().int().positive("CPL wajib dipilih"),
    })
  ).min(1, "Minimal 1 indikator wajib ada"),
});


/**
 * POST handler untuk membuat PI Group BARU.
 * Bisa menangani 2 tipe body:
 * 1. Simple: (dari PiGroupManagementModal) { kode_grup, assesment_id }
 * 2. Kompleks: (dari TambahPIRowModal) { kodeGrup, assesmentId, indicators: [...] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    // --- PERBAIKAN: Gunakan 'req' di parseId ---
    const kurikulumId = parseId(params?.id, (request as any).nextUrl);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json(
        { error: "ID kurikulum tidak valid (harus integer)" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // --- PERBAIKAN: Validasi yang benar ---
    
    // Coba validasi sebagai "Kompleks"
    const complexParse = complexCreateSchema.safeParse(body);
    if (complexParse.success) {
      // Ini adalah request dari TambahPIRowModal
      const { assesmentId, kodeGrup, indicators } = complexParse.data;

      const result = await prisma.$transaction(async (tx) => {
        const newPiGroup = await tx.pIGroup.create({
          data: {
            kode_grup: kodeGrup,
            assesment_id: assesmentId,
            kurikulum_id: kurikulumId,
          },
        });

        const indicatorData = indicators.map(ind => ({
          deskripsi: ind.deskripsi,
          cpl_id: ind.cplId,
          pi_group_id: newPiGroup.id,
        }));

        await tx.performanceIndicator.createMany({
          data: indicatorData,
        });

        return newPiGroup;
      });

      return NextResponse.json(result, { status: 201 });
    }

    // Jika bukan "Kompleks", coba validasi sebagai "Simple"
    const simpleParse = simpleCreateSchema.safeParse(body);
    if (simpleParse.success) {
      // Ini adalah request dari PiGroupManagementModal
      const { kode_grup, assesment_id } = simpleParse.data;

      const newGroup = await prisma.pIGroup.create({
        data: {
          kode_grup,
          assesment_id,
          kurikulum_id: kurikulumId,
        },
      });
      return NextResponse.json(newGroup, { status: 201 });
    }

    // Jika keduanya gagal, berarti body-nya salah
    // Ini akan FIX error "Nama Area wajib diisi"
    return NextResponse.json(
      { error: "Body request tidak valid.", 
        detail: { 
          simpleError: simpleParse.error?.issues, 
          complexError: complexParse.error?.issues 
        } 
      }, 
      { status: 400 }
    );
    // ------------------------------------

  } catch (err: any) {
    console.error("POST /api/kurikulum/[id]/pi-group error:", err);
     if (err.code === 'P2002') {
      return NextResponse.json(
        { error: "Kode PI Group sudah ada. Gunakan kode lain." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Gagal membuat PI Group", detail: err.message },
      { status: 500 }
    );
  }
}