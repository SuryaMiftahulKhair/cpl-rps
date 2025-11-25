// file: src/app/api/dosen/list/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET() {
  try {
    // Ambil semua user dengan role DOSEN
    const dosenList = await prisma.user.findMany({
      where: { role: "DOSEN" },
      select: {
        username: true, // Ini adalah NIP
        nama: true,
      },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json(dosenList);
  } catch (err) {
    console.error("GET /api/listDosen error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil daftar dosen" },
      { status: 500 }
    );
  }
}