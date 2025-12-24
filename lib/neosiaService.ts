// Mengambil konfigurasi BASE_URL dari .env (ini tetap perlu)
const BASE_URL = process.env.KAMPUS_API_BASE_URL;

// Kita HAPUS USERNAME & PASSWORD dari env karena tidak dipakai lagi di sini
// const USERNAME = process.env.KAMPUS_API_USERNAME;
// const PASSWORD = process.env.KAMPUS_API_PASSWORD;

export interface NeosiaNilaiItem {
  mata_kuliah_kode: string;
  mata_kuliah_nama: string;
  kelas_kuliah_nama: string;
  sks: number;
  // Tambahkan field lain sesuai respon API Neosia
}

// HAPUS fungsi getAuthToken() karena kita akan pakai token dari session user yang sedang login

// 2. Fungsi Ambil Kelas (Sekarang menerima 'token' sebagai parameter)
export async function fetchKelasFromNeosia(
  semesterKode: string, 
  prodiId: string, 
  token: string // <-- PERUBAHAN: Token wajib dikirim dari pemanggil fungsi
): Promise<NeosiaNilaiItem[]> {
  
  // Validasi konfigurasi dasar
  if (!BASE_URL) {
    throw new Error("Konfigurasi NEOSIA (.env) belum lengkap: BASE_URL belum diisi.");
  }
  
  if (!token) {
     throw new Error("Token otentikasi tidak tersedia. Harap login terlebih dahulu.");
  }

  const PAGE_SIZE = 500; // Batas data per halaman
  const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

  console.log(`🔄 [NeosiaService] Mulai mengambil data kelas (Sem: ${semesterKode}, Prodi: ${prodiId})...`);

  let allData: NeosiaNilaiItem[] = [];
  let page = 1;
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      console.log(`   ⏳ Mengambil halaman ke-${page}...`);

      const query = new URLSearchParams({
        semester_kode: semesterKode,
        page: page.toString(),
        page_size: PAGE_SIZE.toString(),
      });

      const res = await fetch(`${cleanBaseUrl}/api/v2/nilai/prodi/${prodiId}?${query}`, {
        headers: { 
          "Authorization": `Bearer ${token}`, // Gunakan token yang dikirim
          "Accept": "application/json",
          "User-Agent": "SistemPenilaianCPL/1.0"
        },
        cache: "no-store"
      });

      if (!res.ok) {
        // Jika error di halaman pertama, langsung lempar error
        if (page === 1) {
            const errorText = await res.text();
            throw new Error(`Gagal Ambil Data Hal-${page} (${res.status}): ${errorText}`);
        } else {
            // Jika di tengah jalan error, kita berhenti tapi simpan data yg sudah dapat
            console.warn(`⚠️ Gagal di halaman ${page}, berhenti mengambil data.`);
            break;
        }
      }

      const json = await res.json();
      const pageData: NeosiaNilaiItem[] = json.data || [];

      if (pageData.length > 0) {
        allData = [...allData, ...pageData];
        console.log(`      ✅ Dapat ${pageData.length} data.`);
        
        // Cek apakah masih ada halaman selanjutnya
        if (pageData.length < PAGE_SIZE) {
            hasMoreData = false; // Data habis (kurang dari limit)
        } else {
            page++; // Lanjut halaman berikutnya
        }
      } else {
        hasMoreData = false; // Data kosong
      }
    }

    console.log(`🎉 [NeosiaService] Selesai! Total data mentah: ${allData.length}`);

    // Filter Data Unik (Menghindari duplikasi berdasarkan Kode MK + Nama Kelas)
    const uniqueKelas = new Map<string, NeosiaNilaiItem>();
    allData.forEach(item => {
      if(item.mata_kuliah_kode && item.kelas_kuliah_nama) {
          const key = `${item.mata_kuliah_kode}-${item.kelas_kuliah_nama}`;
          uniqueKelas.set(key, item);
      }
    });
    
    console.log(`📦 [NeosiaService] Total Kelas Unik: ${uniqueKelas.size}`);
    return Array.from(uniqueKelas.values());

  } catch (error: any) {
    console.error("🔥 [NeosiaService] Error Fetch Loop:", error.message);
    throw error;
  }
}