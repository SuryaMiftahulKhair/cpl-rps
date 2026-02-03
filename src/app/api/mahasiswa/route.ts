import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { Prisma } from "@prisma/client";

// --- GET: AMBIL DATA (Search, Filter, Pagination) ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Ambil Parameter
    const q = searchParams.get("q") || "";          // Keyword pencarian
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 2. Buat Query Filter (Dynamic Where)
    const whereClause: Prisma.MahasiswaWhereInput = {
      AND: [
        // Logika Search (NIM atau Nama)
        q ? {
          OR: [
            { nama: { contains: q, mode: "insensitive" } },
            { nim: { contains: q, mode: "insensitive" } },
          ],
        } : {},
      ],
    };

    // 3. Eksekusi Query (Transaction agar efisien)
    const [data, total] = await prisma.$transaction([
      prisma.mahasiswa.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { nim: "asc" }, // Urutkan berdasarkan NIM
      }),
      prisma.mahasiswa.count({ where: whereClause }),
    ]);

    // 4. Return Response
    return NextResponse.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error("API GET Mahasiswa Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- POST: TAMBAH MAHASISWA MANUAL ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nim, nama } = body;

    // Validasi Dasar
    if (!nim || !nama) {
      return NextResponse.json({ success: false, error: "NIM dan Nama wajib diisi" }, { status: 400 });
    }

    // Cek Duplikasi NIM
    const existing = await prisma.mahasiswa.findUnique({ where: { nim } });
    if (existing) {
      return NextResponse.json({ success: false, error: "NIM sudah terdaftar" }, { status: 400 });
    }

    // Simpan ke Database
    const newMhs = await prisma.mahasiswa.create({
      data: {
        nim,
        nama,

      },
    });

    return NextResponse.json({ success: true, data: newMhs });

  } catch (error: any) {
    console.error("API POST Mahasiswa Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}