import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth";

export async function GET() {
    try {
        const session = await getSession();

        // 1. Validasi Session
        if (!session || !session.userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // 2. Ambil data user + Join ke relasi Jamak (programStudis)
        // Pastikan nama 'programStudis' sesuai dengan yang ada di schema.prisma Kakak
        const user = await prisma.user.findUnique({
            where: { id: Number(session.userId) },
            include: {
                programStudis: true, // Ini yang akan mengambil list S1, S2, dsb.
            },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // 3. Kirim data ke Frontend
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                nama: user.nama,
                username: user.username,
                role: user.role,
                // Kita kirimkan array ini agar Sidebar bisa membuat Dropdown
                programStudis: user.programStudis.map((prodi) => ({
                    id: prodi.id,
                    nama: prodi.nama,
                    jenjang: prodi.jenjang
                })),
            }
        });

    } catch (error: any) {
        console.error("API Profile Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}