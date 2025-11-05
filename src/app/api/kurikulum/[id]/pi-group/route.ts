import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

function toNum(x: string | undefined) {
  const n = Number(x);
  return Number.isFinite(n) ? n : NaN;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const kurikulumId = toNum(id);
    if (Number.isNaN(kurikulumId)) {
      return NextResponse.json({ error: "kurikulum id tidak valid" }, { status: 400 });
    }

    const rows = await prisma.pIGroup.findMany({
      where: { kurikulum_id: kurikulumId },
      select: { id: true, kode_grup: true, assesment_id: true },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("GET pi-group error:", e);
    return NextResponse.json({ error: "server error", detail: e?.message }, { status: 500 });
  }
}
