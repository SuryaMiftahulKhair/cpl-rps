-- CreateTable
CREATE TABLE "VisiMisi" (
    "id" TEXT NOT NULL,
    "kurikulumId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "teks" TEXT NOT NULL,
    "urutan" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisiMisi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VisiMisi" ADD CONSTRAINT "VisiMisi_kurikulumId_fkey" FOREIGN KEY ("kurikulumId") REFERENCES "Kurikulum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
