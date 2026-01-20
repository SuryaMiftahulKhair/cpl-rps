// file: src/app/api/matakuliah/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET() {
  try {
    const matakuliah = await prisma.mataKuliah.findMany({
      orderBy: { nama: 'asc' }, 
      select: {
        id: true,
        kode_mk: true,
        nama: true,
        sks: true,
        semester: true
      }
    });

    return NextResponse.json({ data: matakuliah });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}