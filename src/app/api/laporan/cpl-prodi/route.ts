import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

import { 
  calculateAvgKomponen, 
  calculateCPMKScore, 
  calculateIKScore, 
  calculateFinalCPL 
} from "@/utils/cplCalculation"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { semester_ids } = body;

    const classes = await prisma.kelas.findMany({
      where: {
        tahun_ajaran_id: semester_ids?.length > 0 ? { in: semester_ids.map(Number) } : undefined
      },
      select: {
        id: true, 
        matakuliah_id: true, 
        rps_id: true,
        peserta_kelas: { select: { mahasiswa_id: true } },
        matakuliah: { select: { kurikulum_id: true } } 
      }
    });

    const activeKurikulumIds = Array.from(
        new Set(classes.map(c => c.matakuliah?.kurikulum_id).filter(Boolean))
    ) as number[];

    const allCPL = await prisma.cPL.findMany({ 
        where: {
            kurikulum_id: { in: activeKurikulumIds } 
        },
        orderBy: { kode_cpl: 'asc' },
        include: { 
            iks: true,
            cpmks: {
                include: {
                    sub_cpmk: { include: { rps_pertemuan: true } }, 
                    cpl: true
                }
            } 
        }
    });
            
    const mkGroups: Record<number, Record<number, { classIds: number[], studentCount: number }>> = {};
    classes.forEach(cls => {
        if (!cls.matakuliah_id || !cls.rps_id || cls.peserta_kelas.length === 0) return;
        if (!mkGroups[cls.matakuliah_id]) mkGroups[cls.matakuliah_id] = {};
        if (!mkGroups[cls.matakuliah_id][cls.rps_id]) mkGroups[cls.matakuliah_id][cls.rps_id] = { classIds: [], studentCount: 0 };
        mkGroups[cls.matakuliah_id][cls.rps_id].classIds.push(cls.id);
        mkGroups[cls.matakuliah_id][cls.rps_id].studentCount += cls.peserta_kelas.length;
    });

    const ikScoresGlobal: Record<number, number[]> = {};   
    const cpmkScoresGlobal: Record<number, number[]> = {}; 

    for (const mkIdStr in mkGroups) {
        const rpsDict = mkGroups[mkIdStr];

        const mkIkWeighted: Record<number, { val: number, w: number }> = {};
        const mkCpmkWeighted: Record<number, { val: number, w: number }> = {}; 

        for (const rpsIdStr in rpsDict) {
            const rpsData = rpsDict[rpsIdStr];
            const populasi = rpsData.studentCount;

            const komponenList = await prisma.komponenNilai.findMany({
                where: { kelas_id: { in: rpsData.classIds } },
                include: {
                    sub_cpmk: { 
                        include: { 
                            ik: true,
                            rps_pertemuan: true 
                        } 
                    },
                    cpmk: { 
                        include: { 
                            sub_cpmk: { 
                                include: { 
                                    ik: true,
                                    rps_pertemuan: true 
                                } 
                            }, 
                            cpl: true                            
                        } 
                    }, 
                    nilai: true
                }
            });

            const componentScores: Record<number, number> = {}; 
            komponenList.forEach(k => {
                if (k.nilai.length > 0) {
                     const nilaiMahasiswaList = k.nilai.map(n => n.nilai_komponen);
                     componentScores[k.id] = calculateAvgKomponen(nilaiMahasiswaList);
                }
            });

            const ikMappings: Record<number, { nilai: number; bobot: number }[]> = {}; 
            const cpmkMappings: Record<number, { nilai: number; bobot: number }[]> = {}; 
            
            komponenList.forEach(k => {
                const score = componentScores[k.id];
                if (score !== undefined) {
                    if (k.sub_cpmk_id && k.sub_cpmk?.ik_id) {
                        const ikId = k.sub_cpmk.ik_id;
                        if (!ikMappings[ikId]) ikMappings[ikId] = [];
                        ikMappings[ikId].push({ nilai: score, bobot: k.bobot_nilai });
                    } 
                    else if (k.cpmk_id) {
                        if (!cpmkMappings[k.cpmk_id]) cpmkMappings[k.cpmk_id] = [];
                        cpmkMappings[k.cpmk_id].push({ nilai: score, bobot: k.bobot_nilai });
                    }
                }
            });

            for (const [ikIdStr, mappings] of Object.entries(ikMappings)) {
                const ikId = Number(ikIdStr);
                const { score: finalIkScore, totalBobot } = calculateCPMKScore(mappings);
                if (totalBobot > 0) {
                     if (!mkIkWeighted[ikId]) mkIkWeighted[ikId] = { val: 0, w: 0 };
                     mkIkWeighted[ikId].val += (finalIkScore * populasi);
                     mkIkWeighted[ikId].w += populasi;
                }
            }

            const cpmkMap = new Map();
            komponenList.forEach(k => { if (k.cpmk_id) cpmkMap.set(k.cpmk_id, k.cpmk); });

            for (const [cpmkIdStr, mappings] of Object.entries(cpmkMappings)) {
                const cpmkId = Number(cpmkIdStr);
                const { score: finalScore, totalBobot } = calculateCPMKScore(mappings);
                if (totalBobot === 0) continue; 
                
                const cpmkObj = cpmkMap.get(cpmkId);
                if (cpmkObj?.sub_cpmk) {
                    cpmkObj.sub_cpmk.forEach((sub: any) => {
                         if (sub.ik_id) {
                             if (!mkIkWeighted[sub.ik_id]) mkIkWeighted[sub.ik_id] = { val: 0, w: 0 };
                             mkIkWeighted[sub.ik_id].val += (finalScore * populasi);
                             mkIkWeighted[sub.ik_id].w += populasi;
                         }
                    });
                }

                if (cpmkObj?.cpl && cpmkObj.cpl.length > 0) {
                     if (!mkCpmkWeighted[cpmkId]) mkCpmkWeighted[cpmkId] = { val: 0, w: 0 };
                     mkCpmkWeighted[cpmkId].val += (finalScore * populasi);
                     mkCpmkWeighted[cpmkId].w += populasi;
                }
            }
        }

        for (const [id, d] of Object.entries(mkIkWeighted)) {
            if (!ikScoresGlobal[Number(id)]) ikScoresGlobal[Number(id)] = [];
            ikScoresGlobal[Number(id)].push(d.val / d.w);
        }
        for (const [id, d] of Object.entries(mkCpmkWeighted)) {
            if (!cpmkScoresGlobal[Number(id)]) cpmkScoresGlobal[Number(id)] = [];
            cpmkScoresGlobal[Number(id)].push(d.val / d.w);
        }
    }
    
    const chartData = allCPL.map(cpl => {
        const hasIK = cpl.iks && cpl.iks.length > 0;

        if (hasIK) {
            const ikInputs: { ikScore: number; bobotIK: number }[] = [];
            let countMk = 0;

            cpl.iks.forEach(ik => {
                const scores = ikScoresGlobal[ik.id];
                if (scores?.length > 0) {
                    const avg = calculateAvgKomponen(scores);
                    const weight = scores.length; 
                    
                    ikInputs.push({ ikScore: avg, bobotIK: weight });
                    countMk += weight;
                }
            });

            const finalNilai = calculateFinalCPL(ikInputs);

            return {
                kode_cpl: cpl.kode_cpl,
                deskripsi: cpl.deskripsi,
                nilai_rata_rata: countMk > 0 ? parseFloat(finalNilai.toFixed(2)) : 0,
                jumlah_mk_terlibat: countMk
            };

        } else {
            const cpmkInputs: { cpmkScore: number; cpmkWeight: number }[] = [];
            let countMk = 0;

            cpl.cpmks.forEach(cpmk => {
                const scores = cpmkScoresGlobal[cpmk.id];
                if (scores?.length > 0) {
                    const avgCpmkScore = calculateAvgKomponen(scores);

                    let totalBobotDinamis = 0;
                    cpmk.sub_cpmk?.forEach((sub: any) => {
                        sub.rps_pertemuan?.forEach((p: any) => {
                            totalBobotDinamis += p.bobot_assesment || 0;
                        });
                    });

                    const weight = totalBobotDinamis > 0 ? totalBobotDinamis : 1;
                    
                    cpmkInputs.push({ cpmkScore: avgCpmkScore, cpmkWeight: weight });
                    countMk++;
                }
            });

            const finalNilai = calculateIKScore(cpmkInputs);

            return {
                kode_cpl: cpl.kode_cpl,
                deskripsi: cpl.deskripsi,
                nilai_rata_rata: countMk > 0 ? parseFloat(finalNilai.toFixed(2)) : 0,
                jumlah_mk_terlibat: countMk 
            };
        }
    });

    const uniqueStudents = await prisma.pesertaKelas.findMany({
        where: { kelas: { tahun_ajaran_id: semester_ids?.length > 0 ? { in: semester_ids.map(Number) } : undefined } },
        distinct: ['mahasiswa_id'], select: { mahasiswa_id: true }
    });

    return NextResponse.json({ totalMahasiswa: uniqueStudents.length, cplData: chartData });

  } catch (err: any) {
    console.error("API Error (CPL Prodi S1/S2):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}