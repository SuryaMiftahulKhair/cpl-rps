import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

function parseId(paramsId: string | undefined) {
  const n = Number(paramsId);
  return Number.isFinite(n) ? n : NaN;
}

// GET /api/rps/riwayat/[matakuliahId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise < { matakuliahId?: string } > }
) {
  try {
    const mkId = parseId((await params).matakuliahId);
    if (Number.isNaN(mkId)) {
      return NextResponse.json({ error: "ID Mata Kuliah tidak valid" }, { status: 400 });
    }

    // Cari semua Kelas yang menggunakan mata kuliah ini
    // Asumsi: RPS melekat pada Kelas (semester pelaksanaan)
    const kelasList = await prisma.kelas.findMany({
      where: { mata_kuliah_id: mkId },
      include: {
        tahunAjaran: true,
        cpmk: {
          include: {
            komponenPenilaian: true
          }
        }
      },
      orderBy: {
        tahunAjaran: { tahun: 'desc' }
      }
    });

    // Format data agar sesuai tampilan UI
    const riwayat = kelasList.map(k => {
      // Menggabungkan semua komponen penilaian dari semua CPMK di kelas ini
      const komponenRaw = k.cpmk.flatMap(c => c.komponenPenilaian);
      
      // (Opsional) Gabungkan komponen dengan nama sama jika perlu, 
      // atau tampilkan apa adanya. Di sini kita tampilkan apa adanya.
      const komponen = komponenRaw.map(kp => ({
        nama: kp.nama,
        bobot: kp.bobot
      }));

      return {
        id: k.id, // ID Kelas
        tahunAjaran: k.tahunAjaran.tahun,
        semester: k.tahunAjaran.semester,
        komponen: komponen,
        _aktif: true // Logic aktif/tidak bisa disesuaikan nanti
      };
    });

    return NextResponse.json(riwayat);

  } catch (err) {
    console.error("GET Riwayat RPS Error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}