// src/app/penilaian/datakelas/types.ts

export enum Semester {
  GANJIL = "GANJIL",
  GENAP = "GENAP",
}

export interface TahunAjaran {
  id: number | string;
  tahun: string;
  semester: Semester;
}
