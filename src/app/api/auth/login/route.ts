import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { compare } from "bcryptjs";
import { createSession } from "@/../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // 1. Cari User & Ambil semua Prodi yang dia miliki (programStudis)
    const user = await prisma.user.findUnique({
      where: { username: username },
      include: { 
        programStudis: true // <--- AMBIL DATA BANYAK PRODI
      } 
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // 2. Tentukan Prodi Aktif saat Login
    // Kita ambil prodi pertama dari daftar Many-to-Many sebagai default
    const primaryProdi = user.programStudis.length > 0 ? user.programStudis[0] : null;

    // 3. Siapkan Payload Session dengan sistem Multi-Prodi
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        // Gunakan ID prodi pertama yang ditemukan di tabel relasi
        prodiId: primaryProdi ? primaryProdi.id : user.prodi_id, 
        namaProdi: primaryProdi ? primaryProdi.nama : "Tidak Ada Prodi"
    };
    
    // 4. Buat Session
    await createSession(payload);

    return NextResponse.json({ 
        success: true, 
        user: payload 
    });

  } catch (error: any) {
    console.error("LOGIN ERROR DETIL:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}