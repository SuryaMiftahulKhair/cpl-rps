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
    
    // --- MODE 1: SYNC DARI RPS (Tarik Rencana) ---
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

    // --- MODE 2: IMPORT EXCEL (NILAI + MAHASISWA + HITUNG) ---
    const { komponen, dataNilai } = body;

    // Validasi input
    if (!komponen || !Array.isArray(komponen)) {
        return NextResponse.json({ error: "Data komponen tidak valid" }, { status: 400 });
    }
    if (!dataNilai || !Array.isArray(dataNilai)) {
        return NextResponse.json({ error: "Data nilai excel kosong" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {

        const dbKomponen = await tx.komponenNilai.findMany({
            where: { kelas_id: kelasId }
        });

        for (const row of dataNilai) {
            const nimKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'nim');
            const namaKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'nama');
            
            const nim = nimKey ? String(row[nimKey]).trim() : null;
            const namaMhs = namaKey ? String(row[namaKey]).trim() : "Mahasiswa Baru";

            if (!nim) continue; 
            const mhs = await tx.mahasiswa.upsert({
                where: { nim: nim },
                update: { nama: namaMhs }, 
                create: {
                    nim: nim,
                    nama: namaMhs
                }
            });

            const peserta = await tx.pesertaKelas.upsert({
                where: {
                    kelas_id_mahasiswa_id: {
                        kelas_id: kelasId,
                        mahasiswa_id: mhs.id
                    }
                },
                update: {}, 
                create: {
                    kelas_id: kelasId,
                    mahasiswa_id: mhs.id
                }
            });

            let totalNilaiAkhir = 0;

           
            for (const kompData of dbKomponen) {
                
                const excelKey = Object.keys(row).find(k => 
                    k.trim().toLowerCase() === kompData.nama.trim().toLowerCase() ||
                    k.trim().toLowerCase().startsWith(kompData.nama.trim().toLowerCase() + " (") 
                );

                const excelVal = excelKey ? row[excelKey] : undefined;
                if (excelVal !== undefined && excelVal !== null && excelVal !== "") {
                    const nilaiAngka = parseFloat(excelVal);
                    
                    if (!isNaN(nilaiAngka)) {
                        await tx.nilai.upsert({
                            where: {
                                peserta_kelas_id_komponen_nilai_id: {
                                    peserta_kelas_id: peserta.id,
                                    komponen_nilai_id: kompData.id
                                }
                            },
                            update: { nilai_komponen: nilaiAngka },
                            create: {
                                peserta_kelas_id: peserta.id,
                                komponen_nilai_id: kompData.id,
                                nilai_komponen: nilaiAngka
                            }
                        });
                        totalNilaiAkhir += (nilaiAngka * kompData.bobot_nilai) / 100;
                    }
                }
            }

            let nilaiHuruf = "E";
            if (totalNilaiAkhir >= 85) nilaiHuruf = "A";
            else if (totalNilaiAkhir >= 80) nilaiHuruf = "A-";
            else if (totalNilaiAkhir >= 75) nilaiHuruf = "B+";
            else if (totalNilaiAkhir >= 70) nilaiHuruf = "B";
            else if (totalNilaiAkhir >= 65) nilaiHuruf = "B-";
            else if (totalNilaiAkhir >= 60) nilaiHuruf = "C+";
            else if (totalNilaiAkhir >= 50) nilaiHuruf = "C";
            else if (totalNilaiAkhir >= 40) nilaiHuruf = "D";

            await tx.pesertaKelas.update({
                where: { id: peserta.id },
                data: {
                    nilai_akhir_angka: parseFloat(totalNilaiAkhir.toFixed(2)),
                    nilai_akhir_huruf: nilaiHuruf
                }
            });
        }
    });

    return NextResponse.json({ message: "Import berhasil: Data Mahasiswa & Nilai tersimpan." });

  } catch (err: any) {
    console.error("API POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}