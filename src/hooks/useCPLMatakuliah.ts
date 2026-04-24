import { useState, useEffect, useMemo } from 'react';

export interface TahunAjaran { id: number; tahun: string; semester: string; }

export interface MataKuliah { 
  id: number; 
  kode_mk: string; 
  nama: string; 
  nama_mk: string; 
  kodeMatakuliah: string; 
  namaMatakuliah: string;
}

export interface RadarItem { subject: string; prodi: number; target: number; }
export interface CourseItem { id: number; code: string; name: string; class_name: string; scores: Record<string, number>; }
export type FilterType = "SEMUA" | "TAHUN" | "SEMESTER";

export const useCPLMatakuliah = () => {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [matakuliahList, setMatakuliahList] = useState<MataKuliah[]>([]); 
  
  const [filterType, setFilterType] = useState<FilterType>("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>(""); 
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(""); 
  const [selectedCourseId, setSelectedCourseId] = useState<string>(""); 

  const [radarData, setRadarData] = useState<RadarItem[]>([]);
  const [classDetails, setClassDetails] = useState<CourseItem[]>([]); 
  
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const resSem = await fetch("/api/tahunAjaran");
        const jsonSem = await resSem.json();
        const dataSem = Array.isArray(jsonSem) ? jsonSem : jsonSem.data || [];
        setSemesterList(dataSem);
        if (dataSem.length > 0) {
            setSelectedSemesterId(String(dataSem[0].id));
            setSelectedYear(dataSem[0].tahun);
        }

        const resMk = await fetch("/api/matakuliah"); 
        const jsonMk = await resMk.json();
        const rawDataMk = Array.isArray(jsonMk) ? jsonMk : jsonMk.data || [];
        
        const safeDataMk = rawDataMk.map((mk: any) => {
          const kode = mk.kode_mk || mk.kodeMatakuliah || mk.kode || "-";
          const nama = mk.nama || mk.nama_mk || mk.namaMatakuliah || mk.name || "Tanpa Nama";
          
          return {
            id: mk.id,
            kode_mk: kode,
            kodeMatakuliah: kode,
            nama: nama,
            nama_mk: nama,
            namaMatakuliah: nama
          };
        });

        setMatakuliahList(safeDataMk);
        
        if (safeDataMk.length > 0) {
            setSelectedCourseId(String(safeDataMk[0].id));
        }
      } catch (err) {
        console.error("Gagal load master data matakuliah", err);
      }
    };
    fetchMasterData();
  }, []);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(semesterList.map(s => s.tahun)));
  }, [semesterList]);

  const loadReport = async () => {
    setLoading(true);
    setHasSearched(true);
    
    let ids: number[] = [];
    if (filterType === "SEMUA") {
        ids = semesterList.map(s => Number(s.id));
    } else if (filterType === "TAHUN") {
        ids = semesterList.filter(s => s.tahun === selectedYear).map(s => Number(s.id));
    } else {
        ids = [Number(selectedSemesterId)];
    }

    try {
        const res = await fetch("/api/laporan/cpl-matakuliah", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                matakuliah_id: Number(selectedCourseId),
                semester_ids: ids 
            })
        });
        
        const json = await res.json();
        
        if (json.radarData && Array.isArray(json.radarData)) {
            const formattedRadar: RadarItem[] = json.radarData.map((item: any) => ({
                subject: item.subject,
                prodi: item.score || 0,
                target: 75 
            }));
            setRadarData(formattedRadar);
        } else {
            setRadarData([]);
        }
        
        setClassDetails(json.classData || json.courseData || []);

    } catch (error) {
        console.error(error);
        alert("Gagal memuat data grafik matakuliah");
    } finally {
        setLoading(false);
    }
  };

  return {
    semesterList, matakuliahList, uniqueYears,
    radarData, classDetails, courseList: classDetails, 
    loading, hasSearched,
    filterType, setFilterType,
    selectedYear, setSelectedYear,
    selectedSemesterId, setSelectedSemesterId,
    selectedCourseId, setSelectedCourseId,
    loadReport
  };
};