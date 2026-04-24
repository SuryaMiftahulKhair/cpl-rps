import prisma from "@/../lib/prisma";
import { 
  calculateCPMKScore, 
  calculateIKScore, 
  calculateFinalCPL 
} from "@/utils/cplCalculation";

export const CplService = {
  async processCplLogic(classesData: any[], kurikulumId: number) {
    if (classesData.length === 0) {
      return { radarData: [], classData: [] };
    }

    const rawCPL = await prisma.cPL.findMany({
      where: { kurikulum_id: kurikulumId },
      include: { iks: true },
    });
    
    const allCPL = rawCPL.sort((a, b) => 
      a.kode_cpl.localeCompare(b.kode_cpl, undefined, { numeric: true, sensitivity: 'base' })
    );

    const ikScoresByMk: Record<number, Record<number, { scoreXstudents: number, totalStudents: number }>> = {};
    const cplDirectScoresByMk: Record<number, Record<number, { scoreXstudents: number, totalStudents: number }>> = {};
    const classDataArr: any[] = [];

    for (const kelas of classesData) {
      let classStudentCount = 0;
      kelas.komponenNilai.forEach((kn: any) => {
        if (Array.isArray(kn.nilai)) {
          classStudentCount = Math.max(classStudentCount, kn.nilai.length);
        }
      });
      if (classStudentCount === 0 && kelas.komponenNilai.some((kn: any) => kn.nilai_individu !== undefined)) {
        classStudentCount = 1;
      }
      if (classStudentCount === 0) classStudentCount = 1; // Mencegah error pembagian nol (Infinity)

      const classIkAcc: Record<number, { inputs: { cpmkScore: number; cpmkWeight: number }[] }> = {};
      const classCplDirectAcc: Record<number, { inputs: { cpmkScore: number; cpmkWeight: number }[] }> = {};

      const componentScores: Record<number, number> = {};
      kelas.komponenNilai.forEach((kn: any) => {
        if (Array.isArray(kn.nilai)) {
          const sum = kn.nilai.reduce((acc: number, curr: any) => acc + (curr.nilai_komponen || 0), 0);
          componentScores[kn.id] = kn.nilai.length > 0 ? sum / kn.nilai.length : 0;
        } else if (kn.nilai_individu !== undefined) {
          componentScores[kn.id] = kn.nilai_individu;
        }
      });

      const cpmkGroup: Record<number, { inputs: { nilai: number, bobot: number }[], obj: any }> = {};
      kelas.komponenNilai.forEach((kn: any) => {
        const score = componentScores[kn.id];
        if (score === undefined || !kn.cpmk_id) return;

        if (!cpmkGroup[kn.cpmk_id]) {
          cpmkGroup[kn.cpmk_id] = { inputs: [], obj: kn.cpmk };
        }
        cpmkGroup[kn.cpmk_id].inputs.push({ nilai: score, bobot: kn.bobot_nilai });
      });

      for (const [cpmkId, data] of Object.entries(cpmkGroup)) {
        const cpmkScore = calculateCPMKScore(data.inputs).score;
        const cpmk = data.obj;

        let totalBobotRps = 0;
        cpmk.sub_cpmk?.forEach((sub: any) => {
          sub.rps_pertemuan?.forEach((p: any) => {
            totalBobotRps += (p.bobot_assesment || 0);
          });
        });

        const finalWeight = totalBobotRps > 0 ? totalBobotRps : 1;

        if (cpmk.sub_cpmk?.length > 0) {
          cpmk.sub_cpmk.forEach((sub: any) => {
            const ikId = sub.ik_id;
            if (!ikId) return;

            if (!classIkAcc[ikId]) classIkAcc[ikId] = { inputs: [] };
            classIkAcc[ikId].inputs.push({ cpmkScore, cpmkWeight: finalWeight });
          });
        }
        
        if (cpmk.cpl?.length > 0) {
          cpmk.cpl.forEach((cplObj: any) => {
            if (!classCplDirectAcc[cplObj.id]) classCplDirectAcc[cplObj.id] = { inputs: [] };
            classCplDirectAcc[cplObj.id].inputs.push({ cpmkScore, cpmkWeight: finalWeight });
          });
        }
      }

      const classIkFinalScores: Record<number, number> = {};
      for (const [ikIdStr, acc] of Object.entries(classIkAcc)) {
        classIkFinalScores[Number(ikIdStr)] = calculateIKScore(acc.inputs);
      }

      const classCplDirectFinalScores: Record<number, number> = {};
      for (const [cplIdStr, acc] of Object.entries(classCplDirectAcc)) {
        classCplDirectFinalScores[Number(cplIdStr)] = calculateIKScore(acc.inputs);
      }

      const classScores: Record<string, number> = {};
      allCPL.forEach(cpl => {
        let val = 0;
        if (cpl.iks && cpl.iks.length > 0) {
          const ikResults = cpl.iks.map(ikMaster => {
            const ikS = classIkFinalScores[ikMaster.id];
            if (ikS === undefined) return null;
            return { ikScore: ikS, bobotIK: 1 };
          }).filter(Boolean);
          if (ikResults.length > 0) val = calculateFinalCPL(ikResults as any);
        } else {
          const direct = classCplDirectFinalScores[cpl.id];
          if (direct !== undefined) val = direct;
        }
        if (val > 0) classScores[cpl.kode_cpl] = parseFloat(val.toFixed(2));
      });

      classDataArr.push({
        id: kelas.id,
        code: kelas.matakuliah?.kode_mk || "-",
        name: kelas.matakuliah?.nama || "-",
        class_name: kelas.nama_kelas,
        total_students: classStudentCount, 
        scores: classScores
      });

      const mkId = kelas.matakuliah_id;
      if (!ikScoresByMk[mkId]) ikScoresByMk[mkId] = {};
      if (!cplDirectScoresByMk[mkId]) cplDirectScoresByMk[mkId] = {};

      for (const [ikIdStr, score] of Object.entries(classIkFinalScores)) {
        const id = Number(ikIdStr);
        if (!ikScoresByMk[mkId][id]) ikScoresByMk[mkId][id] = { scoreXstudents: 0, totalStudents: 0 };
        ikScoresByMk[mkId][id].scoreXstudents += (score * classStudentCount);
        ikScoresByMk[mkId][id].totalStudents += classStudentCount;
      }

      for (const [cplIdStr, score] of Object.entries(classCplDirectFinalScores)) {
        const id = Number(cplIdStr);
        if (!cplDirectScoresByMk[mkId][id]) cplDirectScoresByMk[mkId][id] = { scoreXstudents: 0, totalStudents: 0 };
        cplDirectScoresByMk[mkId][id].scoreXstudents += (score * classStudentCount);
        cplDirectScoresByMk[mkId][id].totalStudents += classStudentCount;
      }
    }

    const globalIkFinals: Record<number, { scoreSum: number, mkCount: number }> = {};
    const globalCplDirectFinals: Record<number, { scoreSum: number, mkCount: number }> = {};

    for (const [mkIdStr, ikMap] of Object.entries(ikScoresByMk)) {
      for (const [ikIdStr, acc] of Object.entries(ikMap)) {
        const id = Number(ikIdStr);
        const mkIkScore = acc.totalStudents > 0 ? (acc.scoreXstudents / acc.totalStudents) : 0;
        
        if (!globalIkFinals[id]) globalIkFinals[id] = { scoreSum: 0, mkCount: 0 };
        globalIkFinals[id].scoreSum += mkIkScore;
        globalIkFinals[id].mkCount += 1; // 
      }
    }

    for (const [mkIdStr, cplMap] of Object.entries(cplDirectScoresByMk)) {
      for (const [cplIdStr, acc] of Object.entries(cplMap)) {
        const id = Number(cplIdStr);
        const mkCplScore = acc.totalStudents > 0 ? (acc.scoreXstudents / acc.totalStudents) : 0;
        
        if (!globalCplDirectFinals[id]) globalCplDirectFinals[id] = { scoreSum: 0, mkCount: 0 };
        globalCplDirectFinals[id].scoreSum += mkCplScore;
        globalCplDirectFinals[id].mkCount += 1;
      }
    }

    const radarData = allCPL.map(cpl => {
      let finalValue = 0;

      if (cpl.iks && cpl.iks.length > 0) {
        const ikResults = cpl.iks.map(ikMaster => {
          const globalIk = globalIkFinals[ikMaster.id];
          if (!globalIk || globalIk.mkCount === 0) return null;
          
          const avgIkScore = globalIk.scoreSum / globalIk.mkCount;
          return {
            ikScore: avgIkScore,
            bobotIK: globalIk.mkCount
          };
        }).filter(Boolean);

        if (ikResults.length > 0) finalValue = calculateFinalCPL(ikResults as any);
      } else {
        const globalDir = globalCplDirectFinals[cpl.id];
        if (globalDir && globalDir.mkCount > 0) {
          finalValue = globalDir.scoreSum / globalDir.mkCount;
        }
      }

      return {
        subject: cpl.kode_cpl,
        score: parseFloat(finalValue.toFixed(2)),
        full_name: cpl.deskripsi
      };
    });

    return { radarData, classData: classDataArr };
  },

  /**
   * LAPORAN MAHASISWA
   */
  async getMahasiswaReport(studentId: number, semesterIds?: number[]) {
    const enrollments = await prisma.pesertaKelas.findMany({
      where: { 
        mahasiswa_id: studentId,
        kelas: { tahun_ajaran_id: semesterIds?.length ? { in: semesterIds } : undefined }
      },
      include: {
        kelas: {
          include: {
            matakuliah: true,
            komponenNilai: {
              include: {
                cpmk: { 
                  include: { 
                    sub_cpmk: { include: { rps_pertemuan: true } },
                    cpl: true
                  } 
                }
              }
            }
          }
        },
        nilai: true
      }
    });

    if (enrollments.length === 0) {
        return { radarData: [], classData: [] };
    }

    const kurikulumId = enrollments[0].kelas.matakuliah?.kurikulum_id;
    if (!kurikulumId) throw new Error("Gagal mendeteksi kurikulum dari kelas yang diambil.");

    const classesData = enrollments.map(e => ({
        ...e.kelas,
        komponenNilai: e.kelas.komponenNilai.map(kn => ({
            ...kn,
            nilai_individu: e.nilai.find(n => n.komponen_nilai_id === kn.id)?.nilai_komponen || 0
        }))
    }));

    return this.processCplLogic(classesData, kurikulumId);
  },

  /**
   * LAPORAN MATAKULIAH
   */
  async getMatakuliahReport(mkId: number, semesterIds?: number[]) {
    const mk = await prisma.mataKuliah.findUnique({ where: { id: mkId } });
    if (!mk) throw new Error("Matakuliah tidak ditemukan");

    const classes = await prisma.kelas.findMany({
      where: { 
        matakuliah_id: mkId,
        tahun_ajaran_id: semesterIds?.length ? { in: semesterIds } : undefined
      },
      include: {
        matakuliah: true,
        komponenNilai: {
          include: {
            nilai: true,
            cpmk: { 
              include: { 
                sub_cpmk: { include: { rps_pertemuan: true } },
                cpl: true
              } 
            }
          }
        }
      }
    });

    return this.processCplLogic(classes, mk.kurikulum_id);
  },

  /**
   * LAPORAN PRODI
   */
  async getProdiReport(kurikulumId: number, semesterIds?: number[]) {    
    const classes = await prisma.kelas.findMany({
      where: {
        matakuliah: { kurikulum_id: kurikulumId },
        tahun_ajaran_id: semesterIds?.length ? { in: semesterIds } : undefined
      },
      include: {
        matakuliah: true,
        komponenNilai: {
          include: {
            nilai: true,
            cpmk: { 
              include: { 
                sub_cpmk: { include: { rps_pertemuan: true } },
                cpl: true
              } 
            }
          }
        }
      }
    });

    return this.processCplLogic(classes, kurikulumId);
  }
};