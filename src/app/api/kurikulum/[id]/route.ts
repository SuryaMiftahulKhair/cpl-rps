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
  { params }: { params: { id?: string } } // <-- PERBAIKAN: Pakai 'id'
) {
  try {
    // Gunakan 'request' di parseId
    const id = parseId(params.id, (request as any).nextUrl); // <-- PERBAIKAN: Pakai 'params.id'
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