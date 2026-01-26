// src/app/api/kurikulum/[id]/VMCPL/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kurikulumId = Number(id);

    // 1. Cek Session
    const session = await getSession();
    if (!session || !session.prodiId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Ambil Data Kurikulum beserta CPL, IK, dan Assessment Area
    const kurikulum = await prisma.kurikulum.findUnique({
      where: { id: kurikulumId },
      include: {
        cpl: {
          include: {
            iks: true, // Ambil IK di dalam CPL
          },
          orderBy: { kode_cpl: 'asc' }
        },
        AssasmentArea: {
          orderBy: { nama: 'asc' }
        }
      }
    });

    if (!kurikulum) {
      return NextResponse.json({ error: "Kurikulum tidak ditemukan" }, { status: 404 });
    }

    // Security: Pastikan kurikulum ini milik prodi user yg login
    if (kurikulum.prodi_id !== Number(session.prodiId)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: kurikulum });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Bagian PATCH untuk Update Visi Misi Kurikulum
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { visi, misi } = await req.json();
    const kurikulumId = parseInt(params.id);

    const updated = await prisma.kurikulum.update({
      where: { id: kurikulumId },
      data: { 
        visi: visi, 
        misi: misi // Simpan array misi langsung ke kolom Json
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal update Visi Misi Kurikulum" }, { status: 500 });
  }
}