// src/app/api/users/dosen/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prodiId = searchParams.get("prodiId");

    const dosen = await prisma.user.findMany({
      where: {
        role: "DOSEN", // Pastikan string ini sama dengan enum/string di DB Kakak
        prodi_id: prodiId ? Number(prodiId) : undefined
      },
      select: {
        id: true,
        nama: true, // Pastikan kolom nama ada di tabel User Kakak
      },
      orderBy: { nama: 'asc' }
    });

    return NextResponse.json({ success: true, data: dosen });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}