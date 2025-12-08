import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/../lib/auth"; // Pastikan path ini benar

// 1. Daftar Halaman/API yang Boleh Diakses Siapa Saja (Public)
const publicPaths = ["/login", "/register", "/api/auth/login", "/api/auth/register", "/api/seed-user"];

// 2. Daftar Halaman/API Khusus ADMIN
const adminPaths = [
  "/rps",              // Halaman Pilih Kurikulum
  "/referensi",        // Halaman VMCPL, dll
  "/pengaturan",       // Halaman Manajemen User
  "/api/kurikulum",    // API Kurikulum
  "/api/users",        // API User
  "/api/rps/riwayat",  // API Riwayat RPS
];

// 3. Daftar Halaman/API Khusus DOSEN (Contoh)
const dosenPaths = [
  "/rps",
  "/api/kelas",
  "/api/cpmk",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // --- CEK 1: Apakah ini halaman public? ---
  // Jika ya, biarkan lewat.
  if (publicPaths.some((p) => path.startsWith(p)) || path === "/" || path.startsWith("/_next") || path.includes(".")) {
    return NextResponse.next();
  }

  // --- CEK 2: Apakah user punya tiket (session cookie)? ---
  const sessionCookie = req.cookies.get("session")?.value;

  if (!sessionCookie) {
    // Jika tidak ada tiket, tendang ke halaman login
    // (Kecuali jika ini request API, kasih error JSON)
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Anda belum login" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // --- CEK 3: Apakah tiketnya valid? ---
  const session = await decrypt(sessionCookie);

  if (!session?.userId) {
    // Tiket palsu/kadaluarsa -> Hapus tiket & tendang ke login
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session");
    return response;
  }

  // --- CEK 4: Otorisasi Role (Admin vs Dosen) ---
  const userRole = session.role;

  // Jika user mencoba akses halaman ADMIN
  if (adminPaths.some((p) => path.startsWith(p))) {
    if (userRole !== "ADMIN") {
      // Jika bukan admin, tolak!
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Akses ditolak: Khusus Admin" }, { status: 403 });
      }
      // Redirect ke halaman yang sesuai role-nya (misal dashboard dosen)
      return NextResponse.redirect(new URL("/unauthorized", req.url)); 
    }
  }

  // Jika user mencoba akses halaman DOSEN
  if (dosenPaths.some((p) => path.startsWith(p))) {
    if (userRole !== "DOSEN" && userRole !== "ADMIN") { // Admin biasanya boleh akses semua
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Akses ditolak: Khusus Dosen" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Jika lolos semua pengecekan, silakan masuk
  return NextResponse.next();
}

// Konfigurasi: Middleware ini berjalan di semua rute kecuali file statis
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo-unhas.png).*)"],
};