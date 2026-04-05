import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

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
            cpmk: { include: { sub_cpmk: true, cpl: true } },
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
            iks: { include: { _count: { select: { mataKuliah: true } } } }, 
            cpmks: { include: { _count: { select: { kelas: true } } } } 
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
                const totalNilai = k.nilai.reduce((sum, n) => sum + n.nilai_komponen, 0);
                componentAvgScores[k.id] = totalNilai / k.nilai.length;
            } else {
                componentAvgScores[k.id] = 0;
            }
        });

        const cpmkAchieved: Record<number, number> = {};
        const cpmkRawScores: Record<number, { total: number, bobot: number }> = {};
        const cpmkObjects: Record<number, any> = {};

        kelas.komponenNilai.forEach(k => {
            const avgScore = componentAvgScores[k.id];
            if (!cpmkRawScores[k.cpmk_id]) {
                cpmkRawScores[k.cpmk_id] = { total: 0, bobot: 0 };
                cpmkObjects[k.cpmk_id] = k.cpmk;
            }
            cpmkRawScores[k.cpmk_id].total += (avgScore * k.bobot_nilai);
            cpmkRawScores[k.cpmk_id].bobot += k.bobot_nilai;
        });

        for (const [cpmkId, data] of Object.entries(cpmkRawScores)) {
            if (data.bobot > 0) cpmkAchieved[Number(cpmkId)] = data.total / data.bobot;
        }

        const currentClassScores: Record<string, number> = {};

        allCPL.forEach(cpl => {
            const relatedCpmkIds = new Set<number>();
            
            Object.values(cpmkObjects).forEach(cpmk => {
                const hasLinkedSubCpmk = cpmk.sub_cpmk?.some((sub: any) => cpl.iks.some(ik => ik.id === sub.ik_id));
                const hasLinkedDirectCpl = cpmk.cpl?.some((c: any) => c.id === cpl.id);
                if (hasLinkedSubCpmk || hasLinkedDirectCpl) relatedCpmkIds.add(cpmk.id);
            });

            let finalCplScore = 0;

            if (relatedCpmkIds.size > 0) {
                globalCplAccumulator[cpl.kode_cpl].isTargeted = true;

                const konversiCpmkList: { konversi: number, nilai_cpmk: number }[] = [];
                let sumKonversi = 0;

                relatedCpmkIds.forEach(cpmkId => {
                    const cpmk = cpmkObjects[cpmkId];
                    const nilai_cpmk = cpmkAchieved[cpmkId] || 0;
                    const bobot_cpmk = (cpmk.bobot_cpmk || 100) / 100;
                    let bobot_pi_cpl = 1;

                    if (cpmk.sub_cpmk && cpmk.sub_cpmk.length > 0) {
                        const linkedIks = cpmk.sub_cpmk.map((sub: any) => cpl.iks.find(ik => ik.id === sub.ik_id)).filter(Boolean);
                        if (linkedIks.length > 0) {
                            let totalBobotIk = 0;
                            linkedIks.forEach((ikData: any) => {
                                const mkTerikat = Math.max(1, ikData._count?.mataKuliah || 1);
                                totalBobotIk += (1 / mkTerikat);
                            });
                            bobot_pi_cpl = totalBobotIk / linkedIks.length;
                        }
                    } else if (cpl.cpmks && cpl.cpmks.length > 0) {
                         bobot_pi_cpl = 1 / cpl.cpmks.length;
                    }

                    const koef_cpl = bobot_mk * bobot_cpmk * bobot_pi_cpl;
                    const konversi = koef_cpl * 100;
                    
                    konversiCpmkList.push({ konversi, nilai_cpmk });
                    sumKonversi += konversi;
                });

                if (sumKonversi > 0) {
                    konversiCpmkList.forEach(item => {
                        const persentase = (item.konversi / sumKonversi);
                        finalCplScore += (persentase * item.nilai_cpmk);
                    });
                }
           
                currentClassScores[cpl.kode_cpl] = parseFloat(finalCplScore.toFixed(2));
                
                if (finalCplScore > 0) {
                    globalCplAccumulator[cpl.kode_cpl].totalScore += finalCplScore;
                    globalCplAccumulator[cpl.kode_cpl].count += 1;
                }
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