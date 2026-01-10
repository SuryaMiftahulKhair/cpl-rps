import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma"; // Sesuaikan path jika perlu (misal @/lib/prisma)
import { getSession } from "@/../lib/auth"; // Sesuaikan path auth

export async function GET(req: NextRequest) {
  try {
    // 1. Cek Session
    const session = await getSession();
    
    // Debugging: Cek apakah session terbaca
    console.log("Session Data:", session);

    if (!session || !session.prodiId) {
      console.log("Error: User tidak punya prodiId");
      return NextResponse.json({ error: "Unauthorized: Prodi ID missing" }, { status: 401 });
    }

    const userProdiId = Number(session.prodiId);

    // 2. Query Database
    // Pastikan nama relasi '_count' sesuai dengan schema.prisma terakhir
    const data = await prisma.kurikulum.findMany({
      where: {
        prodi_id: userProdiId 
      },
      include: {
        _count: {
          select: { 
            cpl: true,       // Pastikan di schema namanya 'cpl'
            mataKuliah: true // Pastikan di schema namanya 'mataKuliah' (camelCase)
          }
        },
        programStudi: true   // Pastikan di schema namanya 'programStudi'
      },
      orderBy: {
        tahun: 'desc'
      }
    });

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    // INI PENTING: Lihat error aslinya di Terminal VSCode
    console.error("API Kurikulum Error:", err); 
    
    return NextResponse.json({ 
      success: false, 
      error: "Server Error", 
      detail: err.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.prodiId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userProdiId = Number(session.prodiId);

    const body = await req.json();
    const { nama, tahun } = body;

    const newKurikulum = await prisma.kurikulum.create({
      data: {
        nama,
        tahun: Number(tahun),
        prodi_id: userProdiId
      }
    });

    return NextResponse.json({ success: true, data: newKurikulum });

  } catch (err: any) {
    console.error("Create Kurikulum Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}