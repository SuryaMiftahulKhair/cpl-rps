// file: src/app/api/laporan/cpl-prodi/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { calculateAvgKomponen, calculateCPMKScore, calculateCoefficient } from "@/utils/cplCalculation";

export async function POST(req: Request) {
  try {
    // Menerima array ID, contoh: [1, 2] untuk satu tahun, atau [5] untuk satu semester
    const { semester_ids } = await req.json();

    if (!semester_ids || semester_ids.length === 0) {
      return NextResponse.json({ radarData: [], courseData: [] });
    }

    // 1. Ambil Semua Kelas di Semester-semester tersebut
    const classes = await prisma.kelas.findMany({
      where: { 
        tahun_ajaran_id: { in: semester_ids } // Filter IN Array
      },
      include: {
        matakuliah: { include: { cpl: { include: { iks: true } } } },
        komponenNilai: { include: { nilai: true, pemetaan_cpmk: true } },
        cpmk: { include: { ik: true, pemetaan_komponen: true } }
      }
    });

    const allCPL = await prisma.cPL.findMany({ orderBy: { kode_cpl: 'asc' } });
    const cplAggregator: Record<string, { totalScore: number; totalCoef: number }> = {};
    const courseData: any[] = [];

    // --- LOGIKA PERHITUNGAN (Sama seperti sebelumnya) ---
    for (const kelas of classes) {
      if (!kelas.matakuliah) continue;

      const kelasScores: Record<string, number> = {}; 
      const mapAvgKomp: Record<number, number> = {};
      
      kelas.komponenNilai.forEach(k => {
        const nilaiArr = k.nilai.map(n => n.nilai_angka);
        mapAvgKomp[k.id] = calculateAvgKomponen(nilaiArr);
      });

      kelas.matakuliah.cpl.forEach(cpl => {
        let totalCPLScore = 0;
        let totalCPLCoef = 0;

        const relevantCPMKs = kelas.cpmk.filter(c => c.ik.some(ik => ik.cpl_id === cpl.id));

        relevantCPMKs.forEach(cpmk => {
          const mappings = (cpmk.pemetaan_komponen as any[]).map((pk: any) => ({
            avg: mapAvgKomp[pk.komponen_nilai_id] || 0,
            bobot: pk.bobot
          }));
          
          const scoreCPMK = calculateCPMKScore(mappings);
          const ikLink = cpmk.ik.filter(ik => ik.cpl_id === cpl.id).length;
          const sks = kelas.matakuliah?.sks || 0;
          const coef = calculateCoefficient(sks, ikLink, cpl.iks.length);

          totalCPLScore += scoreCPMK * coef;
          totalCPLCoef += coef;
        });

        const finalKelasCPL = totalCPLCoef > 0 ? (totalCPLScore / totalCPLCoef) : 0;
        kelasScores[cpl.kode_cpl] = finalKelasCPL;

        if (!cplAggregator[cpl.kode_cpl]) cplAggregator[cpl.kode_cpl] = { totalScore: 0, totalCoef: 0 };
        // Agregasi (Rata-rata tertimbang sederhana antar kelas)
        if (finalKelasCPL > 0) { // Hanya hitung jika ada nilai
             cplAggregator[cpl.kode_cpl].totalScore += finalKelasCPL;
             cplAggregator[cpl.kode_cpl].totalCoef += 1; 
        }
      });

      courseData.push({
        id: kelas.id,
        code: kelas.kode_mk,
        name: kelas.matakuliah.nama,
        class_name: kelas.nama_kelas,
        // Tambahkan info semester agar tahu ini data kapan
        tahun_ajaran_id: kelas.tahun_ajaran_id, 
        scores: kelasScores
      });
    }

    // Format Radar Data
    const radarData = allCPL.map(cpl => {
      const agg = cplAggregator[cpl.kode_cpl];
      const avg = agg && agg.totalCoef > 0 ? agg.totalScore / agg.totalCoef : 0;
      return {
        subject: cpl.kode_cpl,
        target: 75,
        prodi: parseFloat(avg.toFixed(2)),
      };
    });

    return NextResponse.json({ radarData, courseData });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}