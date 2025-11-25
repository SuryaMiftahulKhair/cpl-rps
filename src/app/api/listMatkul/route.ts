// file: src/app/api/listMatkul/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET() {
  try {
    const matkul = await prisma.mataKuliah.findMany({
      select: { id: true, kode_mk: true, nama: true },
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json(matkul);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data mata kuliah" }, { status: 500 });
  }
}