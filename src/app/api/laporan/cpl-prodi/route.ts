import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { calculateAvgKomponen, calculateCPMKScore, calculateCoefficient } from "@/utils/cplCalculation";

export async function POST(req: Request) {
  try {
    let semester_ids: number[] = [];
    try {
        const body = await req.json();
        semester_ids = body.semester_ids || [];
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON Body" }, { status: 400 });
    }

    if (semester_ids.length === 0) {
        return NextResponse.json({ radarData: [], courseData: [] });
    }

    const classes = await prisma.kelas.findMany({
      where: { 
        tahun_ajaran_id: { in: semester_ids.map((id) => Number(id)) }
      },
      include: {
        tahun_ajaran: true,
        matakuliah: { 
          include: { 
            cpl: { include: { iks: true } } 
          } 
        },
        komponenNilai: { 
            include: { 
                nilai: true,
                cpmk: { include: { ik: true } }
            } 
        }
      }
    });

    const allCPL = await prisma.cPL.findMany({ orderBy: { kode_cpl: 'asc' }, include: { iks: true } });
    const cplAggregator: Record<string, { totalScore: number; totalCoef: number }> = {};
    const courseData: any[] = [];

    for (const kelas of classes) {
      if (!kelas.matakuliah) continue;

      const uniqueCPMKsInClass = new Map();
      kelas.komponenNilai.forEach(k => {
          if (k.cpmk) {
              uniqueCPMKsInClass.set(k.cpmk.id, k.cpmk);
          }
      });
      const listRealCPMKs = Array.from(uniqueCPMKsInClass.values());

      const mapAvgKomp: Record<number, number> = {};
      kelas.komponenNilai.forEach(k => {
        const nilaiArr = k.nilai.map(n => n.nilai_komponen);
        mapAvgKomp[k.id] = calculateAvgKomponen(nilaiArr);
      });

      const kelasScores: Record<string, number> = {}; 

      kelas.matakuliah.cpl.forEach(cpl => {
        let totalCPLScore = 0;
        let totalCPLCoef = 0;

        const relevantCPMKs = listRealCPMKs.filter((c: any) => c.ik.some((ik: any) => ik.cpl_id === cpl.id));

        relevantCPMKs.forEach((cpmk: any) => {
          const relatedComponents = kelas.komponenNilai.filter(k => k.cpmk_id === cpmk.id);
          const mappings = relatedComponents.map((k) => ({
            avg: mapAvgKomp[k.id] || 0,
            bobot: k.bobot_nilai
          }));
          
          const scoreCPMK = calculateCPMKScore(mappings);
          const bobotCpmkToCpl = cpmk.bobot_to_cpl ?? 0; 
          
          const ikLink = cpmk.ik.filter((ik: any) => ik.cpl_id === cpl.id).length;
          const totalIK = cpl.iks.length || 1;
          const sks = kelas.matakuliah?.sks || 0;

          const coef = calculateCoefficient(sks, ikLink, totalIK, bobotCpmkToCpl);

          totalCPLScore += scoreCPMK * coef;
          totalCPLCoef += coef;
        });

        const finalKelasCPL = totalCPLCoef > 0 ? (totalCPLScore / totalCPLCoef) : 0;
        kelasScores[cpl.kode_cpl] = finalKelasCPL;

        if (totalCPLCoef > 0) {
             if (!cplAggregator[cpl.kode_cpl]) cplAggregator[cpl.kode_cpl] = { totalScore: 0, totalCoef: 0 };
             cplAggregator[cpl.kode_cpl].totalScore += finalKelasCPL;
             cplAggregator[cpl.kode_cpl].totalCoef += 1; 
        }
      });

      courseData.push({
        id: kelas.id,
        code: kelas.kode_mk,
        name: kelas.matakuliah.nama,
        class_name: kelas.nama_kelas,
        tahun_ajaran_id: kelas.tahun_ajaran_id,
        scores: kelasScores
      });
    }

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
    console.error("API Error (CPL Prodi):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}