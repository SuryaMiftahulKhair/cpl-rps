import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const kelasId = parseInt(resolvedParams.id, 10);
    const body = await request.json();

    // --- MODE 1: SYNC RPS ---
    if (body.action === "sync_rps") {
        const { evaluasi } = body;
        await prisma.$transaction(async (tx) => {
            await tx.komponenNilai.deleteMany({ where: { kelas_id: kelasId } });
            for (const item of evaluasi) {
                if (!item.cpmk_id) continue; 
                await tx.komponenNilai.create({
                    data: {
                        nama: item.nama,
                        bobot_nilai: parseFloat(item.bobot),
                        kelas_id: kelasId,
                        cpmk_id: parseInt(item.cpmk_id)
                    }
                });
            }
        });
        return NextResponse.json({ message: "Sync RPS Berhasil" });
    }

    // --- MODE 2: IMPORT EXCEL ---
    if (body.action === "import_excel") {
        const { komponen, dataNilai } = body;

        if (!dataNilai || !Array.isArray(dataNilai)) {
            return NextResponse.json({ error: "Data Excel tidak valid" }, { status: 400 });
        }

        let successCount = 0;
        let failedCount = 0;
        let errors: string[] = [];

        await prisma.$transaction(async (tx) => {
            for (let i = 0; i < dataNilai.length; i++) {
                const row = dataNilai[i];
                const rowIndex = i + 1; 
                const nimKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'nim');
                const namaKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'nama');

                const rawNim = nimKey ? row[nimKey] : null;
                const rawNama = namaKey ? row[namaKey] : null;

                if (!rawNim) {
                    errors.push(`Baris ${rowIndex}: Kolom NIM kosong.`);
                    failedCount++;
                    continue; 
                }

                const nimString = String(rawNim).trim();
                const namaExcel = String(rawNama || "").trim().toLowerCase();

                // 2. CEK PESERTA DI KELAS 
                let peserta = await tx.pesertaKelas.findFirst({
                    where: {
                        kelas_id: kelasId,
                        mahasiswa: { nim: nimString }
                    }
                });

                if (!peserta) {
                    const mhsMaster = await tx.mahasiswa.findUnique({
                        where: { nim: nimString }
                    });
                    if (!mhsMaster) {
                        console.log(`❌ Gagal: NIM ${nimString} tidak ada di Master Data.`);
                        errors.push(`Baris ${rowIndex} (NIM ${nimString}): Data mahasiswa tidak ditemukan di database kampus.`);
                        failedCount++;
                        continue; 
                    }
                    const namaMaster = mhsMaster.nama.toLowerCase();
                    if (namaExcel && !namaMaster.includes(namaExcel) && !namaExcel.includes(namaMaster)) {
                        console.log(`❌ Gagal: Nama tidak cocok. Master: ${mhsMaster.nama}, Excel: ${rawNama}`);
                        errors.push(`Baris ${rowIndex} (NIM ${nimString}): Nama di Excel ("${rawNama}") tidak cocok dengan data Master ("${mhsMaster.nama}").`);
                        failedCount++;
                        continue; 
                    }
                    console.log(`✨ Auto-register: ${nimString} (${mhsMaster.nama}) ke kelas.`);
                    peserta = await tx.pesertaKelas.create({
                        data: {
                            kelas_id: kelasId,
                            mahasiswa_id: mhsMaster.id
                        }
                    });
                }

                // 3. UPDATE NILAI 
                let isRowUpdated = false;

                for (const k of komponen) {
                    const excelKey = Object.keys(row).find(key => 
                        key.trim().toLowerCase() === k.nama.trim().toLowerCase()
                    );
                    
                    if (excelKey && row[excelKey] !== undefined) {
                        const nilaiInput = parseFloat(row[excelKey]);
                        
                        if (!isNaN(nilaiInput)) {
                            await tx.nilai.upsert({
                                where: {
                                    peserta_kelas_id_komponen_nilai_id: {
                                        peserta_kelas_id: peserta.id,
                                        komponen_nilai_id: k.id
                                    }
                                },
                                update: { nilai_komponen: nilaiInput },
                                create: {
                                    peserta_kelas_id: peserta.id,
                                    komponen_nilai_id: k.id,
                                    nilai_komponen: nilaiInput
                                }
                            });
                            isRowUpdated = true;
                        }
                    }
                }

                // 4. HITUNG NILAI AKHIR 
                if (isRowUpdated) {
                    const allNilai = await tx.nilai.findMany({
                        where: { peserta_kelas_id: peserta.id },
                        include: { komponen: true }
                    });

                    let totalScore = 0;
                    allNilai.forEach(n => {
                        totalScore += (n.nilai_komponen * n.komponen.bobot_nilai) / 100;
                    });

                    totalScore = parseFloat(totalScore.toFixed(2));

                    let huruf = "E";
                    if (totalScore >= 85) huruf = "A";
                    else if (totalScore >= 80) huruf = "A-";
                    else if (totalScore >= 75) huruf = "B+";
                    else if (totalScore >= 70) huruf = "B";
                    else if (totalScore >= 65) huruf = "B-";
                    else if (totalScore >= 60) huruf = "C+";
                    else if (totalScore >= 50) huruf = "C";
                    else if (totalScore >= 40) huruf = "D";

                    await tx.pesertaKelas.update({
                        where: { id: peserta.id },
                        data: {
                            nilai_akhir_angka: totalScore,
                            nilai_akhir_huruf: huruf
                        }
                    });
                    
                    successCount++;
                }
            }
        }, { 

            maxWait: 5000, 
            timeout: 20000 
        });

        let message = `Import Selesai. Sukses: ${successCount}, Gagal: ${failedCount}.`;

        if (errors.length > 0) {
            const errorPreview = errors.slice(0, 3).join("\n"); 
            const moreErrors = errors.length > 3 ? `\n...dan ${errors.length - 3} error lainnya.` : "";
            
            return NextResponse.json({ 
                success: true, 
                message: message,
                details: errorPreview + moreErrors,
                hasError: true
            });
        }

        return NextResponse.json({ success: true, message: message, hasError: false });
    }

    return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 });

  } catch (err: any) {
    console.error("API POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}