import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = "rahasia-dapur-kita"; // Samakan dengan lib/auth.ts
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  // 1. Ambil cookie session
  const sessionCookie = request.cookies.get("session")?.value;

  // 2. Daftar halaman yang diproteksi (tambah sesuai kebutuhan)
  const protectedRoutes = [
    "/home",
    "/rps",
    "/referensi",
    "/kurikulum",
    "/matakuliah",
    "/penilaian",
    "/laporan",
  ];
  const isProtected = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // 3. Jika halaman diproteksi tapi tidak ada session -> Tendang ke Login
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Jika ada session, validasi apakah tokennya valid
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, key);
      const userRole = payload.role as string; // Ambil role dari JWT payload

      // --- LOGIC PROTEKSI ROLE (SAPU BERSIH) ---

      // A. Jika USER (Mahasiswa) coba akses selain Home, Dokumen, Pengaturan -> Tendang ke Home
      if (userRole === "USER") {
        const allowedForUser = ["/home", "/dokumen", "/pengaturan"];
        const isTryingAccessForbidden = protectedRoutes.some(
          (route) =>
            request.nextUrl.pathname.startsWith(route) &&
            !allowedForUser.some((allowed) =>
              request.nextUrl.pathname.startsWith(allowed),
            ),
        );

        if (isTryingAccessForbidden) {
          return NextResponse.redirect(new URL("/home", request.url));
        }
      }

      // B. Jika DOSEN coba akses Manajemen User, Referensi, atau Monitoring -> Tendang ke Home
      if (userRole === "DOSEN") {
        const forbiddenForDose = [
          "/manajemenuser",
          "/referensi",
          "/monitoring",
        ];
        if (
          forbiddenForDose.some((route) =>
            request.nextUrl.pathname.startsWith(route),
          )
        ) {
          return NextResponse.redirect(new URL("/home", request.url));
        }
      }

      // C. Proteksi kebalikan: Jika sudah login tapi buka /login -> Tendang ke Home
      if (request.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/home", request.url));
      }
    } catch (err) {
      // Token tidak valid/expired -> Hapus cookie & Tendang ke Login
      console.error("Middleware Auth Error:", err);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

// Config matcher agar middleware tidak berjalan di semua file (seperti gambar/api public)
export const config = {
  matcher: [
    "/((?!api/auth|api/kurikulum|_next/static|_next/image|favicon.ico).*)",
  ],
};
