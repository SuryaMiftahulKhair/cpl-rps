// src/app/api/kelas/sync/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { fetchKelasFromNeosia } from "@/../lib/neosiaService";

export async function POST(request: Request) {
  try {
    const { semesterId, kodeNeosia, prodiId } = await request.json();

    if (!semesterId || !kodeNeosia) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Ambil Data dari Neosia
    // Fungsi ini sudah memfilter duplikat, jadi kita dapat daftar kelas unik
    const kelasNeosia = await fetchKelasFromNeosia(kodeNeosia, prodiId || "18");

    console.log("Data dari Neosia Service:", kelasNeosia);
    let count = 0;

    // 2. Langsung Simpan ke Tabel Kelas
    for (const k of kelasNeosia) {
      
      // Buat ID unik agar tidak duplikat saat disync ulang
      // Format: [KodeSemester]-[KodeMK]-[NamaKelas] -> "20242-IF123-A"
      const uniqueNeosiaId = `${kodeNeosia}-${k.mata_kuliah_kode}-${k.kelas_kuliah_nama}`;

      await prisma.kelas.upsert({
        where: {
          neosia_id: uniqueNeosiaId, 
        },
        update: {
            // Update jika nama/sks berubah di Neosia
            nama_mk: k.mata_kuliah_nama,
            sks: k.sks || 0,
            nama_kelas: k.kelas_kuliah_nama
        },
        create: {
          tahun_ajaran_id: parseInt(semesterId),
          neosia_id: uniqueNeosiaId,
          // Simpan data lengkap di satu tabel
          kode_mk: k.mata_kuliah_kode,
          nama_mk: k.mata_kuliah_nama,
          nama_kelas: k.kelas_kuliah_nama,
          sks: k.sks || 0,
        }
      });
      
      count++;
    }

    return NextResponse.json({ message: "Sukses", total: count });
  } catch (err: any) {
    console.error("Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}