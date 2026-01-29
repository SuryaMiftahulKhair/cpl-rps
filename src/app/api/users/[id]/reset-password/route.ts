import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma"; // Sesuaikan path prisma Kakak
import bcrypt from "bcryptjs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Format Next.js 15
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // 1. Hash password baru agar tidak tersimpan sebagai teks biasa (SANGAT PENTING!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Update data User di Database
    await prisma.user.update({
      where: { id: Number(id) },
      data: { password_hash: hashedPassword }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Password berhasil diperbarui" 
    });
  } catch (error: any) {
    console.error("Error Reset Password:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate database" },
      { status: 500 }
    );
  }
}