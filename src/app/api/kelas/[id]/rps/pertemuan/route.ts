import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// POST: Tambah/Update Pertemuan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rps_id, pekan_ke, kemampuan_akhir, bahan_kajian, metode, waktu, pengalaman, kriteria, bobot } = body;

    if (!rps_id || !pekan_ke) return NextResponse.json({ error: "Data wajib kurang" }, { status: 400 });

    // Cek apakah pertemuan di pekan ini sudah ada?
    const existing = await prisma.rPSPertemuan.findFirst({
        where: { rps_id, pekan_ke }
    });

    let result;
    if (existing) {
        result = await prisma.rPSPertemuan.update({
            where: { id: existing.id },
            data: { kemampuan_akhir, bahan_kajian, metode_pembelajaran: metode, waktu, pengalaman_belajar: pengalaman, kriteria_penilaian: kriteria, bobot_nilai: Number(bobot) }
        });
    } else {
        result = await prisma.rPSPertemuan.create({
            data: { rps_id, pekan_ke, kemampuan_akhir, bahan_kajian, metode_pembelajaran: metode, waktu, pengalaman_belajar: pengalaman, kriteria_penilaian: kriteria, bobot_nilai: Number(bobot) }
        });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}