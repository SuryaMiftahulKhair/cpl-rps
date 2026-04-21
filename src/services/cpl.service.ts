import prisma from "@/../lib/prisma";
import { 
  calculateCPMKScore, 
  calculateIKScore, 
  calculateFinalCPL 
} from "@/utils/cplCalculation";

export const CplService = {
  /**
   * CORE ENGINE: Mesin penghitung utama
   */
  async processCplLogic(classesData: any[], kurikulumId: number) {
    console.log("\n--- START DEBUG: processCplLogic ---");
    console.log("DEBUG: Kurikulum ID yang digunakan:", kurikulumId);
    console.log("DEBUG: Jumlah data kelas yang masuk:", classesData.length);

    if (classesData.length === 0) {
      console.log("DEBUG: Berhenti karena tidak ada data kelas (classesData kosong).");
      console.log("--- END DEBUG ---\n");
      return { radarData: [] };
    }

    // 1. Ambil Master CPL & IK dari Kurikulum
    const allCPL = await prisma.cPL.findMany({
      where: { kurikulum_id: kurikulumId },
      include: { iks: true },
      orderBy: { kode_cpl: 'asc' }
    });
    
    console.log("DEBUG: Master CPL ditemukan:", allCPL.length);

    const globalIkAcc: Record<number, { inputs: { cpmkScore: number; cpmkWeight: number }[]; courses: Set<number> }> = {};
    const globalCplDirectAcc: Record<number, { inputs: { cpmkScore: number; cpmkWeight: number }[] }> = {};
    const MINIMAL_KELULUSAN_SKS = 145; // Standar S1

    // 2. Iterasi Data Kelas
    for (const kelas of classesData) {
      console.log(`\nDEBUG: Memproses Kelas [${kelas.nama_kelas}] (Matakuliah ID: ${kelas.matakuliah_id})`);
      console.log(`DEBUG: Jumlah Komponen Nilai di kelas ini:`, kelas.komponenNilai?.length || 0);

      const sksMk = kelas.matakuliah?.sks || 0;
      const bobot_mk = sksMk / MINIMAL_KELULUSAN_SKS;
      
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

        const dinamisWeight = totalBobotRps > 0 ? totalBobotRps : 1;
        const finalWeight = bobot_mk * dinamisWeight;

        if (cpmk.sub_cpmk?.length > 0) {
          cpmk.sub_cpmk.forEach((sub: any) => {
            const ikId = sub.ik_id;
            if (!ikId) return;
            if (!globalIkAcc[ikId]) {
              globalIkAcc[ikId] = { inputs: [], courses: new Set() };
            }
            globalIkAcc[ikId].inputs.push({ cpmkScore, cpmkWeight: finalWeight });
            globalIkAcc[ikId].courses.add(kelas.matakuliah_id);
          });
        }
        
        if (cpmk.cpl?.length > 0) {
          cpmk.cpl.forEach((cplObj: any) => {
            if (!globalCplDirectAcc[cplObj.id]) globalCplDirectAcc[cplObj.id] = { inputs: [] };
            globalCplDirectAcc[cplObj.id].inputs.push({ cpmkScore, cpmkWeight: finalWeight });
          });
        }
      }
    }

    // 3. Final Agregasi ke Radar Chart
    const radarData = allCPL.map(cpl => {
      let finalValue = 0;

      if (cpl.iks && cpl.iks.length > 0) {
        const ikResults = cpl.iks.map(ikMaster => {
          const data = globalIkAcc[ikMaster.id];
          if (!data) return null;
          return {
            ikScore: calculateIKScore(data.inputs),
            bobotIK: data.courses.size 
          };
        }).filter(Boolean);

        if (ikResults.length > 0) finalValue = calculateFinalCPL(ikResults as any);
      } else {
        const direct = globalCplDirectAcc[cpl.id];
        if (direct) finalValue = calculateIKScore(direct.inputs);
      }

      return {
        subject: cpl.kode_cpl,
        score: parseFloat(finalValue.toFixed(2)),
        full_name: cpl.deskripsi
      };
    });

    console.log("\nDEBUG: Eksekusi selesai. Mengirim radarData.");
    console.log("--- END DEBUG ---\n");

    return { radarData };
  },

  /**
   * LAPORAN MAHASISWA
   */
  async getMahasiswaReport(studentId: number, semesterIds?: number[]) {
    const student = await prisma.mahasiswa.findUnique({
        where: { id: studentId }
    });

    const pId = (student as any)?.prodiId || (student as any)?.prodi_id;
    if (!pId) throw new Error("Data Prodi mahasiswa tidak ditemukan.");

    const activeKurikulum = await prisma.kurikulum.findFirst({
        where: { prodi_id: Number(pId), is_active: true },
        select: { id: true }
    });

    if (!activeKurikulum) throw new Error("Kurikulum aktif untuk prodi ini tidak ditemukan.");

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

    const classesData = enrollments.map(e => ({
        ...e.kelas,
        komponenNilai: e.kelas.komponenNilai.map(kn => ({
            ...kn,
            nilai_individu: e.nilai.find(n => n.komponen_nilai_id === kn.id)?.nilai_komponen || 0
        }))
    }));

    return this.processCplLogic(classesData, activeKurikulum.id);
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
    console.log("DEBUG API PRODI: Menarik data kelas untuk Kurikulum ID:", kurikulumId, "Semester IDs:", semesterIds);
    
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

    console.log("DEBUG API PRODI: Query selesai. Ditemukan kelas sebanyak:", classes.length);

    return this.processCplLogic(classes, kurikulumId);
  }
};