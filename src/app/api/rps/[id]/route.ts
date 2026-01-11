import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rpsId = Number(id);

    // 1. Ambil Data RPS Lengkap (termasuk Matkul & CPL untuk referensi IK)
    const rps = await prisma.rPS.findUnique({
      where: { id: rpsId },
      include: {
        // Include komponen RPS
        cpmk: {
          include: { ik: true }, // Ambil IK yang sudah dipilih di CPMK
          orderBy: { kode_cpmk: 'asc' }
        },
        pertemuan: {
          orderBy: { pekan_ke: 'asc' }
        },
        // Include Matkul -> CPL -> IK (Untuk opsi dropdown "Pilih IK")
        matakuliah: {
          include: {
            cpl: {
              include: { iks: true } 
            }
          }
        }
      }
    });

    if (!rps) {
      return NextResponse.json({ error: "RPS tidak ditemukan" }, { status: 404 });
    }

    // 2. Siapkan Daftar "Available IKs" (Semua IK dari CPL Matkul ini)
    const availableIks: any[] = [];
    if (rps.matakuliah && rps.matakuliah.cpl) {
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

    // 3. Rapikan Data untuk Frontend
    const data = {
      id: rps.id,
      nomor_dokumen: rps.nomor_dokumen,
      deskripsi: rps.deskripsi,
      materi_pembelajaran: rps.materi_pembelajaran,
      pustaka_utama: rps.pustaka_utama,
      pustaka_pendukung: rps.pustaka_pendukung,
      created_at: rps.createdAt, // Perhatikan casing 'createdAt' vs 'created_at' di prisma kakak
      otorisasi: {
        penyusun: rps.nama_penyusun,
        koordinator: rps.nama_koordinator,
        kaprodi: rps.nama_kaprodi,
        tanggal: rps.tanggal_penyusunan
      },
      // Data Relasi
      matakuliah: {
        nama: rps.matakuliah?.nama,
        kode_mk: rps.matakuliah?.kode_mk,
        sks: rps.matakuliah?.sks,
        semester: rps.matakuliah?.semester,
        sifat: rps.matakuliah?.sifat,
      },
      cpmk: rps.cpmk,
      pertemuan: rps.pertemuan,
      available_iks: availableIks // Ini yang dipakai dropdown
    };

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("GET RPS Detail Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Handler untuk UPDATE RPS (Header, Deskripsi, Otorisasi, dll)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { section, data } = body;

    let updateData: any = {};

    // Mapping update berdasarkan section yang diedit di frontend
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