import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

// Fungsi parseId
function parseId(paramsId: string | undefined) {
  const n = Number(paramsId);
  return Number.isFinite(n) ? n : NaN;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matakuliahId: string }> } // Support Next.js 15
) {
  try {
    const { matakuliahId } = await params;
    const mkId = parseId(matakuliahId);

    if (Number.isNaN(mkId)) {
      return NextResponse.json({ error: "ID Mata Kuliah tidak valid" }, { status: 400 });
    }

    // 1. Cari dulu Kode MK-nya dari tabel MataKuliah
    const mataKuliah = await prisma.mataKuliah.findUnique({
      where: { id: mkId },
      select: { kode_mk: true }
    });

    if (!mataKuliah) {
      return NextResponse.json({ error: "Mata Kuliah tidak ditemukan" }, { status: 404 });
    }

    // 2. Cari semua Kelas berdasarkan 'kode_mk' (Bukan ID lagi)
    const kelasList = await prisma.kelas.findMany({
      where: { 
        kode_mk: mataKuliah.kode_mk // <-- Perbaikan di sini
      },
      include: {
        tahun_ajaran: true, // Sesuaikan dengan nama field di schema (snake_case)
        cpmk: {
          include: {
            komponenPenilaian: true,
          }
        }
      },
      orderBy: {
        tahun_ajaran: { tahun: 'desc' }
      }
    });

    // 3. Format data agar sesuai tampilan UI
    const formattedRiwayat = kelasList.map(kelas => {
      // Pastikan kelas.cpmk bertipe array
      const cpmkArr = (kelas.cpmk ?? []) as Array<{ komponenPenilaian: Array<{ nama: string; bobot: number }> }>;
      // Menggabungkan semua komponen penilaian
      const allKomponen = cpmkArr.flatMap(c => c.komponenPenilaian);
      
      const komponenMap = new Map<string, number>();
      allKomponen.forEach(k => {
          komponenMap.set(k.nama, (komponenMap.get(k.nama) || 0) + k.bobot);
      });
      const komponen = Array.from(komponenMap, ([nama, bobot]) => ({ nama, bobot }));

      const finalKomponen = komponen.length > 0 ? komponen : [
            { nama: "Tugas", bobot: 15.00 },
            { nama: "Aktivitas Partisipatif", bobot: 50.00 },
            { nama: "Quiz", bobot: 5.00 },
            { nama: "Ujian Tengah Semester", bobot: 10.00 },
            { nama: "Ujian Akhir Semester", bobot: 20.00 },
      ];

      return {
        id: kelas.id,
        // Perhatikan nama field tahun_ajaran (sesuai schema)
        tahunAjaran: kelas.tahun_ajaran?.tahun ?? "Unknown",
        semester: kelas.tahun_ajaran?.semester ?? "Unknown",
        komponen: finalKomponen,
        _aktif: true,
      }
    });

    return NextResponse.json(formattedRiwayat);

  } catch (err: any) {
    console.error("GET /api/rps/riwayat error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}