import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

import { 
  calculateAvgKomponen, 
  calculateCPMKScore 
} from "@/utils/cplCalculation"; 

const MINIMAL_KELULUSAN_SKS = 145;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matakuliah_id, semester_ids } = body;

    if (!matakuliah_id) {
        return NextResponse.json({ error: "Matakuliah wajib dipilih" }, { status: 400 });
    }

    const classes = await prisma.kelas.findMany({
      where: { 
          matakuliah_id: Number(matakuliah_id),
          tahun_ajaran_id: semester_ids?.length > 0 ? { in: semester_ids.map(Number) } : undefined
      },
      include: {
        matakuliah: true,
        peserta_kelas: true,
        komponenNilai: {
          include: {
            cpmk: { 
              include: { 
                sub_cpmk: { include: { rps_pertemuan: true } }, 
                cpl: true 
              } 
            },
            sub_cpmk: { 
              include: { 
                cpmk: { 
                  include: { 
                    sub_cpmk: { include: { rps_pertemuan: true } }, 
                    cpl: true 
                  } 
                } 
              } 
            },
            nilai: true
          }
        }
      }
    });

    if (classes.length === 0) {
        return NextResponse.json({ radarData: [], classData: [] });
    }

    const sksMataKuliah = classes[0].matakuliah?.sks || 0;
    const kurikulumId = classes[0].matakuliah?.kurikulum_id;

    const allCPL = await prisma.cPL.findMany({
        where: { kurikulum_id: kurikulumId },
        orderBy: { kode_cpl: 'asc' },
        include: { 
            iks: true,
            cpmks: true 
        }
    });

    const bobot_mk = sksMataKuliah / MINIMAL_KELULUSAN_SKS;

    const classDataResult: any[] = [];
    const globalCplAccumulator: Record<string, { totalScore: number, count: number, isTargeted: boolean }> = {};

    allCPL.forEach(cpl => {
        globalCplAccumulator[cpl.kode_cpl] = { totalScore: 0, count: 0, isTargeted: false };
    });

    for (const kelas of classes) {
        const populasi = kelas.peserta_kelas.length;
        if (populasi === 0) continue;

        const componentAvgScores: Record<number, number> = {};
        kelas.komponenNilai.forEach(k => {
            if (k.nilai.length > 0) {
                const nilaiList = k.nilai.map(n => n.nilai_komponen);
                componentAvgScores[k.id] = calculateAvgKomponen(nilaiList);
            }
        });

        const cpmkMappings: Record<number, { nilai: number; bobot: number }[]> = {};
        const cpmkObjects: Record<number, any> = {};

        kelas.komponenNilai.forEach(k => {
            const score = componentAvgScores[k.id];
            if (score !== undefined) {
                const cpmkId = k.cpmk_id || k.sub_cpmk?.cpmk_id;
                
                if (cpmkId) {
                    if (!cpmkMappings[cpmkId]) cpmkMappings[cpmkId] = [];
                    cpmkMappings[cpmkId].push({ nilai: score, bobot: k.bobot_nilai });
                    
                    if (!cpmkObjects[cpmkId]) {
                        cpmkObjects[cpmkId] = k.cpmk || k.sub_cpmk?.cpmk;
                    }
                }
            }
        });

        const cpmkAchieved: Record<number, number> = {};
        for (const [cpmkIdStr, mappings] of Object.entries(cpmkMappings)) {
            const { score } = calculateCPMKScore(mappings);
            cpmkAchieved[Number(cpmkIdStr)] = score; 
        }

        const currentClassScores: Record<string, number> = {};

        allCPL.forEach(cpl => {
            let sumKonversi = 0;
            const konversiCpmkList: { cpmkId: number, konversi: number, nilai_cpmk: number }[] = [];
            
            const n_pi_cpl = cpl.iks?.length || 0; 

            Object.values(cpmkObjects).forEach(cpmk => {
                let n_pi_cpmk = 0;
                let isLinked = false;

                if (n_pi_cpl > 0) {
                    const linkedIks = cpmk.sub_cpmk?.filter((sub: any) => cpl.iks.some(ik => ik.id === sub.ik_id)) || [];
                    n_pi_cpmk = linkedIks.length;
                    if (n_pi_cpmk > 0) isLinked = true;
                } else {
                    const hasDirectCpl = cpmk.cpl?.some((c: any) => c.id === cpl.id);
                    if (hasDirectCpl) isLinked = true;
                }

                if (isLinked) {
                    globalCplAccumulator[cpl.kode_cpl].isTargeted = true;
                    
                    const nilai_cpmk = cpmkAchieved[cpmk.id] || 0;

                    let totalBobotAssesmentCpmk = 0;
                    cpmk.sub_cpmk?.forEach((sub: any) => {
                        sub.rps_pertemuan?.forEach((p: any) => {
                            totalBobotAssesmentCpmk += p.bobot_assesment || 0;
                        });
                    });

                    const bobot_cpmk_dinamis = totalBobotAssesmentCpmk > 0 
                        ? totalBobotAssesmentCpmk / 100 
                        : 1;

                    let bobot_pi_cpl = 0;
                    if (n_pi_cpl > 0) {
                        bobot_pi_cpl = n_pi_cpmk / n_pi_cpl;
                    } else {
                        bobot_pi_cpl = 1 / (cpl.cpmks?.length || 1);
                    }

                    const koef_cpl = bobot_mk * bobot_cpmk_dinamis * bobot_pi_cpl;
                    const konversi = koef_cpl * 100;

                    konversiCpmkList.push({ cpmkId: cpmk.id, konversi, nilai_cpmk });
                    sumKonversi += konversi;
                }
            });

            let finalCplScore = 0;

            if (sumKonversi > 0) {
                konversiCpmkList.forEach(item => {
                    const persentase = (item.konversi / sumKonversi) * 100; 
                    finalCplScore += (persentase / 100) * item.nilai_cpmk; 
                });
            }
           
            currentClassScores[cpl.kode_cpl] = parseFloat(finalCplScore.toFixed(2));
            
            if (sumKonversi > 0) {
                globalCplAccumulator[cpl.kode_cpl].totalScore += finalCplScore;
                globalCplAccumulator[cpl.kode_cpl].count += 1;
            }
        });

        classDataResult.push({
            id: kelas.id,
            class_name: kelas.nama_kelas,
            total_students: populasi,
            scores: currentClassScores
        });
    }

    const radarDataResult = allCPL
        .filter(cpl => globalCplAccumulator[cpl.kode_cpl].isTargeted)
        .map(cpl => {
            const acc = globalCplAccumulator[cpl.kode_cpl];
            const avgGlobalScore = acc.count > 0 ? (acc.totalScore / acc.count) : 0;
            
            return {
                subject: cpl.kode_cpl,
                prodi: parseFloat(avgGlobalScore.toFixed(2))
            };
        });

    return NextResponse.json({ 
        radarData: radarDataResult,
        classData: classDataResult 
    });

  } catch (err: any) {
    console.error("API Error (CPL Matakuliah):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}