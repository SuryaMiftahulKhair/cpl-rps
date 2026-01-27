import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "rahasia-dapur-kita"; // Ganti dengan string acak yang panjang di .env
const key = new TextEncoder().encode(secretKey);

// 1. Fungsi Membuat Session (Dipanggil saat Login sukses)
export async function createSession(payload: any) {
  // Ubah durasi dari 24 jam menjadi 2 jam agar lebih ketat
  const duration = 2 * 60 * 60 * 1000; // 2 Jam
  const expires = new Date(Date.now() + duration); 
  
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // Sinkronkan dengan 2 jam
    .sign(key);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "strict", // Ubah 'lax' jadi 'strict' agar lebih aman dari CSRF
    path: "/",
  });
}
// 2. Fungsi Mengambil Data User dari Session (Dipanggil di API/Page)
export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key);
    return payload;
  } catch (error) {
    return null;
  }
}

// 3. Fungsi Logout
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}