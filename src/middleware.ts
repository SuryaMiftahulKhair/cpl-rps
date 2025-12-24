import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/../lib/auth"; 

// 1. Daftar Public
const publicPaths = ["/login", "/register", "/api/auth/login", "/api/auth/register", "/api/seed-user"];

// 2. Daftar Admin
const adminPaths = ["/rps", "/referensi", "/pengaturan", "/api/kurikulum", "/api/users", "/api/rps/riwayat"];

// 3. Daftar Dosen
const dosenPaths = ["/rps", "/api/kelas", "/api/cpmk"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // --- CEK 1: Public Path ---
  if (publicPaths.some((p) => path.startsWith(p)) || path === "/" || path.startsWith("/_next") || path.includes(".")) {
    return NextResponse.next();
  }

  // --- CEK 2: Ada Cookie? ---
  const sessionCookie = req.cookies.get("session")?.value;

  if (!sessionCookie) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Anda belum login" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // --- CEK 3: Validasi Isi Session ---
  const session = await decrypt(sessionCookie);

  // Middleware kakak mewajibkan 'userId'. 
  // Karena Login Route di atas sudah mengirim 'userId', baris ini sekarang akan LOLOS (TRUE).
  if (!session?.userId) {
    console.log("Session invalid: userId missing"); // Debugging
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session");
    return response;
  }

  // --- CEK 4: Role ---
  const userRole = session.role; // Harusnya "USER"

  // Cek Akses Halaman Admin
  if (adminPaths.some((p) => path.startsWith(p))) {
    // Kita izinkan ADMIN atau USER
    if (userRole !== "ADMIN" && userRole !== "USER") { 
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url)); 
    }
  }

  // Cek Akses Halaman Dosen
  if (dosenPaths.some((p) => path.startsWith(p))) {
     // Izinkan DOSEN, ADMIN, atau USER
     if (userRole !== "DOSEN" && userRole !== "ADMIN" && userRole !== "USER") {
       if (path.startsWith("/api/")) {
         return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
       }
       return NextResponse.redirect(new URL("/unauthorized", req.url));
     }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo-unhas.png).*)"],
};