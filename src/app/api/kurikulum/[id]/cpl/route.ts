import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// --- 1. GET: Ambil Data ---
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kurikulumId = Number(id);

    console.log("Mencoba fetch CPL untuk Kurikulum ID:", kurikulumId); // Debugging 1

    // PERBAIKAN: Coba ubah 'cPL' menjadi 'cpl' (kecil semua).
    // Prisma biasanya men-generate model 'CPL' menjadi 'prisma.cpl' atau 'prisma.cPL'
    // Cek IntelliSense (Ctrl+Spasi) setelah ketik 'prisma.' untuk yakin.
    const data = await prisma.cPL.findMany({ 
      where: { kurikulum_id: kurikulumId },
      orderBy: { kode_cpl: 'asc' }
    });

    console.log("Berhasil fetch CPL:", data.length, "items"); // Debugging 2

    return NextResponse.json({ success: true, data }); 

  } catch (err: any) {
    // PENTING: Tampilkan error asli di Terminal VS Code
    console.error("ERROR GET CPL:", err); 
    
    return NextResponse.json({ 
        success: false, 
        error: "Server Error", 
        detail: err.message 
    }, { status: 500 });
  }
}

// --- 2. POST: Tambah Data ---
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kurikulumId = Number(id);

    const body = await req.json();
    const { kode_cpl, deskripsi } = body;

    // Perbaikan nama model juga disini (cpl)
    const data = await prisma.cPL.create({
      data: { 
        kode_cpl, 
        deskripsi, 
        kurikulum_id: kurikulumId 
      }
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("ERROR POST CPL:", err); // Log error juga disini
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}