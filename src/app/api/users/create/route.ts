import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        
        // Perbaikan 1: Validasi session agar tidak null
        if (!session || !session.userId) {
            return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
        }

        const { nama, username, password, role } = await req.json();

        // 1. Ambil data Admin untuk tahu Program Studinya
        const admin = await prisma.user.findUnique({
            where: { id: Number(session.userId) }
        });

        if (!admin) {
            return NextResponse.json({ success: false, error: "Admin tidak ditemukan" }, { status: 404 });
        }

        // 2. Hash password demi keamanan
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Simpan User baru (Perbaikan 2 & 3: Sesuaikan nama field database)
        const newUser = await prisma.user.create({
            data: {
                nama: nama,
                username: username,
                password_hash: hashedPassword, // Sesuai schema Kakak
                role: role,
                prodi_id: admin.prodi_id      // Sesuai schema Kakak (prodi_id)
            }
        });

        return NextResponse.json({ success: true, data: newUser });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}