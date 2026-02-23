import { NextResponse, NextRequest } from "next/server";
import prisma from "@/../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rps_id = Number(body.rps_id);
    const pekan_ke = Number(body.pekan_ke);
    const bobot_assesment = body.bobot_nilai ? parseFloat(body.bobot_nilai) : 0;
    
    const cpmk_id = body.cpmk_id ? Number(body.cpmk_id) : null;

    if (!rps_id || !pekan_ke) {
      return NextResponse.json(
        { error: "Data rps_id atau pekan_ke tidak valid" },
        { status: 400 },
      );
    }

    const pertemuan = await prisma.rPSPertemuan.create({
      data: {
        rps_id: rps_id,
        pekan_ke: pekan_ke,
        bobot_assesment: bobot_assesment, 

        kemampuan_akhir: body.kemampuan_akhir || "",
        bahan_kajian: body.bahan_kajian || "",
        metode_pembelajaran: body.metode_pembelajaran || "",
        pengalaman_belajar: body.pengalaman_belajar || "",
        kriteria_penilaian: body.kriteria_penilaian || "",
        waktu: body.waktu || "",
      },
    });

    if (cpmk_id) {
       const parentCpmk = await prisma.cPMK.findUnique({
           where: { id: cpmk_id },
           include: { ik: true } 
       });

       if (parentCpmk && parentCpmk.ik.length > 0) {
           const targetIkId = parentCpmk.ik[0].id;
           await prisma.subCpmk.create({
              data: {
                 kode_sub_cpmk: `Sub-CPMK-${pekan_ke}`, 
                 deskripsi: body.kemampuan_akhir || "Sub CPMK Pertemuan",
                 
                 cpmk_id: cpmk_id,
                 ik_id: targetIkId, 

                 rps_pertemuan: {
                    connect: { id: pertemuan.id }
                 }
              }
           });
       } else {
           console.warn(`⚠️ Peringatan: CPMK ID ${cpmk_id} tidak memiliki IK terhubung. Sub-CPMK gagal dibuat.`);
       }
    }

    return NextResponse.json({ success: true, data: pertemuan });

  } catch (error: any) {
    console.error("ERROR POST PERTEMUAN:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan: " + error.message },
      { status: 500 },
    );
  }
}