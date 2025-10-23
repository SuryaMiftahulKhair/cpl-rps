// src/app/api/matakuliah/[mid]/cpl/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  kode: z.string().min(1),
  deskripsi: z.string().min(1),
  level: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: { mid: string } }) {
  const mid = (request as any).nextUrl?.pathname?.split("/")[2] ?? params.mid;
  const items = await prisma.cPL.findMany({ where: { mataKuliahId: mid } as any });
  return NextResponse.json(items);
}

export async function POST(request: Request, { params }: { params: { mid: string } }) {
  try {
    const mid = (request as any).nextUrl?.pathname?.split("/")[2] ?? params.mid;
    const body = await request.json();
    const parsed = createSchema.parse(body);
    const created = await prisma.cPL.create({
      data: { ...parsed, mataKuliahId: mid }
    } as any);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
