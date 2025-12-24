import { NextResponse, NextRequest } from "next/server";
import { createSession } from "@/../lib/auth";
import prisma from "@/../lib/prisma";
import { PrismaClient, UserRole } from "@prisma/client"; 

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    console.log("1. Login Request diterima untuk:", username);

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi." }, { status: 400 });
    }

    const baseUrl = process.env.KAMPUS_API_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: "Konfigurasi server belum lengkap (.env missing)." }, { status: 500 });
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, ""); 
    const kampusLoginUrl = `${cleanBaseUrl}/api/v2/auth/login`;
    
    // --- 1. MINTA TOKEN KE KAMPUS ---
    console.log("2. Menghubungi API Kampus:", kampusLoginUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); 

    let apiData;
    try {
      const apiRes = await fetch(kampusLoginUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "SistemPenilaianCPL/1.0"
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      apiData = await apiRes.json();

      if (!apiRes.ok) {
        return NextResponse.json(
          { error: apiData.message || "Login gagal. Cek username/password." }, 
          { status: apiRes.status }
        );
      }
    } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
            return NextResponse.json({ error: "Koneksi ke server kampus timeout." }, { status: 504 });
        }
        throw fetchError;
    }

    // --- 2. AMBIL TOKEN (PENTING!) ---
    const accessToken = apiData.access_token || apiData.token || apiData.data?.token;

    if (!accessToken) {
      return NextResponse.json({ error: "Gagal: Server kampus tidak mengirim token." }, { status: 500 });
    }

    console.log("3. Token berhasil didapatkan!");

    // --- 3. SINKRONISASI KE DB LOKAL ---
    const namaUser = apiData.user?.nama || apiData.data?.user?.nama || "Pengguna";

    // Kita paksa Role menjadi USER (Huruf Besar) agar sesuai Prisma & Middleware
    const defaultRole = UserRole.USER; 

    const localUser = await prisma.user.upsert({
      where: { username: username },
      update: {
        // Update nama jika perlu
        // nama: namaUser 
      },
      create: {
        username: username,
        nama: namaUser,
        role: defaultRole, // Simpan sebagai "USER"
        password_hash: "", 
      },
    });

    // --- 4. SIMPAN SESI (SANGAT PENTING: Struktur Data) ---
    // Struktur ini harus sama persis dengan yang dicek di Middleware
    await createSession({
      userId: localUser.id,
      username: localUser.username,
      role: localUser.role,            // Ini nilainya "USER"
      accessToken: accessToken,        // Token kampus disimpan di sini
    });

    return NextResponse.json({ message: "Login berhasil", role: localUser.role }, { status: 200 });

  } catch (err: any) {
    console.error("Critical Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}