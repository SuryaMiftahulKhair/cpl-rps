import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { z } from "zod";

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
        { error: "ID kurikulum tidak valid (harus integer)" },
        { status: 400 }
      );
    }

    const groups = await prisma.pIGroup.findMany({
      where: { kurikulum_id: kurikulumId },
      include: {
        assasment: true,
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

// Skema Zod
const simpleCreateSchema = z.object({
  kode_grup: z.string().min(1, "Kode PI Group wajib diisi"),
  assesment_id: z.number().int().positive("Assasment Area wajib dipilih"),
});

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


export async function POST(
  req: NextRequest,
  { params }: { params: { id?: string } } // <-- PERBAIKAN: Pakai 'id'
) {
  try {
    // --- PERBAIKAN: Baca 'params.id' ---
    const kurikulumId = parseId(params.id, (req as any).nextUrl);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json(
        { error: "ID kurikulum tidak valid (harus integer)" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const complexParse = complexCreateSchema.safeParse(body);
    if (complexParse.success) {
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

    const simpleParse = simpleCreateSchema.safeParse(body);
    if (simpleParse.success) {
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

    return NextResponse.json(
      { error: "Body request tidak valid.", 
        detail: { 
          simpleError: simpleParse.error?.issues, 
          complexError: complexParse.error?.issues 
        } 
      }, 
      { status: 400 }
    );

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