import prisma from "@/../lib/prisma";
import { Prisma } from "@prisma/client";

export const MahasiswaService = {
  async getMahasiswa(q: string = "", page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.MahasiswaWhereInput = {
      AND: [
        q ? {
          OR: [
            { nama: { contains: q, mode: "insensitive" } },
            { nim: { contains: q, mode: "insensitive" } },
          ],
        } : {},
      ],
    };

    const [data, total] = await prisma.$transaction([
      prisma.mahasiswa.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { nim: "asc" },
      }),
      prisma.mahasiswa.count({ where: whereClause }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async createMahasiswa(nim: string, nama: string) {
    if (!nim || !nama) {
      throw new Error("NIM dan Nama wajib diisi");
    }

    const existing = await prisma.mahasiswa.findUnique({ where: { nim } });
    if (existing) {
      throw new Error("NIM sudah terdaftar");
    }

    return await prisma.mahasiswa.create({
      data: { nim, nama },
    });
  },

  async importMahasiswa(dataMahasiswa: any[]) {
    if (!dataMahasiswa || !Array.isArray(dataMahasiswa) || dataMahasiswa.length === 0) {
      throw new Error("Data kosong atau format salah");
    }

    let processed = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of dataMahasiswa) {
        const nimKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'nim');
        const namaKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'nama');
        
        const nim = nimKey ? String(row[nimKey]).trim() : null;
        const nama = namaKey ? String(row[namaKey]).trim() : null;
        
        if (!nim || !nama) continue;

        await tx.mahasiswa.upsert({
          where: { nim: nim },
          update: { nama: nama },
          create: { nim: nim, nama: nama }
        });

        processed++;
      }
    });

    return { processed };
  }
};