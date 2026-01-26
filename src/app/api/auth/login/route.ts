import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { compare } from "bcryptjs";
import { createSession } from "@/../lib/auth"; // <--- Pastikan import ini ada!

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    console.log("Mencoba login untuk:", username); // Debugging 1

    // 1. Cari User di Database
    // Pastikan relasi di schema kakak namanya 'programStudi' (sesuai schema terakhir)
    const user = await prisma.user.findUnique({
      where: { username: username },
      include: { programStudi: true } 
    });

    // 2. Cek User
    if (!user) {
      console.log("User tidak ditemukan di DB"); // Debugging 2
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 401 });
    }

    // 3. Cek Password (Bcrypt)
    // Pastikan di database kolomnya 'password_hash' (sesuai schema terakhir)
    if (!user.password_hash) {
        console.log("User ini tidak memiliki password hash");
        return NextResponse.json({ error: "Password user belum diset" }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log("Password salah"); // Debugging 3
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // 4. Siapkan Payload Session
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        prodiId: user.prodi_id, 
        namaProdi: user.programStudi?.nama
    };
    
    // 5. BUAT SESSION (PENTING!)
    // Ini akan membuat JWT dan menyimpannya di Cookies browser
    await createSession(payload);

    console.log("Login Sukses, Session dibuat!"); // Debugging 4

    return NextResponse.json({ 
        success: true, 
        user: payload 
    });

  } catch (error: any) {
    // PENTING: Log error asli ke terminal agar tahu penyebabnya
    console.error("LOGIN ERROR DETIL:", error);
    
    return NextResponse.json({ 
        error: "Server Error", 
        detail: error.message 
    }, { status: 500 });
  }
}