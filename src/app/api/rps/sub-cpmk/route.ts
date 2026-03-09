import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cpmk_id, deskripsi, ik_id, kode_sub_cpmk } = body;

    const newSub = await prisma.subCpmk.create({
      data: {
        cpmk_id: Number(cpmk_id),
        // Logika: Jika ik_id ada pakai angkanya, jika tidak ada (S2/S3) pakai null
        ik_id: ik_id ? Number(ik_id) : null,
        deskripsi: deskripsi,
        kode_sub_cpmk: kode_sub_cpmk,
      },
    });

    return NextResponse.json({ success: true, data: newSub });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
