// file: src/app/api/kelas/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; 


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params; // Await params dulu agar aman
    console.log("PARAMS DITERIMA:", resolvedParams); 

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      console.log("GAGAL PARSE ID:", resolvedParams.id);
      return NextResponse.json({ error: "ID Kelas tidak valid" }, { status: 400 });}

    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        tahun_ajaran: true,
        
        matakuliah: {
          include: {
            rps: {
              where: { is_locked: true }, 
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { 
                pertemuan: {
                  include: { cpmk: true }
                },
                cpmk: true 
              }
            }
          }
        },

        cpmk: true, 
        
        rps: true,

        komponenNilai: {
          include: {
            pemetaan_komponen_cpmk: { include: { cpmk: true } }
          },
          orderBy: { id: 'asc' }
        },
        
        peserta_kelas: {
          include: {
            mahasiswa: true, 
            nilai: true     
          },
          orderBy: { mahasiswa: { nim: 'asc' } }
        },
      },
    });

    if (!kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });

    const activeRps = Array.isArray(kelas.rps) ? kelas.rps[0] || null : null;

    const rpsOtorisasi = activeRps ? {
        kaprodi: activeRps.nama_kaprodi || "-",
        koordinator: activeRps.nama_koordinator || "-",
        penyusun: activeRps.nama_penyusun || "-"
    } : null;

    let availableCPMK: any[] = [];
    if (kelas.matakuliah?.rps && kelas.matakuliah.rps.length > 0) {
        availableCPMK = kelas.matakuliah.rps[0].cpmk;
    } 
    if (availableCPMK.length === 0 && kelas.cpmk.length > 0) {
        availableCPMK = kelas.cpmk;
    }

    let rpsSource = null;
    
    if (kelas.komponenNilai.length === 0 && kelas.matakuliah?.rps && kelas.matakuliah.rps.length > 0) {
      const activeRps = kelas.matakuliah.rps[0];
      
      const evaluasiRps = activeRps.pertemuan
        .filter((p: any) => (p.bobot_nilai || 0) > 0)
        .map((p: any) => ({

          nama: p.metode_pembelajaran || `Evaluasi Pekan ${p.pekan_ke}`,
          bobot: p.bobot_nilai || 0,

          cpmk_id: p.cpmk.length > 0 ? p.cpmk[0].id : null,
          cpmk_kode: p.cpmk.length > 0 ? p.cpmk[0].kode_cpmk : null
        }));

      if (evaluasiRps.length > 0) {
        rpsSource = { 
          rps_id: activeRps.id, 
          evaluasi: evaluasiRps 
        };
      }
    }

    const responseData = {
      kelasInfo: {
        namaKelas: kelas.nama_kelas,
        kodeMatakuliah: kelas.kode_mk, 
        namaMatakuliah: kelas.nama_mk,
        sks: kelas.sks,
        tahunAjaran: kelas.tahun_ajaran ? `${kelas.tahun_ajaran.semester} ${kelas.tahun_ajaran.tahun}` : "-",
        otorisasi : rpsOtorisasi,
      },
      
      cpmkList: availableCPMK.map((c: any) => ({
          id: c.id,
          kode_cpmk: c.kode_cpmk,
          deskripsi: c.deskripsi || "Tanpa Deskripsi"
      })),

      komponenList: kelas.komponenNilai.map(k => ({
        id: k.id,
        nama: k.nama,
        bobot: k.bobot,
        cpmk_id: k.pemetaan_komponen_cpmk.length > 0 ? k.pemetaan_komponen_cpmk[0].cpmk_id : null,
        nama_cpmk: k.pemetaan_komponen_cpmk.length > 0 ? k.pemetaan_komponen_cpmk[0].cpmk.kode_cpmk : null
      })),
      
      rpsSource, 
    
      mahasiswaList: kelas.peserta_kelas.map((p, index) => {
        const nilaiMap: Record<string, number> = {};
        
        p.nilai.forEach(n => {
          const namaKomponen = kelas.komponenNilai.find(k => k.id === n.komponen_nilai_id)?.nama;
          if (namaKomponen) nilaiMap[namaKomponen] = n.nilai_komponen; 
        });

        return {
          id: p.id, 
          no: index + 1,
          nim: p.mahasiswa.nim, 
          nama: p.mahasiswa.nama, 
          nilai_akhir: p.nilai_akhir_angka || 0, 
          nilai_huruf: p.nilai_akhir_huruf || "-", 
          ...nilaiMap 
        };
      })
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}