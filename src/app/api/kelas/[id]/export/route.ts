import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma";
import * as XLSX from "xlsx";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const kelasId = parseInt(resolvedParams.id);

    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        komponenNilai: { orderBy: { id: "asc" } },
        peserta_kelas: {
          include: {
            mahasiswa: true,
            nilai: true,
          },
          orderBy: { mahasiswa: { nim: "asc" } },
        },
      },
    });

    if (!kelas) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const headers = ["No", "NIM", "Nama"];
    kelas.komponenNilai.forEach((k) => {
      headers.push(k.nama);
    });

    const rows = kelas.peserta_kelas.map((p, index) => {
      const rowData: (string | number)[] = [
        index + 1,
        p.mahasiswa.nim,
        p.mahasiswa.nama,
      ];

      kelas.komponenNilai.forEach((k) => {
        const nilaiMhs = p.nilai.find((n) => n.komponen_nilai_id === k.id);
        rowData.push(nilaiMhs ? nilaiMhs.nilai_komponen : 0);
      });

      return rowData;
    });

    const dataAOA = [headers, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(dataAOA);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nilai Mahasiswa");

    const wscols = [{ wch: 5 }, { wch: 15 }, { wch: 30 }];
    kelas.komponenNilai.forEach(() => wscols.push({ wch: 15 }));
    worksheet["!cols"] = wscols;

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Nilai_${kelas.nama_kelas}_${kelas.kode_mk}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Download Template Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}