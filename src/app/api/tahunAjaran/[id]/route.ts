import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const idString = (await params).id;
  console.log("🔥 API terpanggil dengan ID:", idString);
  try {
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID Semester tidak valid" }, { status: 400 });
    }

    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: id },
    });

    if (!tahunAjaran) {
      return NextResponse.json({ error: "Semester tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(tahunAjaran, { status: 200 });

  } catch (err) {
    console.error("GET /api/tahunAjaran/[id] error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data semester" },
      { status: 500 }
    );
  }
}