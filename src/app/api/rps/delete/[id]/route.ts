import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        await prisma.rPS.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true, message: "Berhasil dihapus" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}