// file: src/app/api/laporan/cpl-mahasiswa/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { calculateAvgKomponen, calculateCPMKScore, calculateCoefficient } from "@/utils/cplCalculation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { semester_ids, nim } = body; // Filter

    if (!semester_ids || semester_ids.length === 0) {
      return NextResponse.json({ students: [], cplData: [] });
    }

    // --- CASE A: Load Daftar Mahasiswa (Jika NIM kosong) ---
    if (!nim) {
      // Cari mahasiswa yang punya nilai di semester tsb
      const students = await prisma.pesertaKelas.findMany({
        where: {
          kelas: { tahun_ajaran_id: { in: semester_ids } }
        },
        distinct: ['nim'], // Unique NIM
        select: {
          nim: true,
          nama: true,
          // Ambil angkatan dari NIM (opsional, logic manual string slice)
        },
        orderBy: { nim: 'asc' }
      });
      return NextResponse.json({ students });
    }

    // --- CASE B: Hitung CPL Mahasiswa (Jika NIM ada) ---
    // 1. Ambil Kelas yang diikuti mahasiswa ini di semester tsb
    const enrolledClasses = await prisma.pesertaKelas.findMany({
      where: {
        nim: nim,
        kelas: { tahun_ajaran_id: { in: semester_ids } }
      },
      include: {
        nilai: true, // Nilai mahasiswa ini
        kelas: {
          include: {
            matakuliah: { include: { cpl: { include: { iks: true } } } },
            cpmk: { include: { ik: true, pemetaan_komponen: true } },
            komponenNilai: true
          }
        }
      }
    });

    const allCPL = await prisma.cPL.findMany({ orderBy: { kode_cpl: 'asc' } });
    const cplScores: Record<string, { score: number; coef: number }> = {};

    // Inisialisasi Score
    allCPL.forEach(c => cplScores[c.kode_cpl] = { score: 0, coef: 0 });

    // Loop setiap kelas yang diambil mahasiswa
    for (const enrollment of enrolledClasses) {
      const kelas = enrollment.kelas;
      if (!kelas.matakuliah) continue;

      // 1. Map Nilai Mahasiswa per Komponen
      const mapNilaiMhs: Record<number, number> = {};
      enrollment.nilai.forEach(n => {
        mapNilaiMhs[n.komponen_nilai_id] = n.nilai_angka;
      });

      // 2. Hitung Kontribusi ke CPL
      kelas.matakuliah.cpl.forEach(cpl => {
        let totalCPLScore = 0;
        let totalCPLCoef = 0;

        const relevantCPMKs = kelas.cpmk.filter(c => c.ik.some(ik => ik.cpl_id === cpl.id));

        relevantCPMKs.forEach(cpmk => {
          // Hitung Nilai CPMK Mahasiswa Ini
          const mappings = (cpmk.pemetaan_komponen as any[]).map((pk: any) => ({
            avg: mapNilaiMhs[pk.komponen_nilai_id] || 0, // Nilai Individu
            bobot: pk.bobot
          }));
          const scoreCPMK = calculateCPMKScore(mappings);

          // Koefisien
          const ikLink = cpmk.ik.filter(ik => ik.cpl_id === cpl.id).length;
          const coef = calculateCoefficient(kelas.matakuliah!.sks, ikLink, cpl.iks.length);

          totalCPLScore += scoreCPMK * coef;
          totalCPLCoef += coef;
        });

        // Akumulasi ke Total CPL Mahasiswa
        if (cplScores[cpl.kode_cpl]) {
          cplScores[cpl.kode_cpl].score += totalCPLScore;
          cplScores[cpl.kode_cpl].coef += totalCPLCoef;
        }
      });
    }

    // Format Result
    const studentCPLData = allCPL.map(c => {
      const agg = cplScores[c.kode_cpl];
      const finalScore = agg.coef > 0 ? agg.score / agg.coef : 0;
      
      return {
        code: c.kode_cpl,
        cplLo: `CPL/LO ${c.kode_cpl.replace(/\D/g, '')}`, // Extract number
        nilai: parseFloat(finalScore.toFixed(2)),
        description: c.deskripsi,
        descriptionEn: "-" // Bisa ditambah kolom di DB jika mau
      };
    });

    return NextResponse.json({ cplData: studentCPLData });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}