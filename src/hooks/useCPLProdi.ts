import { useState, useEffect, useMemo } from 'react';

// --- Types ---
export interface TahunAjaran {
  id: number;
  tahun: string;
  semester: string;
}

export interface Kurikulum {
  id: number;
  nama: string;
  tahun: number;
}

export interface RadarItem {
  subject: string;
  prodi: number;
  target: number;
}

export interface CourseItem {
  id: number;
  code: string;
  name: string;
  class_name: string;
  scores: Record<string, number>; 
}

export type FilterType = "SEMUA" | "TAHUN" | "SEMESTER";

export const useCPLProdi = () => {
  // --- STATE: Master Data ---
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
  
  // --- STATE: Filter Controls ---
  const [filterType, setFilterType] = useState<FilterType>("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>(""); 
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(""); 
  const [selectedKurikulumId, setSelectedKurikulumId] = useState<string>("");

  // --- STATE: Data Report ---
  const [radarData, setRadarData] = useState<RadarItem[]>([]);
  const [courseList, setCourseList] = useState<CourseItem[]>([]);
  
  // --- STATE: UI ---
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Initial Load: Ambil Daftar Tahun Ajaran & Kurikulum
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // Fetch Semester
        const resSem = await fetch("/api/tahunAjaran");
        const jsonSem = await resSem.json();
        const dataSem = Array.isArray(jsonSem) ? jsonSem : jsonSem.data || [];
        setSemesterList(dataSem);
        
        if (dataSem.length > 0) {
            setSelectedSemesterId(String(dataSem[0].id));
            setSelectedYear(dataSem[0].tahun);
        }

        // Fetch Kurikulum
        const resKur = await fetch("/api/kurikulum");
        const jsonKur = await resKur.json();
        const dataKur = Array.isArray(jsonKur) ? jsonKur : jsonKur.data || [];
        setKurikulumList(dataKur);

        if (dataKur.length > 0) {
            setSelectedKurikulumId(String(dataKur[0].id));
        }

      } catch (err) {
        console.error("Gagal load master data", err);
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
        const res = await fetch("/api/laporan/cpl-prodi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                kurikulum_id: Number(selectedKurikulumId), 
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
        
        setCourseList(json.classData || json.courseData || []);

    } catch (error) {
        console.error(error);
        alert("Gagal memuat data grafik");
    } finally {
        setLoading(false);
    }
  };

  return {
    semesterList,
    kurikulumList,
    uniqueYears,
    radarData,
    courseList,
    loading,
    hasSearched,
    filterType, setFilterType,
    selectedYear, setSelectedYear,
    selectedSemesterId, setSelectedSemesterId,
    selectedKurikulumId, setSelectedKurikulumId,
    loadReport
  };
};