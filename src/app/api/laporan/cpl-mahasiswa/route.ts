import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import { calculateCPMKScore, calculateCoefficient } from "@/utils/cplCalculation";

export async function POST(req: Request) {
  console.error("\n🚀 [API CPL MAHASISWA] START...");

  try {
    const body = await req.json();
    const { semester_ids, nim } = body; 

    if (!semester_ids || semester_ids.length === 0) {
      console.error("⚠️ Semester ID kosong.");
      return NextResponse.json({ students: [], cplData: [] });
    }
    if (!nim) {
      const pesertaList = await prisma.pesertaKelas.findMany({
        where: {
          kelas: { 
            tahun_ajaran_id: { in: semester_ids.map((id: string) => parseInt(id)) } 
          }
        },
        include: { mahasiswa: true },
        distinct: ['mahasiswa_id'], 
        orderBy: { mahasiswa: { nim: 'asc' } }
      });

      const formattedStudents = pesertaList.map(p => ({
        nim: p.mahasiswa.nim,
        nama: p.mahasiswa.nama
      }));

      return NextResponse.json({ pesertaList: formattedStudents });
    }

    console.error(`🔍 Mencari Data untuk NIM: ${nim} pada Semester ID: ${semester_ids}`);
    const enrolledClasses = await prisma.pesertaKelas.findMany({
      where: {
        mahasiswa: { nim: nim }, 
        kelas: { 
          tahun_ajaran_id: { in: semester_ids.map((id: string) => parseInt(id)) } 
        }
      },
      include: {
        nilai: true, 
        kelas: {
          include: {
            matakuliah: {
              include: {
                cpl: { include: { iks: true } } 
              }
            },
            komponenNilai: { 
                include: {
                    cpmk: { include: { ik: true } } 
                }
            } 
          }
        }
      }
    });

    console.error(`🔍 Ditemukan ${enrolledClasses.length} kelas yang diambil.`);

    if (enrolledClasses.length === 0) {
        return NextResponse.json({ cplData: [] });
    }

    const allCPL = await prisma.cPL.findMany({ 
      orderBy: { kode_cpl: 'asc' },
      include: { iks: true }
    });

    const cplScores: Record<string, { score: number; coef: number }> = {};
    allCPL.forEach(c => cplScores[c.kode_cpl] = { score: 0, coef: 0 });

    for (const enrollment of enrolledClasses) {
      const kelas = enrollment.kelas;
      if (!kelas.matakuliah) continue;

      const uniqueCPMKsInClass = new Map();
      kelas.komponenNilai.forEach(k => {
          if (k.cpmk) {
              uniqueCPMKsInClass.set(k.cpmk.id, k.cpmk);
          }
      });
      const listRealCPMKs = Array.from(uniqueCPMKsInClass.values());
      const mapNilaiMhs: Record<number, number> = {};
      enrollment.nilai.forEach(n => {
        mapNilaiMhs[n.komponen_nilai_id] = n.nilai_komponen;
      });

      kelas.matakuliah.cpl.forEach(cpl => {
        let totalCPLScoreInMK = 0;
        let totalCPLCoefInMK = 0;

        const relevantCPMKs = listRealCPMKs.filter((c: any) => 
          c.ik.some((ik: any) => ik.cpl_id === cpl.id)
        );

        relevantCPMKs.forEach((cpmk: any) => {
          const relatedComponents = kelas.komponenNilai.filter(k => k.cpmk_id === cpmk.id);

          const mappings = relatedComponents.map((k) => ({
            avg: mapNilaiMhs[k.id] || 0, 
            bobot: k.bobot_nilai 
          }));
          
          const scoreCPMK = calculateCPMKScore(mappings);
        
          const ikLinkCount = cpmk.ik.filter((ik: any) => ik.cpl_id === cpl.id).length;
          const totalIKInCPL = cpl.iks.length || 1;
          const bobotCpmkToCpl = cpmk.bobot_to_cpl || 0; 
          const sks = kelas.matakuliah?.sks || 0;

          const coef = calculateCoefficient(
            sks, 
            ikLinkCount, 
            totalIKInCPL,
            bobotCpmkToCpl
          );

          if (scoreCPMK > 0) {
              console.error(`   ✅ [HIT] MK: ${kelas.kode_mk} -> CPMK: ${cpmk.kode_cpmk} -> CPL: ${cpl.kode_cpl} | Nilai: ${scoreCPMK}`);
          }

          totalCPLScoreInMK += scoreCPMK * coef;
          totalCPLCoefInMK += coef;
        });

        if (cplScores[cpl.kode_cpl]) {
          cplScores[cpl.kode_cpl].score += totalCPLScoreInMK;
          cplScores[cpl.kode_cpl].coef += totalCPLCoefInMK;
        }
      });
    }

    const studentCPLData = allCPL.map(c => {
      const agg = cplScores[c.kode_cpl];
      const finalScore = agg.coef > 0 ? agg.score / agg.coef : 0;
      
      return {
        code: c.kode_cpl,
        cplLo: c.kode_cpl, 
        nilai: parseFloat(finalScore.toFixed(2)),
        description: c.deskripsi,
        descriptionEn: "-" 
      };
    });

    console.error(`✅ Selesai. Mengembalikan ${studentCPLData.length} data CPL.`);
    return NextResponse.json({ cplData: studentCPLData });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}