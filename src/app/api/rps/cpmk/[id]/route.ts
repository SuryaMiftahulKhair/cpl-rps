import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cpmkId = Number(id);

    if (isNaN(cpmkId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Hapus CPMK berdasarkan ID
    const deletedCpmk = await prisma.cPMK.delete({
      where: { id: cpmkId },
    });

    return NextResponse.json({ success: true, data: deletedCpmk });
  } catch (err: any) {
    console.error("Delete CPMK Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
