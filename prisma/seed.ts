import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const prodi = await prisma.programStudi.upsert({
    where: { kode: "IF" },
    update: {},
    create: { kode: "IF", nama: "Informatika" },
  });

  await prisma.kurikulum.create({
    data: {
      nama: "Kurikulum Informatika 2024",
      tahun: 2024,
      programStudiId: prodi.id,
      deskripsi: "Kurikulum inti 2024",
      versi: "v1.0",
      mataKuliahs: {
        create: [
          {
            kode: "IF101",
            nama: "Pemrograman Dasar",
            sks: 3,
            semester: 1,
            cplItems: {
              create: [{ kode: "CPL01", deskripsi: "Menguasai dasar pemrograman" }],
            },
          },
        ],
      },
    },
  });

  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
