import { NextResponse } from "next/server";
import { deleteSession } from "@/../lib/auth"; // Import dari langkah 1

export async function POST() {
  await deleteSession(); // Hapus Cookie
  return NextResponse.json({ success: true });
}