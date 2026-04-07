import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { Delete } from "lucide-react";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Ambil data dari body (Gunakan ik_ids sesuai kiriman modal terbaru)
    const { rps_id, kode_cpmk, deskripsi, ik_ids, bobot } = body;

    if (!rps_id || !kode_cpmk) {
      return NextResponse.json({ error: "Data wajib diisi" }, { status: 400 });
    }

    // 1. CEK APAKAH IK SUDAH DIPAKAI DI RPS INI (Cari via tabel CPMK)
    // 1. CEK APAKAH IK SUDAH DIPAKAI DI RPS INI
    const duplicateCpmk = await prisma.cPMK.findMany({
      where: {
        // Karena relasi Many-to-Many, kita harus pakai 'some'
        rps: {
          some: {
            id: Number(rps_id),
          },
        },
        ik: {
          some: {
            id: { in: ik_ids.map((id: any) => Number(id)) },
          },
        },
      },
      include: {
        ik: true,
      },
    });

    if (duplicateCpmk.length > 0) {
      // Ambil kode-kode IK yang memang duplikat di RPS tersebut
      const inputIds = ik_ids.map((id: any) => Number(id));
      const usedIkCodes = duplicateCpmk
        .flatMap((c) => c.ik)
        .filter((ik) => inputIds.includes(ik.id))
        .map((ik) => ik.kode_ik);

      // Menghilangkan duplikat nama kode_ik jika ada
      const uniqueUsedCodes = Array.from(new Set(usedIkCodes));

      return NextResponse.json(
        {
          success: false,
          error: `Gagal! Indikator [${uniqueUsedCodes.join(
            ", ",
          )}] sudah digunakan pada ${duplicateCpmk[0].kode_cpmk} di RPS ini.`,
        },
        { status: 400 },
      );
    }

    // 2. Simpan ke database menggunakan Prisma Singleton
    const newCpmk = await prisma.cPMK.create({
      data: {
        kode_cpmk,
        deskripsi,
        bobot_cpmk: bobot ? parseInt(String(bobot)) : 0,

        // Hubungkan ke RPS
        rps: {
          connect: { id: Number(rps_id) },
        },

        // LOGIC BARU: Hubungkan ke banyak IK sekaligus (Many-to-Many atau One-to-Many)
        // Kita memetakan array ID menjadi format [{id: 1}, {id: 2}]
        ik:
          Array.isArray(ik_ids) && ik_ids.length > 0
            ? {
                connect: ik_ids.map((id: string | number) => ({
                  id: Number(id),
                })),
              }
            : undefined,
      },
      // Sertakan data IK dalam response agar UI bisa langsung update tanpa refresh
      include: {
        ik: true,
      },
    });

    return NextResponse.json({ success: true, data: newCpmk });
  } catch (err: any) {
    console.error("Create CPMK Error:", err);

    // Proteksi jika terjadi error koneksi database
    if (err.message.includes("Can't reach database server")) {
      return NextResponse.json(
        { error: "Koneksi database sibuk (Neon), silakan coba lagi." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
