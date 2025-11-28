import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Kunci rahasia (Gunakan default ini untuk development)
const secretKey = process.env.JWT_SECRET_KEY || "rahasia-super-aman-jangn-lupa-ganti"; 
const key = new TextEncoder().encode(secretKey);

// 1. Bikin Tiket (Enkripsi data jadi Token)
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Tiket berlaku 24 jam
    .sign(key);
}

// 2. Baca Tiket (Dekripsi Token jadi data)
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null; // Tiket palsu atau kadaluarsa
  }
}

// 3. Simpan Tiket di Browser (Set Cookie)
export async function createSession(payload: {
  userId: number;
  username: string;
  role: string;
}) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 hari
  const session = await encrypt(payload);

  // Simpan token ke cookie browser yang aman (HttpOnly)
  (await
        // Simpan token ke cookie browser yang aman (HttpOnly)
        cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    path: "/",
  });
}

// 4. Ambil Tiket (Get Session) - Untuk dipakai nanti di API lain
export async function getSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

// 5. Buang Tiket (Logout)
export async function deleteSession() {
  (await cookies()).set("session", "", { expires: new Date(0), path: "/" });
}