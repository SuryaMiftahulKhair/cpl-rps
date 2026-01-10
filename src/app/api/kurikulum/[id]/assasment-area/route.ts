import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: Request) {
  try {
    const { nama, kurikulum_id } = await req.json();
    const data = await prisma.assasmentArea.create({
      data: { nama, kurikulum_id: Number(kurikulum_id) }
    });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}