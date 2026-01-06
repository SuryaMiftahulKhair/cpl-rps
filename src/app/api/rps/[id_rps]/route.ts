import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// --- GET: Ambil Detail RPS ---
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id_rps: string }> }
) {
  try {
    const { id_rps } = await params;
    const rpsId = Number(id_rps);

    if (isNaN(rpsId)) {
      return NextResponse.json({ success: false, error: "ID RPS tidak valid" }, { status: 400 });
    }

    // UBAH DISINI: Cari langsung ke tabel RPS (rPS), bukan Kelas
    const rps = await prisma.rPS.findUnique({
      where: { id: rpsId },
      include: {
        // Ambil data Mata Kuliah parent-nya
        matakuliah: {
          include: {
            kurikulum: {
              include: {
                cpl: true // Ambil CPL dari Kurikulum
              }
            }
          }
        },
        // Ambil Pertemuan
        pertemuan: {
          orderBy: { pekan_ke: 'asc' }
        },
        // Ambil CPMK (jika ada relasinya)
        cpmk: true 
      }
    });

    if (!rps) {
      return NextResponse.json({ success: false, error: "RPS tidak ditemukan" }, { status: 404 });
    }

    // Format Data untuk Frontend
    const data = {
        id: rps.id,
        created_at: rps.createdAt,
        updated_at: rps.updatedAt,
        
        // Data Otorisasi (Dari kolom baru di tabel RPS)
        otorisasi: {
            nomor: rps.nomor_dokumen || "-",
            tanggal: rps.tanggal_penyusunan,
            penyusun: rps.nama_penyusun || "Tim Dosen",
            koordinator: rps.nama_koordinator || "Koordinator MK",
            kaprodi: rps.nama_kaprodi || "Ketua Prodi"
        },

        // Data Matkul
        kode_mk: rps.matakuliah?.kode_mk,
        nama_mk: rps.matakuliah?.nama,
        sks: rps.matakuliah?.sks,
        semester: rps.matakuliah?.semester,
        sifat: rps.matakuliah?.sifat,

        // Isi RPS
        deskripsi: rps.deskripsi,
        materi_pembelajaran: rps.materi_pembelajaran,
        pustaka_utama: rps.pustaka_utama,
        pustaka_pendukung: rps.pustaka_pendukung,
        
        // CPL (Mapping dari Kurikulum)
        cpl_prodi: rps.matakuliah?.kurikulum?.cpl.map(c => ({
            kode: c.kode_cpl,
            deskripsi: c.deskripsi
        })) || [],

        // CPMK
        cpmk: rps.cpmk || [],

        // Pertemuan
        pertemuan: rps.pertemuan
    };

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Get RPS Detail Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- PUT: Update RPS (Untuk Fitur Edit) ---
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id_rps: string }> }
) {
  try {
    const { id_rps } = await params;
    const rpsId = Number(id_rps);
    const body = await req.json();
    const { section, data } = body; 

    let updateData = {};

    // Logic Mapping Update
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
    } else {
        return NextResponse.json({ success: false, error: "Section tidak valid" }, { status: 400 });
    }

    // Eksekusi Update
    const updated = await prisma.rPS.update({
      where: { id: rpsId },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    console.error("Update RPS Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}