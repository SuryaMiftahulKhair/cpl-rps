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
        id: dp.id, 
        nip: dp.dosen.username,
        nama: dp.dosen.nama,
        posisi: "Pengampu",
      })),
      mahasiswaList: kelas.pesertaKelas.map((pk, index) => ({
        id: pk.id, 
        no: index + 1,
        nim: pk.mahasiswa.username, 
        nama: pk.mahasiswa.nama,
      })),
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    const body = await request.json().catch(() => null);
    if (!body || !body.dosenPengampuId) {
      return NextResponse.json(
        { error: "dosenPengampuId wajib disertakan dalam body untuk menghapus dosen." }, 
        { status: 400 }
      );
    }
    const { dosenPengampuId } = body;
    const record = await prisma.dosenPengampu.findFirst({
      where: {
        id: dosenPengampuId,
        kelas_id: id 
      }
    });

    if (!record) {
      return NextResponse.json({ error: "Data pengampu tidak ditemukan di kelas ini" }, { status: 404 });
    }

    await prisma.dosenPengampu.delete({
      where: { id: dosenPengampuId },
    });

    await prisma.dosenPengampu.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Dosen berhasil dihapus dari kelas" }, { status: 200 });

  } catch (err) {
    console.error("DELETE /api/kelas/[id] error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus dosen dari kelas" },
      { status: 500 }
    );
  }
}

