import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; 

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "ID Kelas tidak valid" }, { status: 400 });

    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        tahun_ajaran: true,
        
        // --- PERUBAHAN UTAMA DI SINI ---
        matakuliah: {
          include: {
            rps: {
              // 1. Ambil hanya RPS yang sudah dikunci (Final)
              // 2. Urutkan dari yang terbaru
              // 3. Ambil 1 saja
              where: { is_locked: true }, 
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                pertemuan: true // Ambil data pertemuan untuk bobot nilai
              }
            }
          }
        },
        // -------------------------------

        dosen_pengampu: {
          include: { dosen: true }
        },
        komponenNilai: {
          orderBy: { id: 'asc' }
        },
        peserta_kelas: {
          include: { nilai: true },
          orderBy: { nim: "asc" },
        },
      },
    });

    if (!kelas) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });

    // --- PERUBAHAN LOGIKA PENGAMBILAN RPS ---
    let rpsSource = null;
    
    // Cek apakah array rps ada isinya
    if (kelas.komponenNilai.length === 0 && kelas.matakuliah?.rps && Array.isArray(kelas.matakuliah.rps) && kelas.matakuliah.rps.length > 0) {
      
      // Ambil RPS pertama (karena sudah di-sort desc & take 1 di query atas)
      const activeRps = kelas.matakuliah.rps[0];

      // Filter pertemuan yang punya bobot nilai > 0
      const evaluasiRps = activeRps.pertemuan
        .filter((p: { bobot_nilai: any; }) => (p.bobot_nilai || 0) > 0)
        .map((p: { kriteria_penilaian: any; pekan_ke: any; bobot_nilai: any; }) => ({
          nama: p.kriteria_penilaian || `Evaluasi Pekan ${p.pekan_ke}`,
          bobot: p.bobot_nilai || 0
        }));
        
      if (evaluasiRps.length > 0) {
        rpsSource = {
          rps_id: activeRps.id,
          evaluasi: evaluasiRps
        };
      }
    }
    // ----------------------------------------

    const responseData = {
      kelasInfo: {
        namaKelas: kelas.nama_kelas,
        kodeMatakuliah: kelas.kode_mk, 
        namaMatakuliah: kelas.nama_mk,
        sks: kelas.sks,
        tahunAjaran: kelas.tahun_ajaran ? `${kelas.tahun_ajaran.semester} ${kelas.tahun_ajaran.tahun}` : "-",
        namaProdi: "Teknik Informatika" 
      },
      dosenList: kelas.dosen_pengampu.map((dp) => ({
        id: dp.id, 
        nip: dp.dosen.username, 
        nama: dp.dosen.nama,
        role: dp.dosen.role
      })),
      komponenList: kelas.komponenNilai.map(k => ({
        id: k.id,
        nama: k.nama,
        bobot: k.bobot
      })),
      rpsSource, 
      mahasiswaList: kelas.peserta_kelas.map((p, index) => {
        const nilaiMap: Record<string, number> = {};
        p.nilai.forEach(n => {
          const namaKomponen = kelas.komponenNilai.find(k => k.id === n.komponen_nilai_id)?.nama;
          if (namaKomponen) nilaiMap[namaKomponen] = n.nilai_angka; 
        });
        return {
          id: p.id, 
          no: index + 1,
          nim: p.nim, 
          nama: p.nama || "Mahasiswa",
          nilai_akhir: p.nilai_angka || 0,
          nilai_huruf: p.nilai_huruf || "-",
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