import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

function toNum(x: string | undefined) {
  const n = Number(x);
  return Number.isFinite(n) ? n : NaN;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ piGroupId: string }> }
) {
  try {
    const { piGroupId } = await ctx.params;
    const id = toNum(piGroupId);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "piGroupId tidak valid" }, { status: 400 });
    }

    const rows = await prisma.performanceIndicator.findMany({
      where: { pi_group_id: id },
      select: { id: true, deskripsi: true },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("GET performance-indicator error:", e);
    return NextResponse.json({ error: "server error", detail: e?.message }, { status: 500 });
  }
}
