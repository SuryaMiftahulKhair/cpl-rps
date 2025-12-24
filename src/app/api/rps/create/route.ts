import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matakuliah_id, tahun, semester, keterangan } = body;

    // 1. Cari atau Buat Tahun Ajaran
    // Kita cek dulu apakah Tahun/Semester ini sudah ada di database
    let tahunAjaran = await prisma.tahunAjaran.findFirst({
      where: {
        tahun: tahun,
        semester: semester === "1" ? "GANJIL" : "GENAP",
      },
    });

    if (!tahunAjaran) {
      tahunAjaran = await prisma.tahunAjaran.create({
        data: {
          tahun: tahun,
          semester: semester === "1" ? "GANJIL" : "GENAP",
        },
      });
    }

    // 2. Buat Kelas Baru (Ini representasi Versi RPS)
    const newKelas = await prisma.kelas.create({
      data: {
        nama_kelas: keterangan || `Kelas ${tahun}`, // Nama kelas otomatis atau dari keterangan
        mata_kuliah_id: Number(matakuliah_id),
        tahun_ajaran_id: tahunAjaran.id,
      },
    });

    // 3. Buat Entry RPS kosong untuk kelas ini
    await prisma.rPS.create({
      data: {
        file_path: "", // Belum ada file upload
        is_locked: false,
        kelas_id: newKelas.id
      }
    });

    return NextResponse.json(newKelas, { status: 201 });

  } catch (err: any) {
    console.error("POST Create RPS Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}