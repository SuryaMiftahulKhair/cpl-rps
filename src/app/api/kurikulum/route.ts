import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const urlProdiId = searchParams.get("prodiId");

    // 🟢 JALUR HIJAU: Kita coba ambil session, tapi kalau tidak ada (publik), JANGAN diusir
    const session = await getSession();

    let finalProdiId: number | null = null;

    // Prioritas pengambilan Prodi ID
    if (urlProdiId) {
      finalProdiId = Number(urlProdiId);
    } else if (session?.prodiId) {
      finalProdiId = Number(session.prodiId);
    }

    console.log("API Kurikulum [GET] - ProdiID:", finalProdiId);

    if (!finalProdiId) {
      return NextResponse.json(
        {
          success: false,
          error: "Prodi ID diperlukan untuk menampilkan data.",
        },
        { status: 400 },
      );
    }

    const data = await prisma.kurikulum.findMany({
      where: { prodi_id: finalProdiId },
      include: {
        _count: {
          select: { cpl: true, mataKuliah: true },
        },
        programStudi: true,
      },
      orderBy: { tahun: "desc" },
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
    // 🔴 PROTEKSI PENUH: Hanya user login yang boleh menambah data
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { nama, tahun, prodiId } = body;

    const { searchParams } = new URL(req.url);
    const urlProdiId = searchParams.get("prodiId");

    const targetProdiId = prodiId
      ? Number(prodiId)
      : urlProdiId
      ? Number(urlProdiId)
      : Number(session.prodiId);

    if (!targetProdiId) {
      return NextResponse.json(
        { error: "Gagal menentukan Prodi ID" },
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
