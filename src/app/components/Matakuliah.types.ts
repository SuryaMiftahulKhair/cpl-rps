// Ini adalah data yang akan ditampilkan di list
export interface Matakuliah {
  id: number;
  kode_mk: string;
  nama: string;
  sks: number;
  kurikulum_id?: number;
  semester?: number | null; // FE-only
  sifat?: string | null;    // FE-only
  
  // Properti ekstra (mungkin dari join API atau state 'extras')
  area?: string | null;
  pi_area?: string | null;
  cpl?: string | null;
  performance_indicator?: string | null;
}

// Ini adalah data yang dikirim oleh Modal (Form)
export interface MatakuliahModalData {
  kode_mk: string;
  nama: string;
  sks: string | number;
  
  // --- PENYESUAIAN ---
  // cpl_id dan pi_group_id dihapus sesuai schema baru
  // ---------------------

  // Data FE-only untuk form
  semester?: number | null; 
  sifat?: string | null;
  
  // Data helper (opsional, tergantung UI modal)
  assesment_area_id?: number | null;
  performance_indicator_ids?: number[];
}