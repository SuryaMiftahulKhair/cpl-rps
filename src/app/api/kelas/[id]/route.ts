// file: src/app/api/kelas/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; 

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID Kelas tidak valid" }, { status: 400 });
    }

    const kelas = await prisma.kelas.findUnique({
      where: {
        id: id,
      },

      include: {
        mataKuliah: true, 
        tahunAjaran: true, 
        dosenPengampu: {
          
          include: {
            dosen: true, 
          },
        },
        pesertaKelas: {
          
          include: {
            mahasiswa: true, 
          },
          orderBy: {
            mahasiswa: { id: "asc" }, 
          },
        },
      },
    });

    
    if (!kelas) {
      return NextResponse.json(
        { error: `Kelas dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    const responseData = {
      kelasInfo: {
        namaKelas: kelas.nama_kelas,
        kodeMatakuliah: kelas.mataKuliah.kode_mk,
        namaMatakuliah: kelas.mataKuliah.nama,
        tahunAjaran: `${kelas.tahunAjaran.semester} ${kelas.tahunAjaran.tahun}`,
      },
      dosenList: kelas.dosenPengampu.map((dp) => ({
        id: dp.id, // ID relasi DosenPengampu
        nip: dp.dosen.username, // Asumsi NIP disimpan di 'username'
        nama: dp.dosen.nama,
        posisi: "Pengampu", // Anda bisa tambahkan 'posisi' di skema jika perlu
      })),
      mahasiswaList: kelas.pesertaKelas.map((pk, index) => ({
        id: pk.id, // ID relasi PesertaKelas
        no: index + 1,
        nim: pk.mahasiswa.username, // Asumsi NIM disimpan di 'username'
        nama: pk.mahasiswa.nama,
      })),
    };

    // 5. Kembalikan data yang sudah dimapping
    return NextResponse.json(responseData, { status: 200 });

  } catch (err) {
    console.error(`GET /api/kelas/${params.id} error:`, err);
    return NextResponse.json(
      { error: "Gagal mengambil detail kelas" },
      { status: 500 }
    );
  }
}

// TODO: Tambahkan fungsi DELETE untuk menghapus DosenPengampu atau PesertaKelas
// export async function DELETE(request: Request) { ... }