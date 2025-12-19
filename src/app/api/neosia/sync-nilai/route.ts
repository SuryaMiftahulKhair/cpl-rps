// src/app/api/neosia/sync-nilai/route.ts
import { NextResponse } from "next/server";
import { fetchKelasFromNeosia } from "@/../lib/neosiaService";
import prisma from "@/../lib/prisma"; // Pastikan prisma terhubung

export async function POST(request: Request) {
  try {
    const { semesterKode, prodiId } = await request.json();

    if (!semesterKode || !prodiId) {
      return NextResponse.json({ error: "Parameter kurang" }, { status: 400 });
    }

    // 1. Ambil data dari Neosia
    const neosiaData = await fetchKelasFromNeosia(semesterKode, prodiId);
    
    // Data dari Neosia ada di properti 'data' (array) sesuai Postman
    const daftarNilai = neosiaData.data || [];

    // 2. (Opsional) Simpan ke Database Lokal Anda menggunakan Prisma
    // Contoh sederhana loop insert/upsert:
    /*
    for (const item of daftarNilai) {
        await prisma.nilai.upsert({
            where: { ... },
            update: { nilaiAkhir: item.nilai_akhir, nilaiHuruf: item.nilai_huruf },
            create: { 
                kodeMK: item.mata_kuliah_kode,
                namaMK: item.mata_kuliah_nama,
                // mapping field lainnya dari response Postman
            }
        })
    }
    */

    return NextResponse.json({ 
        message: "Berhasil mengambil data", 
        total: daftarNilai.length,
        data: daftarNilai // Kirim data mentah ke frontend untuk preview
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}