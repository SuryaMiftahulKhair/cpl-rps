import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; 

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID Kelas tidak valid" }, { status: 400 });
    }

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
                    include: { cpmk: true },
                    orderBy: { pekan_ke: 'asc' }
                },
                cpmk: true 
              }
            }
          }
        },
        cpmk: true, 
        komponenNilai: {
          include: {
             cpmk: true 
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

    // --- DATA OTORISASI RPS ---
    const activeRps = kelas.matakuliah?.rps?.[0] || null;
    
    const formatPenyusun = (data: any): string => {
        if (!data) return "-";
        if (Array.isArray(data)) return data.join(", "); 
        if (typeof data === 'object' && data.nama) return data.nama;
        return String(data);
    };

    const rpsOtorisasi = activeRps ? {
        kaprodi: activeRps.nama_kaprodi || "-",
        koordinator: activeRps.nama_koordinator || "-",
        penyusun: formatPenyusun(activeRps.nama_penyusun)
    } : null;

    // --- AVAILABLE CPMK ---
    let availableCPMK: any[] = [];
    if (activeRps) {
        availableCPMK = activeRps.cpmk;
    } 
    if (availableCPMK.length === 0 && kelas.cpmk.length > 0) {
        availableCPMK = kelas.cpmk;
    }

    // --- LOGIKA DETEKSI SUMBER RPS UNTUK SYNC ---
    let rpsSource = null;
    
    if (kelas.komponenNilai.length === 0 && activeRps) {
      
      const evaluasiRps = activeRps.pertemuan
        .filter((p: any) => (p.bobot_cpmk || 0) > 0) 
        .map((p: any) => ({

          nama: p.metode_pembelajaran && p.metode_pembelajaran.trim() !== "" 
                ? p.metode_pembelajaran 
                : `Evaluasi Pekan ${p.pekan_ke}`,
          
          bobot: p.bobot_cpmk || 0,

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
        bobot: k.bobot_nilai,
        cpmk_id: k.cpmk?.id || null,
        nama_cpmk: k.cpmk?.kode_cpmk || null
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