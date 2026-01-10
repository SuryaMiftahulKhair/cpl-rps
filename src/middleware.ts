import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

const secretKey = "rahasia-dapur-kita"; // Samakan dengan lib/auth.ts
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  // 1. Ambil cookie session
  const sessionCookie = request.cookies.get('session')?.value;

  // 2. Daftar halaman yang diproteksi (tambah sesuai kebutuhan)
  const protectedRoutes = ['/dashboard', '/rps', '/admin']; 
  const isProtected = protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path));

  // 3. Jika halaman diproteksi tapi tidak ada session -> Tendang ke Login
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Jika ada session, validasi apakah tokennya valid
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, key);
      // Token valid, lanjut
      // Jika user sudah login tapi buka halaman /login, lempar ke /rps
      if (request.nextUrl.pathname === '/login') {
         return NextResponse.redirect(new URL('/rps', request.url));
      }
    } catch (err) {
      // Token tidak valid/expired -> Hapus cookie & Tendang ke Login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

// Config matcher agar middleware tidak berjalan di semua file (seperti gambar/api public)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}