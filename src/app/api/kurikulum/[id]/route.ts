// src/app/api/kurikulum/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// Fungsi parseId baru yang lebih aman
function parseId(paramsId: string | undefined, nextUrl?: any) {
  if (paramsId) return Number(paramsId);
  try {
    const url = nextUrl?.pathname ?? "";
    const segments = url.split('/');
    const idIndex = segments.indexOf('kurikulum') + 1; 
    const id = segments[idIndex];
    return id ? Number(id) : NaN;
  } catch {
    return NaN;
  }
}

/**
 * GET: Mengambil detail SATU kurikulum berdasarkan ID-nya.
 * Dipanggil oleh: /rps/[id]/list/page.tsx
 */
export async function GET(
  request: NextRequest,
  // 1. Definisikan params sebagai Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 2. Await params terlebih dahulu (Wajib di Next.js 15)
    const { id: idString } = await params;
    
    // 3. Konversi ke Number
    const id = Number(idString);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID Kurikulum tidak valid" }, { status: 400 });
    }

    const kurikulum = await prisma.kurikulum.findUnique({
      where: { id: id },
    });

    if (!kurikulum) {
      return NextResponse.json({ error: "Kurikulum tidak ditemukan" }, { status: 404 });
    }
    
    return NextResponse.json(kurikulum);

  } catch (err: any) {
    console.error("GET /api/kurikulum/[id] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}