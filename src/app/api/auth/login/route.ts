import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/../lib/auth"; // Pastikan file lib/auth.ts ada

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 1. Validasi Input
    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi." }, { status: 400 });
    }

    // 2. Cari user di database
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 401 });
    }

    // 3. Cek Password (Bandingkan input dengan hash di database)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah." }, { status: 401 });
    }

    // 4. Login Berhasil! -> Buat Tiket (Session)
    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({ message: "Login berhasil", role: user.role }, { status: 200 });

  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}