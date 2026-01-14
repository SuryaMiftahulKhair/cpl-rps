import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// GET: Ambil Data RPS Lengkap
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rpsId = Number(id);

    const rps = await prisma.rPS.findUnique({
      where: { id: rpsId },
      include: {
        // Ambil CPMK & IK-nya
        cpmk: {
          include: { ik: true }, 
          orderBy: { kode_cpmk: 'asc' }
        },
        pertemuan: { orderBy: { pekan_ke: 'asc' } },
        matakuliah: {
          include: {
            cpl: { include: { iks: true } } // Ambil Master IK dari CPL Matkul
          }
        }
      }
    });

    if (!rps) return NextResponse.json({ error: "RPS tidak ditemukan" }, { status: 404 });

    // Ratakan list IK yang tersedia untuk dropdown (Berasal dari CPL Matkul)
    const availableIks: any[] = [];
    if (rps.matakuliah?.cpl) {
      rps.matakuliah.cpl.forEach(c => {
        if (c.iks) {
          c.iks.forEach(ik => {
            availableIks.push({
              id: ik.id,
              kode: ik.kode_ik,
              deskripsi: ik.deskripsi,
              cpl_kode: c.kode_cpl
            });
          });
        }
      });
    }

    return NextResponse.json({ success: true, data: { ...rps, available_iks: availableIks } });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update Data (Otorisasi, Deskripsi, dll)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { section, data } = body;

    let updateData: any = {};

    // MAPPING SESUAI SCHEMA KAKAK
    if (section === 'otorisasi') {
      updateData = {
        nama_penyusun: data.penyusun,
        nama_koordinator: data.koordinator,
        nama_kaprodi: data.kaprodi
      };
    } else if (section === 'deskripsi') {
      updateData = { deskripsi: data };
    } else if (section === 'materi') {
      updateData = { materi_pembelajaran: data };
    } else if (section === 'pustaka') {
      updateData = { 
        pustaka_utama: data.utama, 
        pustaka_pendukung: data.pendukung 
      };
    }

    const updated = await prisma.rPS.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}