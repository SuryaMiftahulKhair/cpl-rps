// src/app/api/kurikulum/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(request.url);
    // If using Next's route handler parameters, Next will pass params differently in app router handlers.
    // In app router, use request.url parsing to get id from pathname OR use dynamic route file (this file is correct path).
    const id = (request as any).nextUrl?.pathname?.split("/").pop() ?? params.id;
    const kur = await prisma.kurikulum.findUnique({
      where: { id },
      include: {
        programStudi: true,
        mataKuliahs: { include: { cplItems: true } },
        visiMisiItems: { orderBy: { urutan: "asc" } },
      },
    });
    if (!kur) return NextResponse.json({ error: "Kurikulum tidak ditemukan" }, { status: 404 });
    return NextResponse.json(kur);
  } catch (err) {
    console.error("GET /api/kurikulum/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
