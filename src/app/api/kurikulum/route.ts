// src/app/api/kurikulum/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const urlProdiId = searchParams.get("prodiId");

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- PERBAIKAN LOGIKA DI SINI ---
    // Pastikan kita paksa ambil dari URL dulu.
    // Jika URL kosong, baru kita cek session.
    // Kalau session juga kosong (misal superadmin), kita beri error atau default.
    let finalProdiId: number | null = null;

    if (urlProdiId) {
      finalProdiId = Number(urlProdiId);
    } else if (session.prodiId) {
      finalProdiId = Number(session.prodiId);
    }

    // Debugging di Terminal VSCode (Cek angka yang muncul di sini!)
    console.log("API Kurikulum - ProdiID yang digunakan:", finalProdiId);

    if (!finalProdiId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Prodi ID tidak ditemukan. Pastikan sudah memilih Prodi di Sidebar.",
        },
        { status: 400 },
      );
    }

    const data = await prisma.kurikulum.findMany({
      where: {
        prodi_id: finalProdiId,
      },
      include: {
        _count: {
          select: {
            cpl: true,
            mataKuliah: true,
          },
        },
        programStudi: true,
      },
      orderBy: {
        tahun: "desc",
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("API Kurikulum Error:", err);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { nama, tahun, prodiId } = body; // Ambil prodiId langsung dari body (lebih aman)

    // Prioritas: Body > URL > Session
    const { searchParams } = new URL(req.url);
    const urlProdiId = searchParams.get("prodiId");

    const targetProdiId = prodiId
      ? Number(prodiId)
      : urlProdiId
        ? Number(urlProdiId)
        : Number(session.prodiId);

    if (!targetProdiId) {
      return NextResponse.json(
        { error: "Gagal menentukan Prodi ID untuk data baru" },
        { status: 400 },
      );
    }

    const newKurikulum = await prisma.kurikulum.create({
      data: {
        nama,
        tahun: Number(tahun),
        prodi_id: targetProdiId,
      },
    });

    return NextResponse.json({ success: true, data: newKurikulum });
  } catch (err: any) {
    console.error("Create Kurikulum Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
