// src/lib/neosiaService.ts

const BASE_URL = process.env.NEOSIA_API_URL || "https://iku-api.dev.unhas.ac.id";
const USERNAME = process.env.NEOSIA_USERNAME;
const PASSWORD = process.env.NEOSIA_PASSWORD;

export interface NeosiaNilaiItem {
  mata_kuliah_kode: string;
  mata_kuliah_nama: string;
  kelas_kuliah_nama: string;
  sks: number;
}

// 1. Fungsi Login (Strict: Error jika Gagal)
async function getAuthToken() {
  // Cek env dulu
  if (!USERNAME || !PASSWORD) {
    throw new Error("Username atau Password Neosia belum diset di file .env");
  }

  console.log(`🔄 Mencoba login ke Neosia sebagai: ${USERNAME}...`);

  try {
    const res = await fetch(`${BASE_URL}/api/v2/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json",
        // Kadang server memblokir jika User-Agent kosong
        "User-Agent": "SistemPenilaianCPL/1.0" 
      },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
      cache: "no-store" 
    });

    if (!res.ok) {
      // Baca pesan error dari server jika ada
      const errorText = await res.text();
      console.error("❌ Gagal Login Neosia:", res.status, errorText);
      throw new Error(`Login Gagal (${res.status}): ${errorText || res.statusText}`);
    }

    const data = await res.json();
    console.log("✅ Login Neosia Berhasil!");
    return data.access_token;

  } catch (error: any) {
    console.error("🔥 Error Koneksi Login:", error.message);
    throw error; // Lempar error agar UI tahu proses gagal
  }
}

// 2. Fungsi Ambil Kelas (Strict)
export async function fetchKelasFromNeosia(semesterKode: string, prodiId: string) {
  const token = await getAuthToken();
  const PAGE_SIZE = 500; // Batas aman Neosia

  console.log(`🔄 Mulai mengambil SEMUA data kelas (Semester: ${semesterKode}, Prodi: ${prodiId})...`);

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

      const res = await fetch(`${BASE_URL}/api/v2/nilai/prodi/${prodiId}?${query}`, {
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json",
          "User-Agent": "SistemPenilaianCPL/1.0"
        },
        cache: "no-store"
      });

      if (!res.ok) {
        // Jika error terjadi di halaman pertama, lempar error. 
        // Jika di halaman selanjutnya, mungkin cuma habis session, tapi kita simpan yg sudah ada.
        if (page === 1) {
            const errorText = await res.text();
            throw new Error(`Gagal Ambil Data Hal-${page} (${res.status}): ${errorText}`);
        } else {
            console.warn(`⚠️ Gagal di halaman ${page}, berhenti mengambil data.`);
            break;
        }
      }

      const json = await res.json();
      const pageData: NeosiaNilaiItem[] = json.data || [];

      if (pageData.length > 0) {
        allData = [...allData, ...pageData];
        console.log(`      ✅ Dapat ${pageData.length} data.`);
        
        // Jika data yang didapat KURANG dari page_size, berarti ini halaman terakhir
        if (pageData.length < PAGE_SIZE) {
            hasMoreData = false;
        } else {
            page++; // Lanjut ke halaman berikutnya
        }
      } else {
        // Data kosong, berhenti loop
        hasMoreData = false;
      }
    }

    console.log(`🎉 Selesai! Total data mentah terambil: ${allData.length}`);

    // Filter Data Unik (Group by Kode MK + Nama Kelas)
    const uniqueKelas = new Map<string, NeosiaNilaiItem>();
    allData.forEach(item => {
      if(item.mata_kuliah_kode && item.kelas_kuliah_nama) {
          const key = `${item.mata_kuliah_kode}-${item.kelas_kuliah_nama}`;
          // Kita overwrite agar data terbaru yang tersimpan
          uniqueKelas.set(key, item);
      }
    });
    
    console.log(`📦 Total Kelas Unik setelah filter: ${uniqueKelas.size}`);
    return Array.from(uniqueKelas.values());

  } catch (error: any) {
    console.error("🔥 Error Fetch Data Loop:", error.message);
    throw error;
  }
}