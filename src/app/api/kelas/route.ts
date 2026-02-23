import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taId = searchParams.get("tahun_ajaran_id");

    const where = taId ? { tahun_ajaran_id: Number(taId) } : {};

    const data = await prisma.kelas.findMany({
      where,
      include: {
        matakuliah: true,
      },
      orderBy: { nama_kelas: 'asc' }
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.tahun_ajaran_id || !body.kode_mk || !body.nama_kelas) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const newKelas = await prisma.kelas.create({
      data: {
        tahun_ajaran_id: Number(body.tahun_ajaran_id),
        nama_kelas: body.nama_kelas, 
        kode_mk: body.kode_mk,       
        nama_mk: body.nama_mk,       
        sks: Number(body.sks || 0),
        matakuliah_id: body.matakuliah_id ? Number(body.matakuliah_id) : null,
        rps_id: body.rps_id ? Number(body.rps_id) : null, 
      }
    });

    if (body.rps_id) {
        try {
            const rpsData = await prisma.rPS.findUnique({
                where: { id: Number(body.rps_id) },
                include: {
                    pertemuan: {
                        where: { bobot_assesment: { gt: 0 } }, 
                        include: {
                            sub_cpmk: { include: { cpmk: true } } 
                        }
                    }
                }
            });
            if (rpsData && rpsData.pertemuan.length > 0) {
                const komponenToCreate: any[] = [];

                for (const p of rpsData.pertemuan) {
                    const cpmkId = p.sub_cpmk?.[0]?.cpmk_id;
                    if (cpmkId) {
                        komponenToCreate.push({
                            nama: p.metode_pembelajaran || `Evaluasi Pekan ${p.pekan_ke}`,
                            kelas_id: newKelas.id,
                            bobot_nilai: p.bobot_assesment, 
                            cpmk_id: cpmkId
                        });
                    }
                }

                if (komponenToCreate.length > 0) {
                    await prisma.komponenNilai.createMany({
                        data: komponenToCreate
                    });
                    console.log(`✅ Auto-Sync Berhasil: ${komponenToCreate.length} komponen nilai dibuat untuk Kelas ID ${newKelas.id}`);
                }
            }
        } catch (syncError) {
            console.error("⚠️ Gagal Auto-Sync RPS:", syncError);
        }
    }
    return NextResponse.json({ success: true, data: newKelas });

  } catch (err: any) {
    console.error("POST Kelas Error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Gagal menyimpan kelas" 
    }, { status: 500 });
  }
}