import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { semester_ids } = body; 

    const allCPL = await prisma.cPL.findMany({ 
        orderBy: { kode_cpl: 'asc' },
        include: { iks: true }
    });

    const classes = await prisma.kelas.findMany({
      where: {
        tahun_ajaran_id: semester_ids?.length > 0 ? { in: semester_ids.map(Number) } : undefined
      },
      select: {
        id: true,
        matakuliah_id: true,
        rps_id: true,
        peserta_kelas: {
            select: { mahasiswa_id: true } 
        }
      }
    });

    const mkGroups: Record<number, Record<number, { classIds: number[], studentCount: number }>> = {};
    
    classes.forEach(cls => {
        if (!cls.matakuliah_id || !cls.rps_id) return;
        
        const mkId = cls.matakuliah_id;
        const rpsId = cls.rps_id;
        const count = cls.peserta_kelas.length;

        if (count === 0) return;

        if (!mkGroups[mkId]) mkGroups[mkId] = {};
        if (!mkGroups[mkId][rpsId]) mkGroups[mkId][rpsId] = { classIds: [], studentCount: 0 };

        mkGroups[mkId][rpsId].classIds.push(cls.id);
        mkGroups[mkId][rpsId].studentCount += count;
    });

    const ikScoresGlobal: Record<number, number[]> = {};

    for (const mkIdStr in mkGroups) {
        const rpsDict = mkGroups[mkIdStr];
        const mkIkWeightedScores: Record<number, { scoreXweight: number, totalWeight: number }> = {};

        for (const rpsIdStr in rpsDict) {
            const rpsData = rpsDict[rpsIdStr];
            const populasiRps = rpsData.studentCount;

            const komponenList = await prisma.komponenNilai.findMany({
                where: { kelas_id: { in: rpsData.classIds } },
                include: {
                    cpmk: { include: { sub_cpmk: true } }, 
                    nilai: true 
                }
            });

            const subCpmkScores: Record<number, { totalNilai: number, bobot: number, ikId: number }> = {};

            komponenList.forEach(komp => {
                if (komp.nilai.length === 0 || !komp.cpmk_id) return;

                const avgNilaiKomp = komp.nilai.reduce((a, b) => a + b.nilai_komponen, 0) / komp.nilai.length;

                komp.cpmk?.sub_cpmk.forEach(sub => {
                     if (!subCpmkScores[sub.id]) {
                         subCpmkScores[sub.id] = { totalNilai: 0, bobot: 0, ikId: sub.ik_id };
                     }
                     subCpmkScores[sub.id].totalNilai += (avgNilaiKomp * komp.bobot_nilai);
                     subCpmkScores[sub.id].bobot += komp.bobot_nilai;
                });
            });

            Object.values(subCpmkScores).forEach(sub => {
                if (sub.bobot > 0) {
                    const finalSubScore = sub.totalNilai / sub.bobot; 
                    const ikId = sub.ikId;

                    if (!mkIkWeightedScores[ikId]) {
                        mkIkWeightedScores[ikId] = { scoreXweight: 0, totalWeight: 0 };
                    }

                    mkIkWeightedScores[ikId].scoreXweight += (finalSubScore * populasiRps);
                    mkIkWeightedScores[ikId].totalWeight += populasiRps;
                }
            });
        }

        for (const ikIdStr in mkIkWeightedScores) {
            const ikId = Number(ikIdStr);
            const dataIkMk = mkIkWeightedScores[ikId];
            
            const finalMkIkScore = dataIkMk.scoreXweight / dataIkMk.totalWeight;
            
            if (!ikScoresGlobal[ikId]) ikScoresGlobal[ikId] = [];
            ikScoresGlobal[ikId].push(finalMkIkScore);
        }
    }

    const chartData = allCPL.map(cpl => {
        let totalWeightedIK = 0;
        let totalBobotIK = 0;

        cpl.iks.forEach(ik => {
            const scoresFromMks = ikScoresGlobal[ik.id]; 
            
            if (scoresFromMks && scoresFromMks.length > 0) {
                const avgScoreIk = scoresFromMks.reduce((a, b) => a + b, 0) / scoresFromMks.length;
                const bobotIk = scoresFromMks.length; 
                totalWeightedIK += (avgScoreIk * bobotIk);
                totalBobotIK += bobotIk;
            }
        });

        const finalCPL = totalBobotIK > 0 ? (totalWeightedIK / totalBobotIK) : 0;
        
        return {
            kode_cpl: cpl.kode_cpl,
            deskripsi: cpl.deskripsi,
            nilai_rata_rata: parseFloat(finalCPL.toFixed(2)),
            jumlah_mk_terlibat: totalBobotIK
        };
    });

    const uniqueStudents = await prisma.pesertaKelas.findMany({
        where: {
             kelas: {
                 tahun_ajaran_id: semester_ids?.length > 0 ? { in: semester_ids.map(Number) } : undefined
             }
        },
        distinct: ['mahasiswa_id'],
        select: { mahasiswa_id: true }
    });

    return NextResponse.json({ 
        totalMahasiswa: uniqueStudents.length, 
        cplData: chartData 
    });

  } catch (err: any) {
    console.error("API Error (CPL Prodi):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}