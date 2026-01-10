import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "rahasia-dapur-kita"; // Ganti dengan string acak yang panjang di .env
const key = new TextEncoder().encode(secretKey);

// 1. Fungsi Membuat Session (Dipanggil saat Login sukses)
export async function createSession(payload: any) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 Hari
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);

  // Simpan ke Cookies
  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
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
export async function logout() {
  (await cookies()).delete("session");
}