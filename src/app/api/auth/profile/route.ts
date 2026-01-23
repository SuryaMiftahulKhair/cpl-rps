import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth"; // Pastikan fungsi getSession sudah ada

export async function GET() {
    try {
        const session = await getSession();

        // Cek apakah ada user yang sedang login
        if (!session || !session.userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Ambil data user + Join ke tabel ProgramStudi sesuai schema
        const user = await prisma.user.findUnique({
            where: { id: Number(session.userId) },
            include: {
                programStudi: true, // Nama relasi di model User Kakak
            },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                nama: user.nama,
                // Mengirim data prodi ke sidebar
                programStudi: user.programStudi ? {
                    nama: user.programStudi.nama,   // Contoh: Teknik Informatika
                    jenjang: user.programStudi.jenjang // Contoh: S2
                } : null
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}