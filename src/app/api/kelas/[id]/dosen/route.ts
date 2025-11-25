import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kelasId = parseInt(params.id, 10);
    // ... (validasi kelasId sama)

    const body = await request.json();
    const { nip } = body; // Kita hanya butuh NIP karena Nama sudah ada di DB

    // 1. Cari User Dosen berdasarkan NIP
    const dosen = await prisma.user.findUnique({
        where: { username: nip }, // Asumsi username adalah NIP
    });

    if (!dosen) {
        return NextResponse.json({ error: "Data dosen tidak ditemukan di database User." }, { status: 404 });
    }

    // 2. Cek duplikasi (Dosen sudah ada di kelas?)
    // ... (kode cek existingPengampu sama seperti sebelumnya)

    // 3. Hubungkan
    const pengampuBaru = await prisma.dosenPengampu.create({
      data: {
        kelas_id: kelasId,
        dosen_id: dosen.id,
      },
      include: {
        dosen: true,
      }
    });

    return NextResponse.json(pengampuBaru, { status: 201 });

  } catch (err) {
    console.error("POST /api/kelas/[id]/dosen error:", err);
    return NextResponse.json({ error: "Gagal menambahkan dosen" }, { status: 500 });
  }
}