import prisma from "@/../lib/prisma";

export const KelasService = {
   getNilaiHuruf(totalScore: number): string {
    if (totalScore >= 85) return "A";
    if (totalScore >= 80) return "A-";
    if (totalScore >= 75) return "B+";
    if (totalScore >= 70) return "B";
    if (totalScore >= 65) return "B-";
    if (totalScore >= 60) return "C+";
    if (totalScore >= 50) return "C";
    if (totalScore >= 40) return "D";
    return "E";
  },

  async syncRps(kelasId: number) {
    return await prisma.$transaction(async (tx) => {
      const kelas = await tx.kelas.findUnique({
        where: { id: kelasId },
      });

      if (!kelas || !kelas.rps_id) {
        throw new Error("Kelas tidak ditemukan atau RPS belum diset.");
      }

      await tx.komponenNilai.deleteMany({ where: { kelas_id: kelasId } });

      const pertemuanRPS = await tx.rPSPertemuan.findMany({
        where: {
          rps_id: kelas.rps_id,
          bobot_assesment: { gt: 0 },
        },
        include: {
          sub_cpmk: true,
        },
      });

      let createdCount = 0;

      for (const p of pertemuanRPS) {
        let targetCpmkId = null;
        if (p.sub_cpmk && p.sub_cpmk.length > 0) {
          targetCpmkId = p.sub_cpmk[0].cpmk_id;
        }

        if (targetCpmkId) {
          await tx.komponenNilai.create({
            data: {
              nama: `Evaluasi Pekan ${p.pekan_ke}`,
              bobot_nilai: p.bobot_assesment,
              kelas_id: kelasId,
              cpmk_id: targetCpmkId,
            },
          });
          createdCount++;
        } else {
          console.warn(`Pekan ${p.pekan_ke} dilewati karena belum di-tag ke Sub-CPMK manapun`);
        }
      }

      return { message: "Sync RPS Berhasil", count: createdCount };
    });
  },

  async importNilaiExcel(kelasId: number, komponen: any[], dataNilai: any[]) {
    let successCount = 0;
    let failedCount = 0;
    let errors: string[] = [];

    await prisma.$transaction(
      async (tx) => {
        for (let i = 0; i < dataNilai.length; i++) {
          const row = dataNilai[i];
          const rowIndex = i + 1;
          const nimKey = Object.keys(row).find((k) => k.trim().toLowerCase() === "nim");
          const namaKey = Object.keys(row).find((k) => k.trim().toLowerCase() === "nama");

          const rawNim = nimKey ? row[nimKey] : null;
          const rawNama = namaKey ? row[namaKey] : null;

          if (!rawNim) {
            errors.push(`Baris ${rowIndex}: Kolom NIM kosong.`);
            failedCount++;
            continue;
          }

          const nimString = String(rawNim).trim();
          const namaExcel = String(rawNama || "").trim().toLowerCase();

          let peserta = await tx.pesertaKelas.findFirst({
            where: {
              kelas_id: kelasId,
              mahasiswa: { nim: nimString },
            },
          });

          if (!peserta) {
            const mhsMaster = await tx.mahasiswa.findUnique({
              where: { nim: nimString },
            });
            if (!mhsMaster) {
              errors.push(`Baris ${rowIndex} (NIM ${nimString}): Data mahasiswa tidak ditemukan di database kampus.`);
              failedCount++;
              continue;
            }
            const namaMaster = mhsMaster.nama.toLowerCase();
            if (namaExcel && !namaMaster.includes(namaExcel) && !namaExcel.includes(namaMaster)) {
              errors.push(`Baris ${rowIndex} (NIM ${nimString}): Nama di Excel ("${rawNama}") tidak cocok dengan data Master ("${mhsMaster.nama}").`);
              failedCount++;
              continue;
            }
            
            peserta = await tx.pesertaKelas.create({
              data: {
                kelas_id: kelasId,
                mahasiswa_id: mhsMaster.id,
              },
            });
          }

          let isRowUpdated = false;

          for (const k of komponen) {
            const excelKey = Object.keys(row).find(
              (key) => key.trim().toLowerCase() === k.nama.trim().toLowerCase()
            );

            if (excelKey && row[excelKey] !== undefined) {
              const nilaiInput = parseFloat(row[excelKey]);

              if (!isNaN(nilaiInput)) {
                await tx.nilai.upsert({
                  where: {
                    peserta_kelas_id_komponen_nilai_id: {
                      peserta_kelas_id: peserta.id,
                      komponen_nilai_id: k.id,
                    },
                  },
                  update: { nilai_komponen: nilaiInput },
                  create: {
                    peserta_kelas_id: peserta.id,
                    komponen_nilai_id: k.id,
                    nilai_komponen: nilaiInput,
                  },
                });
                isRowUpdated = true;
              }
            }
          }

          if (isRowUpdated) {
            const allNilai = await tx.nilai.findMany({
              where: { peserta_kelas_id: peserta.id },
              include: { komponen: true },
            });

            let totalScore = 0;
            allNilai.forEach((n) => {
              totalScore += (n.nilai_komponen * n.komponen.bobot_nilai) / 100;
            });

            totalScore = parseFloat(totalScore.toFixed(2));
            const huruf = this.getNilaiHuruf(totalScore);

            await tx.pesertaKelas.update({
              where: { id: peserta.id },
              data: {
                nilai_akhir_angka: totalScore,
                nilai_akhir_huruf: huruf,
              },
            });

            successCount++;
          }
        }
      },
      { maxWait: 5000, timeout: 20000 }
    );

    return { successCount, failedCount, errors };
  },
};