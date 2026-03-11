import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

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
            cpmks: true 
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
                    cpmk: { 
                        include: { 
                            sub_cpmk: { include: { ik: true } }, 
                            cpl: true                            
                        } 
                    }, 
                    nilai: true
                }
            });

            const componentScores: Record<number, number> = {}; 
            komponenList.forEach(k => {
                if (k.nilai.length > 0) {
                     componentScores[k.id] = k.nilai.reduce((a, b) => a + b.nilai_komponen, 0) / k.nilai.length;
                }
            });

            const cpmkRawScores: Record<number, { total: number, bobot: number }> = {};
            
            komponenList.forEach(k => {
                const score = componentScores[k.id];
                if (score !== undefined) {
                    if (!cpmkRawScores[k.cpmk_id]) cpmkRawScores[k.cpmk_id] = { total: 0, bobot: 0 };
                    cpmkRawScores[k.cpmk_id].total += (score * k.bobot_nilai);
                    cpmkRawScores[k.cpmk_id].bobot += k.bobot_nilai;
                }
            });

            const cpmkMap = new Map();
            komponenList.forEach(k => cpmkMap.set(k.cpmk_id, k.cpmk));

            for (const [cpmkId, data] of Object.entries(cpmkRawScores)) {
                if (data.bobot === 0) continue;
                const finalScore = data.total / data.bobot; 
                const cpmkObj = cpmkMap.get(Number(cpmkId));

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
                     if (!mkCpmkWeighted[Number(cpmkId)]) mkCpmkWeighted[Number(cpmkId)] = { val: 0, w: 0 };
                     mkCpmkWeighted[Number(cpmkId)].val += (finalScore * populasi);
                     mkCpmkWeighted[Number(cpmkId)].w += populasi;
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
            let totalVal = 0, totalBobot = 0;
            cpl.iks.forEach(ik => {
                const scores = ikScoresGlobal[ik.id];
                if (scores?.length > 0) {
                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                    const weight = scores.length;
                    totalVal += (avg * weight);
                    totalBobot += weight;
                }
            });
            return {
                kode_cpl: cpl.kode_cpl,
                deskripsi: cpl.deskripsi,
                nilai_rata_rata: totalBobot > 0 ? parseFloat((totalVal / totalBobot).toFixed(2)) : 0,
                jumlah_mk_terlibat: totalBobot
            };

        } else {
            let totalVal = 0, totalBobot = 0;
            let countMk = 0;

            cpl.cpmks.forEach(cpmk => {
                const scores = cpmkScoresGlobal[cpmk.id];
                if (scores?.length > 0) {
                    const avgCpmkScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                    
                    const bobot = cpmk.bobot_cpmk || 1; 

                    totalVal += (avgCpmkScore * bobot);
                    totalBobot += bobot;
                    countMk++;
                }
            });

            return {
                kode_cpl: cpl.kode_cpl,
                deskripsi: cpl.deskripsi,
                nilai_rata_rata: totalBobot > 0 ? parseFloat((totalVal / totalBobot).toFixed(2)) : 0,
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