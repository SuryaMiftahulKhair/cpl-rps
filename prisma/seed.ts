import { PrismaClient, UserRole, Jenjang, Semester } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: Baca Sheet
function getSheet(workbook: XLSX.WorkBook, name: string) {
  if (!workbook.Sheets[name]) {
    console.error(`Sheet "${name}" tidak ditemukan!`);
    return [];
  }
  return XLSX.utils.sheet_to_json(workbook.Sheets[name]);
}

async function main() {
  const filePath = path.join(__dirname, 'data', 'full_database.xlsx');
  console.log(`Membaca file Excel: ${filePath}`);
  const workbook = XLSX.readFile(filePath);

  // --- 1. PRODI ---
  console.log('Importing Prodi...');
  const prodiMap = new Map<string, number>(); 
  for (const row of getSheet(workbook, 'Prodi') as any[]) {
    const p = await prisma.programStudi.upsert({
      where: { kode_prodi: row.kode_prodi },
      update: {},
      create: { 
        kode_prodi: row.kode_prodi, 
        nama: row.nama, 
        jenjang: row.jenjang as Jenjang 
      }
    });
    prodiMap.set(row.kode_prodi, p.id);
  }

  // --- 2. USERS ---
  console.log('Importing Users...');
  for (const row of getSheet(workbook, 'Users') as any[]) {
    
    const rawPassword = String(row.password);
    const hashedPassword = await bcrypt.hash(rawPassword, 10); 

    await prisma.user.upsert({
      where: { username: row.username },
      update: {
          password_hash: hashedPassword, 
          role: row.role as UserRole,
          prodi_id: row.kode_prodi ? prodiMap.get(row.kode_prodi) : null
      },
      create: {
        username: row.username,
        password_hash: hashedPassword, 
        nama: row.nama,
        role: row.role as UserRole,
        prodi_id: row.kode_prodi ? prodiMap.get(row.kode_prodi) : null
      }
    });
  }

  // --- 3. TAHUN AJARAN ---
  console.log('Importing Tahun Ajaran...');
  const taMap = new Map<string, number>(); 
  for (const row of getSheet(workbook, 'TahunAjaran') as any[]) {
    const ta = await prisma.tahunAjaran.upsert({
      where: { 
        tahun_semester: { tahun: String(row.tahun), semester: row.semester as Semester } 
      },
      update: {},
      create: { tahun: String(row.tahun), semester: row.semester as Semester }
    });
    taMap.set(`${row.tahun}-${row.semester}`, ta.id);
  }

  // --- 4. KURIKULUM ---
  console.log('Importing Kurikulum...');
  const kurikulumMap = new Map<string, number>();
  for (const row of getSheet(workbook, 'Kurikulum') as any[]) {
    const prodiId = prodiMap.get(row.kode_prodi);
    if (!prodiId) continue;

    let k = await prisma.kurikulum.findFirst({ where: { nama: row.nama } });
    if (!k) {
      k = await prisma.kurikulum.create({
        data: { nama: row.nama, tahun: parseInt(row.tahun), prodi_id: prodiId }
      });
    }
    kurikulumMap.set(row.nama, k.id);
  }

  // --- 5. CPL ---
  console.log('Importing CPL...');
  const cplMap = new Map<string, number>(); 
  for (const row of getSheet(workbook, 'CPL') as any[]) {
    const kurikId = kurikulumMap.get(row.nama_kurikulum);
    if (!kurikId) continue;

    const cpl = await prisma.cPL.create({
      data: {
        kode_cpl: row.kode_cpl,
        deskripsi: row.deskripsi,
        kurikulum_id: kurikId
      }
    });
    cplMap.set(row.kode_cpl, cpl.id);
  }

  // --- 6. IK (Indikator Kinerja) ---
  console.log('Importing IK...');
  const ikMap = new Map<string, number>();
  for (const row of getSheet(workbook, 'IK') as any[]) {
    const cplId = cplMap.get(row.kode_cpl);
    if (!cplId) continue;

    const ik = await prisma.ik.upsert({
      where: { kode_ik: row.kode_ik },
      update: {},
      create: {
        kode_ik: row.kode_ik,
        deskripsi: row.deskripsi,
        cpl_id: cplId
      }
    });
    ikMap.set(row.kode_ik, ik.id);
  }

  // --- 7. MATA KULIAH ---
  console.log('Importing Mata Kuliah...');
  const mkMap = new Map<string, number>();
  for (const row of getSheet(workbook, 'MataKuliah') as any[]) {
    const kurikId = kurikulumMap.get(row.nama_kurikulum);
    if (!kurikId) continue;

    const mk = await prisma.mataKuliah.upsert({
      where: { kode_mk: row.kode_mk },
      update: {},
      create: {
        kode_mk: row.kode_mk,
        nama: row.nama,
        sks: parseInt(row.sks),
        semester: parseInt(row.semester),
        sifat: row.sifat,
        kurikulum_id: kurikId
      }
    });
    mkMap.set(row.kode_mk, mk.id);
  }

  // --- 8. RPS & CPMK ---
  console.log('Importing RPS & CPMK...');
  const rpsMap = new Map<string, number>();
  const cpmkMap = new Map<string, number>(); 

  const rpsSheet = getSheet(workbook, 'RPS_CPMK');

  const uniqueMKs = [...new Set(rpsSheet.map((r: any) => r.kode_mk))];
  
  for (const kode_mk of uniqueMKs) {
    const mkId = mkMap.get(kode_mk as string);
    if (!mkId) continue;

    let rps = await prisma.rPS.findFirst({ where: { matakuliah_id: mkId } });
    if (!rps) {
        rps = await prisma.rPS.create({
            data: { 
                matakuliah_id: mkId,
                is_locked: true 
            }
        });
    }
    rpsMap.set(kode_mk as string, rps.id);
  }


  for (const row of rpsSheet as any[]) {
    const rpsId = rpsMap.get(row.kode_mk);
    if (!rpsId) continue;

    const ikCodes = row.kode_ik_terkait ? row.kode_ik_terkait.split(',') : [];
    const connectIks = ikCodes
        .map((code: string) => ({ id: ikMap.get(code.trim()) }))
        .filter((obj: any) => obj.id !== undefined);

    const cpmk = await prisma.cPMK.create({
        data: {
            kode_cpmk: row.kode_cpmk,
            deskripsi: row.deskripsi_cpmk,
            bobot_to_cpl: parseFloat(row.bobot_to_cpl || 0),
            rps: { connect: { id: rpsId } },
            ik: { connect: connectIks } 
        }
    });
    cpmkMap.set(`${row.kode_mk}-${row.kode_cpmk}`, cpmk.id);
  }

  // --- 9. KELAS ---
  console.log('Importing Kelas...');
  const kelasMap = new Map<string, number>(); 
  for (const row of getSheet(workbook, 'Kelas') as any[]) {
    const mkId = mkMap.get(row.kode_mk);
    const taId = taMap.get(`${row.tahun}-${row.semester}`);
    const rpsId = rpsMap.get(row.kode_mk); 

    if (!mkId || !taId) continue;

    const mkInfo = await prisma.mataKuliah.findUnique({where: {id: mkId}});

    const kelas = await prisma.kelas.create({
        data: {
            nama_kelas: row.nama_kelas,
            kode_mk: row.kode_mk,
            nama_mk: mkInfo?.nama || "",
            sks: mkInfo?.sks || 0,
            matakuliah_id: mkId,
            tahun_ajaran_id: taId,
            rps_id: rpsId 
        }
    });

    kelasMap.set(`${row.kode_mk}-${row.nama_kelas}`, kelas.id);

    if (rpsId) {
        const cpmks = await prisma.cPMK.findMany({ where: { rps: { some: { id: rpsId } } } });
        await prisma.kelas.update({
            where: { id: kelas.id },
            data: {
                cpmk: { connect: cpmks.map(c => ({ id: c.id })) }
            }
        });
    }
  }

  // --- 10. MAHASISWA ---
  console.log('Importing Mahasiswa...');
  const mhsMap = new Map<string, number>();
  for (const row of getSheet(workbook, 'Mahasiswa') as any[]) {
      const mhs = await prisma.mahasiswa.upsert({
          where: { nim: String(row.nim) },
          update: { nama: row.nama },
          create: { nim: String(row.nim), nama: row.nama }
      });
      mhsMap.set(String(row.nim), mhs.id);
  }

  // --- 11. PESERTA KELAS (Enrollment) ---
  console.log('Importing Peserta Kelas...');
  const pesertaMap = new Map<string, number>(); 
  for (const row of getSheet(workbook, 'PesertaKelas') as any[]) {
      const kelasId = kelasMap.get(`${row.kode_mk}-${row.nama_kelas}`);
      const mhsId = mhsMap.get(String(row.nim));

      if (kelasId && mhsId) {
          const peserta = await prisma.pesertaKelas.upsert({
              where: { 
                  kelas_id_mahasiswa_id: { kelas_id: kelasId, mahasiswa_id: mhsId } 
              },
              update: {},
              create: { kelas_id: kelasId, mahasiswa_id: mhsId }
          });
          pesertaMap.set(`${kelasId}-${mhsId}`, peserta.id);
      }
  }

  // --- 12. KOMPONEN NILAI & NILAI (Advanced) ---
  console.log('Importing Komponen & Nilai...');

  const kompSheet = getSheet(workbook, 'KomponenNilai');
  
  for (const row of kompSheet as any[]) {
      const kelasId = kelasMap.get(`${row.kode_mk}-${row.nama_kelas}`);
      const cpmkId = cpmkMap.get(`${row.kode_mk}-${row.kode_cpmk}`);
      
      if (!kelasId || !cpmkId) {
          console.warn(`Skip Komponen ${row.nama}: Kelas/CPMK tidak valid`);
          continue;
      }

      const komp = await prisma.komponenNilai.create({
          data: {
              nama: row.nama,
              bobot_nilai: parseFloat(row.bobot),
              kelas_id: kelasId,
              cpmk_id: cpmkId
          }
      });

      
      const pesertaList = await prisma.pesertaKelas.findMany({ where: { kelas_id: kelasId } });
      
      
  }

  console.log('✅✅ FULL IMPORT SELESAI!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
