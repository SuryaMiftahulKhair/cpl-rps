import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET_KEY || "rahasia-default"; 
const key = new TextEncoder().encode(secretKey);

// Enkripsi data jadi Token
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") 
    .sign(key);
}

// Dekripsi Token
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    return payload;
  } catch (error) {
    return null;
  }
}

// Simpan Sesi (Termasuk Token Kampus)
export async function createSession(payload: {
  username: string;
  role: string;
  accessToken: string; // <-- Kita simpan token kampus di sini
}) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); 
  const session = await encrypt(payload);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    path: "/",
  });
}

export async function getSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

export async function deleteSession() {
  (await cookies()).set("session", "", { expires: new Date(0), path: "/" });
}