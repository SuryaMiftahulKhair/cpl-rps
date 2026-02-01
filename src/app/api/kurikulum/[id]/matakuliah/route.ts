import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const kurikulumId = Number(id);

    // 1. Ambil prodiId dari query parameter
    const { searchParams } = new URL(req.url);
    const prodiId = searchParams.get("prodiId");

    const data = await prisma.mataKuliah.findMany({
      where: {
        kurikulum_id: kurikulumId,
        // 2. VALIDASI: Pastikan Kurikulum ini memang milik prodiId tersebut
        kurikulum: {
          prodi_id: prodiId ? Number(prodiId) : undefined,
        },
      },
      include: {
        rps: { select: { id: true, is_locked: true } },
        cpl: true,
        _count: {
          select: { kelas: true, cpl: true },
        },
      },
      orderBy: { semester: "asc" },
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("API GET Matkul Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const kurikulumId = Number(id);
    const body = await req.json();

    const { kode_mk, nama, sks, semester, sifat, cpl_ids, prodiId } = body;

    if (!kode_mk || !nama) {
      return NextResponse.json(
        { error: "Kode dan Nama MK wajib diisi" },
        { status: 400 },
      );
    }

    // 3. VALIDASI HAK AKSES: Cek apakah kurikulum tujuan sesuai dengan prodi user
    const checkKurikulum = await prisma.kurikulum.findFirst({
      where: {
        id: kurikulumId,
        prodi_id: prodiId ? Number(prodiId) : undefined,
      },
    });

    if (!checkKurikulum) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke kurikulum prodi ini!" },
        { status: 403 },
      );
    }

    const newMatkul = await prisma.mataKuliah.create({
      data: {
        kode_mk,
        nama,
        sks: Number(sks),
        semester: Number(semester),
        sifat,
        kurikulum_id: kurikulumId,
        cpl: {
          connect: Array.isArray(cpl_ids)
            ? cpl_ids.map((cplId: number) => ({ id: Number(cplId) }))
            : [],
        },
      },
    });

    return NextResponse.json({ success: true, data: newMatkul });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Kode Mata Kuliah sudah ada di database!" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
