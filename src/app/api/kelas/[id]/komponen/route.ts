import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const kelasId = parseInt((await params).id, 10);
    const body = await request.json();
    
    // --- MODE 1: SYNC RPS ---
    if (body.action === "sync_rps") {
        const { evaluasi } = body;
        await prisma.$transaction(async (tx) => {
            await tx.komponenNilai.deleteMany({ where: { kelas_id: kelasId } });
            for (const item of evaluasi) {
                const newK = await tx.komponenNilai.create({
                    data: {
                        nama: item.nama,
                        bobot: parseFloat(item.bobot),
                        kelas_id: kelasId
                    }
                });
                if (item.cpmk_id) {
                    await tx.pemetaanKomponenCpmk.create({
                        data: {
                            komponen_nilai_id: newK.id,
                            cpmk_id: parseInt(item.cpmk_id),
                            bobot: 100 // Default 100% kontribusi ke CPMK tsb
                        }
                    });
                }
            }
        });
        return NextResponse.json({ message: "Sync RPS Success" });
    }

    // --- MODE 2: SIMPAN MANUAL / UPLOAD EXCEL ---
    const { komponen, dataNilai } = body;

    if (!komponen || !Array.isArray(komponen)) {
        return NextResponse.json({ error: "Data komponen tidak valid" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
        // 1. Reset Komponen Lama (Agar bersih dan tidak duplikat)
        await tx.komponenNilai.deleteMany({ where: { kelas_id: kelasId } });

        const mapKomponenId: Record<string, number> = {};
        
        // 2. Buat Komponen Baru & Mapping CPL
        for (const k of komponen) {
            const newK = await tx.komponenNilai.create({
                data: {
                    nama: k.nama,
                    bobot: parseFloat(k.bobot),
                    kelas_id: kelasId
                }
            });
            
            // Simpan ID untuk mapping nilai nanti
            mapKomponenId[k.nama] = newK.id;

            // [PENTING] Simpan Hubungan ke CPMK (CPL)
            if (k.cpmk_id) {
                // Pastikan cpmk_id dikonversi ke Int
                const cpmkIdInt = parseInt(String(k.cpmk_id)); 
                
                if (!isNaN(cpmkIdInt)) {
                    // Gunakan nama model yang sesuai di schema.prisma Anda
                    // Biasanya 'pemetaanKomponenCPMK' atau 'pemetaan_komponen_cpmk'
                    await tx.pemetaanKomponenCpmk.create({
                        data: {
                            komponen_nilai_id: newK.id,
                            cpmk_id: cpmkIdInt,
                            bobot: 100 
                        }
                    });
                }
            }
        }

        // 3. Simpan Nilai Mahasiswa (Jika ada data Excel)
        if (dataNilai && Array.isArray(dataNilai)) {
            for (const row of dataNilai) {
                // Normalisasi Key Excel (biar tidak case sensitive)
                const nimKey = Object.keys(row).find(key => key.toLowerCase() === 'nim');
                const namaKey = Object.keys(row).find(key => key.toLowerCase() === 'nama');
                
                const nim = nimKey ? row[nimKey] : null;
                const namaMhs = namaKey ? row[namaKey] : "Mahasiswa";

                if (!nim) continue; 

                // Cari atau Buat Peserta Kelas
                let peserta = await tx.pesertaKelas.findFirst({
                    where: { kelas_id: kelasId, nim: String(nim) }
                });

                if (!peserta) {
                    peserta = await tx.pesertaKelas.create({
                        data: { 
                            kelas: {
                                connect: { id: kelasId }
                            },
                            mahasiswa: {
                                connect: { nim: String(nim) }}
                        }
                    });
                }

                // Simpan Nilai per Komponen
                let nilaiAkhir = 0;
                for (const k of komponen) {
                    // Cari nilai di Excel berdasarkan nama komponen
                    const val = row[k.nama];
                    const nilaiAngka = parseFloat(val);
                    const komponenId = mapKomponenId[k.nama];

                    if (!isNaN(nilaiAngka) && komponenId) {
                        await tx.nilai.create({
                            data: {
                                peserta_kelas_id: peserta.id,
                                komponen_nilai_id: komponenId,
                                nilai_komponen: nilaiAngka
                            }
                        });
                        nilaiAkhir += nilaiAngka * (k.bobot / 100);
                    }
                }
                
                // Konversi Huruf
                let nilaiHuruf = "E";
                if (nilaiAkhir >= 85) nilaiHuruf = "A";
                else if (nilaiAkhir >= 80) nilaiHuruf = "A-";
                else if (nilaiAkhir >= 75) nilaiHuruf = "B+";
                else if (nilaiAkhir >= 70) nilaiHuruf = "B";
                else if (nilaiAkhir >= 65) nilaiHuruf = "B-";
                else if (nilaiAkhir >= 60) nilaiHuruf = "C+";
                else if (nilaiAkhir >= 50) nilaiHuruf = "C";
                else if (nilaiAkhir >= 40) nilaiHuruf = "D";
                
                await tx.pesertaKelas.update({
                    where: { id: peserta.id },
                    data: { nilai_akhir_angka: nilaiAkhir, nilai_huruf: nilaiHuruf }
                });
            }
        }
    });

    return NextResponse.json({ message: "Data berhasil disimpan" });

  } catch (err: any) {
    console.error("API POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}