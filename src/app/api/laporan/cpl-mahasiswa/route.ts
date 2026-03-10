import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { 
  calculateCPMKScore, 
  calculateIKScore, 
  calculateFinalCPL 
} from "@/utils/cplCalculation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nim, semester_ids } = body;

    if (!nim) {
       const participants = await prisma.pesertaKelas.findMany({
          where: {
            kelas: {
                tahun_ajaran_id: semester_ids && semester_ids.length > 0 
                  ? { in: semester_ids.map(Number) } 
                  : undefined
            }
          },
          include: { mahasiswa: true },
          distinct: ['mahasiswa_id'] 
       });

       const pesertaList = participants.map(p => ({
           nim: p.mahasiswa.nim,
           nama: p.mahasiswa.nama
       }));

       return NextResponse.json({ pesertaList });
    }

    const student = await prisma.mahasiswa.findUnique({
      where: { nim: String(nim) },
    });

    if (!student) {
      return NextResponse.json({ error: "Mahasiswa tidak ditemukan" }, { status: 404 });
    }

    const allCPL = await prisma.cPL.findMany({ 
        orderBy: { kode_cpl: 'asc' }, 
        include: { 
            iks: true,
            cpmk: true 
        } 
    });

    const enrollments = await prisma.pesertaKelas.findMany({
      where: {
        mahasiswa_id: student.id,
        kelas: {
          tahun_ajaran_id: semester_ids && semester_ids.length > 0 
            ? { in: semester_ids.map(Number) } 
            : undefined
        }
      },
      include: {
        kelas: {
          include: {
            matakuliah: true,
            komponenNilai: {
              include: {
                cpmk: { include: { sub_cpmk: true } }
              }
            }
          }
        },
        nilai: true
      }
    });

    interface IKData {
        inputs: { cpmkScore: number; cpmkWeight: number }[];
        contributing_courses: Set<number>; 
    }
    const ikMap: Record<number, IKData> = {};

    interface CplDirectData {
        totalScoreWeighted: number;
        totalBobot: number;
    }
    const cplDirectMap: Record<number, CplDirectData> = {};

    for (const enrollment of enrollments) {
      const kelas = enrollment.kelas;
      if (!kelas.matakuliah_id) continue;
      
      const mkId = kelas.matakuliah_id;

      const nilaiMap: Record<number, number> = {};
      enrollment.nilai.forEach(n => {
          nilaiMap[n.komponen_nilai_id] = n.nilai_komponen;
      });

      const cpmkGroup: Record<number, { inputs: { nilai: number, bobot: number }[], obj: any }> = {};
      
      kelas.komponenNilai.forEach(komp => {
          if (!komp.cpmk_id) return;
          
          if (!cpmkGroup[komp.cpmk_id]) {
              cpmkGroup[komp.cpmk_id] = { inputs: [], obj: komp.cpmk };
          }
          
          const val = nilaiMap[komp.id] || 0;
          cpmkGroup[komp.cpmk_id].inputs.push({ nilai: val, bobot: komp.bobot_nilai });
      });

      Object.values(cpmkGroup).forEach(group => {
          const result = calculateCPMKScore(group.inputs);
          
          if (result.totalBobot === 0 || result.score <= 0) return;

          const cpmk = group.obj;
          
          const hasSubCpmk = Array.isArray(cpmk.sub_cpmk) && cpmk.sub_cpmk.length > 0;

          if (hasSubCpmk) {
              (cpmk.sub_cpmk as any[]).forEach((sub) => {
                  const ikId = Number(sub.ik_id);
                  if (!ikId) return;

                  if (!ikMap[ikId]) {
                      ikMap[ikId] = { inputs: [], contributing_courses: new Set() };
                  }
                  ikMap[ikId].inputs.push({ cpmkScore: result.score, cpmkWeight: 1 });
                  ikMap[ikId].contributing_courses.add(mkId);
              });
          } 
          else if (cpmk.cpl_id) {
              const cplId = Number(cpmk.cpl_id);
              const bobotCpmk = cpmk.bobot_cpmk ? Number(cpmk.bobot_cpmk) : 1; 

              if (!cplDirectMap[cplId]) {
                  cplDirectMap[cplId] = { totalScoreWeighted: 0, totalBobot: 0 };
              }
              
              cplDirectMap[cplId].totalScoreWeighted += (result.score * bobotCpmk);
              cplDirectMap[cplId].totalBobot += bobotCpmk;
          }
      });
    }

    const cplData = allCPL.map(cpl => {
        const isS1Logic = cpl.iks && cpl.iks.length > 0;
        let finalCplValue = 0;

        if (isS1Logic) {
            const relatedIKData = cpl.iks.map(ikMaster => {
                const ikCalcData = ikMap[ikMaster.id];
                if (!ikCalcData) return null;

                const skorIK = calculateIKScore(ikCalcData.inputs);
                const bobotIK = ikCalcData.contributing_courses.size;

                return { ikScore: skorIK, bobotIK: bobotIK };
            }).filter(Boolean) as { ikScore: number, bobotIK: number }[];

            if (relatedIKData.length > 0) {
                finalCplValue = calculateFinalCPL(relatedIKData);
            }

        } else {
            const directData = cplDirectMap[cpl.id];
            if (directData && directData.totalBobot > 0) {
                finalCplValue = directData.totalScoreWeighted / directData.totalBobot;
            }
        }

        return {
            code: cpl.kode_cpl,          
            description: cpl.deskripsi,   
            nilai: parseFloat(finalCplValue.toFixed(2)), 
            cplLo: "", 
            descriptionEn: ""
        };
    });

    return NextResponse.json({ 
        student: { nama: student.nama, nim: student.nim },
        cplData 
    });

  } catch (err: any) {
    console.error("API Error (CPL Mahasiswa):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}