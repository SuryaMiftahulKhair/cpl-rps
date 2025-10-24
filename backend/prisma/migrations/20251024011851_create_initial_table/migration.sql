-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DOSEN', 'MAHASISWA');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('GANJIL', 'GENAP');

-- CreateTable
CREATE TABLE "program_studi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "total_sks_lulus" INTEGER NOT NULL,

    CONSTRAINT "program_studi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "program_studi_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kurikulum" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "program_studi_id" INTEGER NOT NULL,

    CONSTRAINT "kurikulum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_kuliah" (
    "id" SERIAL NOT NULL,
    "kode_mk" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kurikulum_id" INTEGER NOT NULL,

    CONSTRAINT "mata_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pi_group" (
    "id" SERIAL NOT NULL,
    "kode_grup" TEXT NOT NULL,
    "nama_grup" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kurikulum_id" INTEGER NOT NULL,

    CONSTRAINT "pi_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_indicator" (
    "id" SERIAL NOT NULL,
    "kode_pi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pi_group_id" INTEGER NOT NULL,

    CONSTRAINT "performance_indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpl" (
    "id" SERIAL NOT NULL,
    "kode_cpl" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kurikulum_id" INTEGER NOT NULL,
    "pi_group_id" INTEGER NOT NULL,

    CONSTRAINT "cpl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahun_ajaran" (
    "id" SERIAL NOT NULL,
    "tahun" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,

    CONSTRAINT "tahun_ajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" SERIAL NOT NULL,
    "nama_kelas" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mata_kuliah_id" INTEGER NOT NULL,
    "tahun_ajaran_id" INTEGER NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosen_pengampu" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kelas_id" INTEGER NOT NULL,
    "dosen_id" INTEGER NOT NULL,

    CONSTRAINT "dosen_pengampu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta_kelas" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kelas_id" INTEGER NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,

    CONSTRAINT "peserta_kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rps" (
    "id" SERIAL NOT NULL,
    "file_path" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kelas_id" INTEGER NOT NULL,

    CONSTRAINT "rps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpmk" (
    "id" SERIAL NOT NULL,
    "kode_cpmk" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kelas_id" INTEGER NOT NULL,

    CONSTRAINT "cpmk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpmk_pi_map" (
    "cpmk_id" INTEGER NOT NULL,
    "pi_id" INTEGER NOT NULL,

    CONSTRAINT "cpmk_pi_map_pkey" PRIMARY KEY ("cpmk_id","pi_id")
);

-- CreateTable
CREATE TABLE "komponen_penilaian" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cpmk_id" INTEGER NOT NULL,

    CONSTRAINT "komponen_penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai" (
    "id" SERIAL NOT NULL,
    "nilai_angka" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "peserta_kelas_id" INTEGER NOT NULL,
    "komponen_penilaian_id" INTEGER NOT NULL,

    CONSTRAINT "nilai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_studi_nama_key" ON "program_studi"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "mata_kuliah_kode_mk_key" ON "mata_kuliah"("kode_mk");

-- CreateIndex
CREATE UNIQUE INDEX "tahun_ajaran_tahun_semester_key" ON "tahun_ajaran"("tahun", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_pengampu_kelas_id_dosen_id_key" ON "dosen_pengampu"("kelas_id", "dosen_id");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_kelas_kelas_id_mahasiswa_id_key" ON "peserta_kelas"("kelas_id", "mahasiswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_peserta_kelas_id_komponen_penilaian_id_key" ON "nilai"("peserta_kelas_id", "komponen_penilaian_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_program_studi_id_fkey" FOREIGN KEY ("program_studi_id") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kurikulum" ADD CONSTRAINT "kurikulum_program_studi_id_fkey" FOREIGN KEY ("program_studi_id") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mata_kuliah" ADD CONSTRAINT "mata_kuliah_kurikulum_id_fkey" FOREIGN KEY ("kurikulum_id") REFERENCES "kurikulum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pi_group" ADD CONSTRAINT "pi_group_kurikulum_id_fkey" FOREIGN KEY ("kurikulum_id") REFERENCES "kurikulum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_indicator" ADD CONSTRAINT "performance_indicator_pi_group_id_fkey" FOREIGN KEY ("pi_group_id") REFERENCES "pi_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl" ADD CONSTRAINT "cpl_kurikulum_id_fkey" FOREIGN KEY ("kurikulum_id") REFERENCES "kurikulum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl" ADD CONSTRAINT "cpl_pi_group_id_fkey" FOREIGN KEY ("pi_group_id") REFERENCES "pi_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen_pengampu" ADD CONSTRAINT "dosen_pengampu_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen_pengampu" ADD CONSTRAINT "dosen_pengampu_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_kelas" ADD CONSTRAINT "peserta_kelas_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_kelas" ADD CONSTRAINT "peserta_kelas_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rps" ADD CONSTRAINT "rps_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk" ADD CONSTRAINT "cpmk_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk_pi_map" ADD CONSTRAINT "cpmk_pi_map_cpmk_id_fkey" FOREIGN KEY ("cpmk_id") REFERENCES "cpmk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk_pi_map" ADD CONSTRAINT "cpmk_pi_map_pi_id_fkey" FOREIGN KEY ("pi_id") REFERENCES "performance_indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komponen_penilaian" ADD CONSTRAINT "komponen_penilaian_cpmk_id_fkey" FOREIGN KEY ("cpmk_id") REFERENCES "cpmk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_peserta_kelas_id_fkey" FOREIGN KEY ("peserta_kelas_id") REFERENCES "peserta_kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_komponen_penilaian_id_fkey" FOREIGN KEY ("komponen_penilaian_id") REFERENCES "komponen_penilaian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
