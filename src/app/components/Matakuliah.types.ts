export interface CPL {
  id: number;
  kode_cpl: string;
  deskripsi: string;
}

export interface Matakuliah {
  pi_area: string;
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number | null;
  sifat: string | null;
  kurikulum_id: number;
  // Tambahan: List CPL yang sudah terhubung (dari GET API)
  cpl?: CPL[]; 
}

export interface MatakuliahModalData {
  kode_mk: string;
  nama: string;
  sks: number;
  semester: number | null;
  sifat: string | null;
  // Tambahan: Array ID untuk dikirim ke API POST
  cpl_ids?: number[]; 
}