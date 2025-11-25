// file: src/app/api/dosen/pengampu/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/../lib/prisma"; // Pastikan path ke lib/prisma benar

// === DELETE: Menghapus Dosen Pengampu berdasarkan ID Relasi ===
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Ambil ID dari URL (ini adalah ID tabel DosenPengampu, BUKAN NIP/User ID)
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // 2. Cek apakah data ada (Opsional, Prisma akan throw error jika tidak ada di delete, tapi findUnique lebih aman)
    const pengampu = await prisma.dosenPengampu.findUnique({
      where: { id: id },
    });

    if (!pengampu) {
      return NextResponse.json({ error: "Data pengampu tidak ditemukan" }, { status: 404 });
    }

    // 3. Hapus data dari database
    await prisma.dosenPengampu.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Dosen berhasil dihapus dari kelas" }, { status: 200 });

  } catch (err) {
    console.error("DELETE /api/dosen/pengampu/[id] error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus dosen dari kelas" },
      { status: 500 }
    );
  }
}