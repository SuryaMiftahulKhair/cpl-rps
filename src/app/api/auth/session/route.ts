import { NextResponse } from "next/server";
import { getSession } from "@/../lib/auth"; // Sesuaikan path auth Kakak

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      data: session // Ini berisi id, nama, username, dan ROLE
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}