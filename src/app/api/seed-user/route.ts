import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const username = "D121221058";
    const plainPassword = "40752";
    const nama = "Ulil";
    const role = "MAHASISWA";

    // 1. Cek user lama
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      // Hapus user lama (agar passwordnya ter-reset)
      await prisma.user.delete({ where: { username } });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3. Buat User Baru
    const newUser = await prisma.user.create({
      data: {
        username,
        password_hash: hashedPassword,
        nama,
        role,
      },
    });

    return NextResponse.json({
      message: "User berhasil dibuat!",
      user: {
        username: newUser.username,
        role: newUser.role,
        password_info: "Sudah di-hash dan aman.",
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal membuat user", detail: err.message },
      { status: 500 }
    );
  }
}