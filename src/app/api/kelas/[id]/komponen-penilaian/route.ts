import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";
import { getSession } from "@/../lib/auth";

function parseId(paramsId: string | undefined) {
  const n = Number(paramsId);
  return Number.isFinite(n) ? n : NaN;
}

// GET: Ambil SEMUA komponen penilaian dalam satu KELAS
export async function GET(
  req: NextRequest,
  { params }: { params: { kelasId?: string } }
) {
  try {
    // Cek auth (Opsional, sesuaikan kebutuhan)
    // const session = await getSession();
    // if (!session?.userId) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const kelasId = parseId(params.kelasId);
    if (Number.isNaN(kelasId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // Kita ambil CPMK dulu, karena Komponen nempel di CPMK
    const cpmkList = await prisma.cPMK.findMany({
      where: { kelas_id: kelasId },
      include: {
        komponenPenilaian: {
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { kode_cpmk: 'asc' }
    });

    // Ratakan datanya supaya mudah dibaca frontend
    // Kita kembalikan daftar komponen, tapi sertakan info CPMK-nya
    const allKomponen = cpmkList.flatMap(cpmk => 
      cpmk.komponenPenilaian.map(komponen => ({
        ...komponen,
        cpmk_kode: cpmk.kode_cpmk, // Supaya tahu ini nilai untuk CPMK apa
        cpmk_deskripsi: cpmk.deskripsi
      }))
    );

    return NextResponse.json(allKomponen);

  } catch (err: any) {
    console.error("GET Komponen Error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST: Tambah Komponen Penilaian Baru
export async function POST(
  req: NextRequest,
  { params }: { params: { kelasId?: string } }
) {
  try {
    // const session = await getSession();
    // if (!session?.userId || session.role !== 'DOSEN') {
    //   return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    // }

    const body = await req.json();
    const { nama, bobot, cpmk_id } = body;

    if (!nama || bobot === undefined || !cpmk_id) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Buat komponen baru yang nempel ke CPMK
    const newKomponen = await prisma.komponenPenilaian.create({
      data: {
        nama: nama,
        bobot: Number(bobot),
        cpmk_id: Number(cpmk_id),
      },
    });

    return NextResponse.json(newKomponen, { status: 201 });

  } catch (err: any) {
    console.error("POST Komponen Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }

  
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    // const session = await getSession();
    // if (!session?.userId || session.role !== 'DOSEN') {
    //   return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    // }

    const id = parseId(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await prisma.komponenPenilaian.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });

  } catch (err: any) {
    console.error("DELETE Komponen Error:", err);
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}