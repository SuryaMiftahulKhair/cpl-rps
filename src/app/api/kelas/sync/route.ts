import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { fetchKelasFromNeosia } from "@/../lib/neosiaService";
import { getSession } from "@/../lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Cek Login
    const session = await getSession();
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized: Token kampus tidak ditemukan." }, { status: 401 });
    }

    const { semesterId, kodeNeosia, prodiId, kurikulumId } = await request.json();

    if (!semesterId || !kodeNeosia) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const tahunAjaranId = parseInt(semesterId);

    // 2. Cari ID Kurikulum (Fallback ke terbaru)
    // Ini tetap dipakai untuk mengisi tabel master 'MataKuliah'
    let targetKurikulumId = kurikulumId ? Number(kurikulumId) : 0;
    if (!targetKurikulumId) {
        const latest = await prisma.kurikulum.findFirst({ orderBy: { tahun: 'desc' } });
        if (!latest) return NextResponse.json({ error: "Kurikulum kosong." }, { status: 400 });
        targetKurikulumId = latest.id;
    }

    // 3. Ambil Data dari Neosia
    console.log(`[SyncAPI] Memulai sync...`);
    const kelasNeosia = await fetchKelasFromNeosia(
        kodeNeosia, 
        prodiId || "18", 
        session.accessToken
    );
    console.log(`[SyncAPI] Diterima: ${kelasNeosia.length} kelas.`);

    let count = 0;

    // 4. Proses Simpan (Looping)
    for (const k of kelasNeosia) {
      // ID Unik untuk sinkronisasi
      const uniqueNeosiaId = `${kodeNeosia}-${k.mata_kuliah_kode}-${k.kelas_kuliah_nama}`;

      // A. Upsert Mata Kuliah (Katalog Master)
      // Kita tetap simpan ini sebagai referensi, walaupun tidak terhubung langsung ke Kelas di schema baru
      await prisma.mataKuliah.upsert({
         where: { kode_mk: k.mata_kuliah_kode },
         update: { 
             nama: k.mata_kuliah_nama,
             sks: k.sks || 0
         },
         create: {
             kode_mk: k.mata_kuliah_kode,
             nama: k.mata_kuliah_nama,
             sks: k.sks || 0,
             semester: 1,      // Default
             sifat: "Wajib",   // Default
             kurikulum_id: targetKurikulumId 
         }
      });

      // B. Upsert Kelas (Pelaksanaan) - VERSI SCHEMA BARU
      await prisma.kelas.upsert({
        where: {
          neosia_id: uniqueNeosiaId,
        },
        update: {
            nama_kelas: k.kelas_kuliah_nama,
            // Perbarui data MK jika berubah di Neosia
            kode_mk: k.mata_kuliah_kode,
            nama_mk: k.mata_kuliah_nama,
            sks: k.sks || 0,
        },
        create: {
          neosia_id: uniqueNeosiaId,
          nama_kelas: k.kelas_kuliah_nama,
          tahun_ajaran_id: tahunAjaranId,
          
          // Data MK langsung disimpan di tabel Kelas (Denormalisasi)
          kode_mk: k.mata_kuliah_kode, 
          nama_mk: k.mata_kuliah_nama,
          sks: k.sks || 0,
        }
      });
      
      count++;
    }

    return NextResponse.json({ message: "Sukses sinkronisasi data", total: count });

  } catch (err: any) {
    console.error("Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}