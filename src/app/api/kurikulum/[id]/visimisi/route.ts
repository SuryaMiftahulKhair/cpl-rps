// src/app/api/kurikulum/[id]/visimisi/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  jenis: z.enum(["visi","misi"]),
  teks: z.string().min(1),
  urutan: z.number().int().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = (request as any).nextUrl?.pathname?.split("/")[4] ?? params.id;
  const items = await prisma.visiMisi.findMany({
    where: { kurikulumId: id },
    orderBy: { urutan: "asc" }
  });
  return NextResponse.json(items);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = (request as any).nextUrl?.pathname?.split("/")[4] ?? params.id;
    const body = await request.json();
    const parsed = createSchema.parse(body);
    const created = await prisma.visiMisi.create({
      data: { ...parsed, kurikulumId: id }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
