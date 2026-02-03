import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dataMahasiswa } = body; // Array JSON dari Excel

    if (!dataMahasiswa || !Array.isArray(dataMahasiswa) || dataMahasiswa.length === 0) {
      return NextResponse.json({ success: false, error: "Data kosong atau format salah" }, { status: 400 });
    }

    let processed = 0;

    // Gunakan Transaction untuk performa dan keamanan data
    await prisma.$transaction(async (tx) => {
      for (const row of dataMahasiswa) {
        // Normalisasi Key (biar case insensitive, misal 'Nama' vs 'nama')
        const nimKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'nim');
        const namaKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'nama');
        
        const nim = nimKey ? String(row[nimKey]).trim() : null;
        const nama = namaKey ? String(row[namaKey]).trim() : null;
        
        if (!nim || !nama) continue;
        await tx.mahasiswa.upsert({
          where: { nim: nim },
          update: {
            nama: nama,

          },
          create: {
            nim: nim,
            nama: nama,
             
          }
        });

        processed++;
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil memproses ${processed} data mahasiswa.` 
    });

  } catch (error: any) {
    console.error("API Import Mahasiswa Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}