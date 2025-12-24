import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

function parseId(paramsId: string | undefined) {
  const n = Number(paramsId);
  return Number.isFinite(n) ? n : NaN;
}

// GET: Ambil data RPS lengkap dengan pertemuannya
export async function GET(req: NextRequest, { params }: { params: { kelasId?: string } }) {
  try {
    const kelasId = parseId(params.kelasId);
    if (Number.isNaN(kelasId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const rps = await prisma.rPS.findUnique({
      where: { kelas_id: kelasId },
      include: {
        pertemuan: { orderBy: { pekan_ke: 'asc' } }
      }
    });

    // Jika belum ada, kembalikan object kosong (jangan error 404, biar frontend bisa handle form kosong)
    return NextResponse.json(rps || {});
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Simpan/Update RPS (Upsert)
export async function POST(req: NextRequest, { params }: { params: { kelasId?: string } }) {
  try {
    const kelasId = parseId(params.kelasId);
    if (Number.isNaN(kelasId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const { deskripsi, materi_pembelajaran, pustaka_utama, pustaka_pendukung } = body;

    const rps = await prisma.rPS.upsert({
      where: { kelas_id: kelasId },
      update: {
        deskripsi, materi_pembelajaran, pustaka_utama, pustaka_pendukung
      },
      create: {
        kelas_id: kelasId,
        deskripsi, materi_pembelajaran, pustaka_utama, pustaka_pendukung
      }
    });

    return NextResponse.json(rps);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}