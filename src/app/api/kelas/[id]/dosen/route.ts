import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kelasId = parseInt(params.id, 10);
    const body = await request.json();
    const { nip } = body; 
    const dosen = await prisma.user.findUnique({
        where: { username: nip }, 
    });

    if (!dosen) {
        return NextResponse.json({ error: "Data dosen tidak ditemukan di database User." }, { status: 404 });
    }

    return NextResponse.json(dosen, { status: 201 });

  } catch (err) {
    console.error("POST /api/kelas/[id]/dosen error:", err);
    return NextResponse.json({ error: "Gagal menambahkan dosen" }, { status: 500 });
  }
}