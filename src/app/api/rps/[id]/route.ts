import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. WAJIB Await params (Standar Next.js 15)
    const { id } = await params;
    const rpsId = parseInt(id);

    if (isNaN(rpsId)) {
      return NextResponse.json(
        { error: "ID RPS tidak valid" },
        { status: 400 },
      );
    }

    // 2. Fetch Data dengan pengamanan relasi
    const rps = await prisma.rPS.findUnique({
      where: { id: rpsId },
      include: {
        cpmk: {
          include: { ik: true },
          orderBy: { kode_cpmk: "asc" },
        },
        pertemuan: { orderBy: { pekan_ke: "asc" } },
        matakuliah: {
          include: {
            cpl: { include: { iks: true } },
          },
        },
      },
    });

    if (!rps) {
      return NextResponse.json(
        { error: "Data RPS tidak ditemukan di database" },
        { status: 404 },
      );
    }

    // 3. FIX ERROR 500: Normalisasi Data Json nama_penyusun
    // Seringkali Prisma mengembalikan data Json dalam bentuk string atau object bertumpuk
    let finalPenyusun = rps.nama_penyusun;
    try {
      if (typeof finalPenyusun === "string") {
        finalPenyusun = JSON.parse(finalPenyusun);
      }
      // Jika formatnya {"set": [...]}, ambil isinya
      if (
        finalPenyusun &&
        typeof finalPenyusun === "object" &&
        "set" in (finalPenyusun as any)
      ) {
        finalPenyusun = (finalPenyusun as any).set;
      }
    } catch (e) {
      finalPenyusun = rps.nama_penyusun; // fallback
    }

    // 4. Bangun list Available IKs (Pastikan tidak crash jika cpl null)
    const availableIks: any[] = [];
    if (rps.matakuliah?.cpl && Array.isArray(rps.matakuliah.cpl)) {
      rps.matakuliah.cpl.forEach((c: any) => {
        if (c.iks && Array.isArray(c.iks)) {
          c.iks.forEach((ik: any) => {
            availableIks.push({
              id: ik.id,
              kode: ik.kode_ik,
              deskripsi: ik.deskripsi,
              cpl_kode: c.kode_cpl,
            });
          });
        }
      });
    }

    // 5. Kirim respon sukses
    return NextResponse.json({
      success: true,
      data: {
        ...rps,
        nama_penyusun: finalPenyusun, // Data sudah dibersihkan
        available_iks: availableIks,
      },
    });
  } catch (err: any) {
    // Tampilkan error detail di terminal VS Code Kakak
    console.error("CRASH PADA API GET RPS:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal: " + err.message,
      },
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
