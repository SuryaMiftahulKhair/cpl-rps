//src/app/api/rps/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rpsId = parseInt(id);

    if (isNaN(rpsId)) {
      return NextResponse.json(
        { error: "ID RPS tidak valid" },
        { status: 400 },
      );
    }

    // 2. Fetch Data dengan pengambilan relasi yang TEPAT
    const rps = await prisma.rPS.findUnique({
      where: { id: rpsId },
      include: {
        cpmk: {
          include: { ik: true, sub_cpmk: true },
          orderBy: { kode_cpmk: "asc" },
        },
        pertemuan: {
          orderBy: { pekan_ke: "asc" },
          include: { sub_cpmk: true },
        },
        matakuliah: {
          include: {
            // INI DIA: Ambil IK yang terhubung langsung ke MK (hasil centang matriks)
            iks: {
              include: {
                cpl: true, // Tarik data CPL-nya juga supaya dapet kode_cpl
              },
            },
            cpl: true,
          },
        },
      },
    });

    if (!rps) {
      return NextResponse.json(
        { error: "RPS tidak ditemukan" },
        { status: 404 },
      );
    }

    // 3. Normalisasi nama_penyusun (tetap gunakan logika Kakak yang sudah bagus)
    let finalPenyusun = rps.nama_penyusun;
    try {
      if (typeof finalPenyusun === "string")
        finalPenyusun = JSON.parse(finalPenyusun);
      if (
        finalPenyusun &&
        typeof finalPenyusun === "object" &&
        "set" in (finalPenyusun as any)
      ) {
        finalPenyusun = (finalPenyusun as any).set;
      }
    } catch (e) {
      finalPenyusun = rps.nama_penyusun;
    }

    // 4. Bangun list Available IKs dari RELASI LANGSUNG (Bukan dari CPL lagi)
    const availableIks: any[] = [];

    // Kita ambil data dari rps.matakuliah.iks (Hasil Centang Matriks)
    if (rps.matakuliah?.iks && Array.isArray(rps.matakuliah.iks)) {
      rps.matakuliah.iks.forEach((ik: any) => {
        availableIks.push({
          id: ik.id,
          kode: ik.kode_ik, // Di frontend kita pakai ik.kode
          deskripsi: ik.deskripsi,
          cpl_kode: ik.cpl?.kode_cpl || "CPL", // Ambil dari include cpl tadi
        });
      });
    }

    // 5. Kirim respon sukses
    return NextResponse.json({
      success: true,
      data: {
        ...rps,
        nama_penyusun: finalPenyusun,
        available_iks: availableIks, // Sekarang isinya hasil centang matriks!
      },
    });
  } catch (err: any) {
    console.error("CRASH PADA API GET RPS:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// PUT tetap gunakan logika pembersihan yang sama
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { section, data } = body;

    if (section === "otorisasi") {
      let cleanPenyusun = data.nama_penyusun;

      if (Array.isArray(cleanPenyusun)) {
        cleanPenyusun = cleanPenyusun.map((n: any) =>
          typeof n === "object" ? n.nama : n,
        );
      }

      // Gunakan prisma.rPS (r kecil, PS besar) sesuai penamaan model RPS di schema
      await prisma.rPS.update({
        where: { id: Number(id) },
        data: {
          nama_penyusun: cleanPenyusun || [],
          nama_koordinator: data.nama_koordinator || null,
          nama_kaprodi: data.nama_kaprodi || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("CRASH PADA API PUT RPS:", error);

    // Jika error karena database tidak terjangkau
    if (error.message.includes("Can't reach database server")) {
      return NextResponse.json(
        {
          success: false,
          error: "Koneksi database sibuk, coba beberapa saat lagi.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
