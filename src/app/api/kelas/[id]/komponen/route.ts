//file: src/app/api/kelas/[id]/komponen/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const kelasId = parseInt((await params).id, 10);
    const body = await request.json();
    
    // Mode 1: Sync dari RPS (Otomatis)
    if (body.action === "sync_rps") {
      const { evaluasi } = body; // Array dari { nama, bobot }
      
      // Hapus komponen lama
      await prisma.komponenNilai.deleteMany({ where: { kelas_id: kelasId } });

      // Masukkan komponen baru dari RPS
      for (const item of evaluasi) {
        await prisma.komponenNilai.create({
          data: {
            nama: item.nama,
            bobot: parseFloat(item.bobot),
            kelas_id: kelasId
          }
        });
      }
      return NextResponse.json({ message: "Komponen berhasil disinkronkan dengan RPS" });
    }

    // Mode 2: Simpan Manual / Import Excel (Kode Lama Anda)
    // ... (Paste kode POST lama Anda di sini untuk handle komponen manual & nilai Excel) ...
    // Pastikan logic penyimpanan nilai Excel tetap ada di sini.
    
    const { komponen, dataNilai } = body;
    // ... logic lama ...
    
    return NextResponse.json({ message: "Data berhasil disimpan" });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}