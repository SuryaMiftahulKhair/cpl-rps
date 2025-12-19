// file: src/app/api/kelas/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; 

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID Kelas tidak valid" }, { status: 400 });
    }

    const kelas = await prisma.kelas.findUnique({
      where: {
        id: id,
      },
      include: {
        // HAPUS BARIS INI: mataKuliah: true, (Karena tabelnya sudah tidak ada)
        
        tahun_ajaran: true, 
        // Asumsi tabel DosenPengampu & PesertaKelas masih ada relasinya
        dosen_pengampu: {
          include: {
            dosen: true, // Pastikan relasi ini valid di schema.prisma
          },
        },
        peserta_kelas: {
          include: {
            mahasiswa: true, 
          },
          orderBy: {
            mahasiswa: { username: "asc" }, // Biasanya sorting by NIM (username) bukan ID
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
        // PERBAIKAN: Ambil langsung dari tabel Kelas
        kodeMatakuliah: kelas.kode_mk, 
        namaMatakuliah: kelas.nama_mk,
        sks: kelas.sks, // Tambahkan SKS jika perlu
        
        tahunAjaran: `${kelas.tahun_ajaran.semester} ${kelas.tahun_ajaran.tahun}`,
      },
      // Mapping Dosen (Pastikan struktur DosenPengampu -> Dosen benar)
      dosenList: kelas.dosen_pengampu?.map((dp) => ({
        id: dp.id, 
        // Sesuaikan field dosen (misal: nip/username, nama)
        nip: dp.dosen?.username || "-", 
        nama: dp.dosen?.nama || "-",
        posisi: "Pengampu",
      })) || [],
      // Mapping Mahasiswa
      mahasiswaList: kelas.peserta_kelas?.map((pk, index) => ({
        id: pk.id, 
        no: index + 1,
        nim: pk.mahasiswa?.username || "-", 
        nama: pk.mahasiswa?.nama || "-",
      })) || [],
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (err) {
    console.error(`GET /api/kelas/${(await params).id} error:`, err);
    return NextResponse.json(
      { error: "Gagal mengambil detail kelas" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Perbaikan Type params
) {
  try {
    // ID Kelas
    const id = parseInt((await params).id, 10);

    const body = await request.json().catch(() => null);
    if (!body || !body.dosenPengampuId) {
      return NextResponse.json(
        { error: "dosenPengampuId wajib disertakan dalam body." }, 
        { status: 400 }
      );
    }

    const { dosenPengampuId } = body;

    // Cek apakah data pengampu ada di kelas ini
    const record = await prisma.dosenPengampu.findFirst({
      where: {
        id: dosenPengampuId,
        kelas_id: id 
      }
    });

    if (!record) {
      return NextResponse.json({ error: "Data pengampu tidak ditemukan di kelas ini" }, { status: 404 });
    }

    // Hapus Dosen Pengampu
    await prisma.dosenPengampu.delete({
      where: { id: dosenPengampuId },
    });

    // --- BUG FIX ---
    // HAPUS BAGIAN INI:
    // await prisma.dosenPengampu.delete({ where: { id: id } }); 
    // Alasan: 'id' di sini adalah ID KELAS, bukan ID DosenPengampu. 
    // Jika dijalankan, ini akan error (Record not found) atau malah menghapus data orang lain secara acak.

    return NextResponse.json({ message: "Dosen berhasil dihapus dari kelas" }, { status: 200 });

  } catch (err) {
    console.error("DELETE /api/kelas/[id] error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus dosen dari kelas" },
      { status: 500 }
    );
  }
}