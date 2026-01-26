// src/app/api/users/list/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // Pastikan path ke prisma client benar

export async function GET() {
  try {
    // Mengambil data user dari database
    const users = await prisma.user.findMany({
      where: {
        role: "DOSEN", // Memfilter hanya role DOSEN
      },
      select: {
        id: true,
        username: true, // Biasanya berisi NIP
        nama: true,
        role: true,
        prodi_id: true,
        // Menampilkan nama prodi agar informasi di tabel lebih lengkap
        programStudi: {
          select: {
            nama: true,
          }
        }
      },
      orderBy: {
        nama: "asc", // Mengurutkan alfabetis dari A ke Z
      },
    });

    // Mengembalikan data dalam format JSON yang diharapkan Frontend
    return NextResponse.json({ 
        success: true, 
        data: users 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Database Error:", error);
    
    return NextResponse.json({ 
        success: false, 
        error: "Gagal mengambil daftar dosen: " + error.message 
    }, { status: 500 });
  }
}