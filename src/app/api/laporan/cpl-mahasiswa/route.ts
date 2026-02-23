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
                  ? { in: semester_ids.map((id: any) => Number(id)) } 
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
        include: { iks: true } 
    });

    const enrollments = await prisma.pesertaKelas.findMany({
      where: {
        mahasiswa_id: student.id,
        kelas: {
          tahun_ajaran_id: semester_ids && semester_ids.length > 0 
            ? { in: semester_ids.map((id: any) => Number(id)) } 
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

    interface IKDataCollection {
        ik_id: number;
        inputs: { cpmkScore: number; cpmkWeight: number }[];
        contributing_courses: Set<number>; 
    }
    const ikMap: Record<number, IKDataCollection> = {};

    for (const enrollment of enrollments) {
      const kelas = enrollment.kelas;
      if (!kelas.matakuliah_id) continue;
      
      const mkId = kelas.matakuliah_id;

      const nilaiMap: Record<number, number> = {};
      enrollment.nilai.forEach(n => {
          nilaiMap[n.komponen_nilai_id] = n.nilai_komponen;
      });

      const subCpmkData: Record<number, { inputs: {nilai: number, bobot: number}[], ikId: number }> = {};

      kelas.komponenNilai.forEach(komp => {
          const val = nilaiMap[komp.id] || 0;
          const bobot = komp.bobot_nilai;

          if (komp.cpmk && komp.cpmk.sub_cpmk) {
              komp.cpmk.sub_cpmk.forEach(sub => {
                  if (!subCpmkData[sub.id]) {
                      subCpmkData[sub.id] = { inputs: [], ikId: sub.ik_id };
                  }
                  subCpmkData[sub.id].inputs.push({ nilai: val, bobot: bobot });
              });
          }
      });

      Object.values(subCpmkData).forEach(sub => {
          const result = calculateCPMKScore(sub.inputs);

          if (result.totalBobot > 0) {
              if (!ikMap[sub.ikId]) {
                  ikMap[sub.ikId] = { 
                      ik_id: sub.ikId, 
                      inputs: [], 
                      contributing_courses: new Set() 
                  };
              }
              ikMap[sub.ikId].inputs.push({
                  cpmkScore: result.score,
                  cpmkWeight: 1 
              });
              ikMap[sub.ikId].contributing_courses.add(mkId);
          }
      });
    }

    const cplData = allCPL.map(cpl => {
        const childIKs = Object.values(ikMap).filter(ikData => {
            return cpl.iks.some(ikMaster => ikMaster.id === ikData.ik_id);
        });

        const cplInputs = childIKs.map(ikData => {
            const scoreIK = calculateIKScore(ikData.inputs);
            const bobotIK = ikData.contributing_courses.size;

            return {
                ikScore: scoreIK,
                bobotIK: bobotIK
            };
        });

        const finalCPLScore = calculateFinalCPL(cplInputs);

        return {
            code: cpl.kode_cpl,          
            description: cpl.deskripsi,   
            nilai: parseFloat(finalCPLScore.toFixed(2)), 
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