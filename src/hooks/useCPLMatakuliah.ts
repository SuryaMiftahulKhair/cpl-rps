import { useState, useEffect, useMemo } from 'react';

// --- Types ---
export interface TahunAjaran {
  id: number;
  tahun: string;
  semester: string;
}

export interface Matakuliah {
  id: number;
  code: string;
  name: string;
}

export interface RadarItem {
  subject: string;
  prodi: number;
  target: number;
}

export interface ClassDetail {
  id: number;
  class_name: string;
  total_students: number;
  scores: Record<string, number>; // { "CPL-01": 80, "CPL-02": 75 }
}

export type FilterType = "SEMUA" | "TAHUN" | "SEMESTER";

export const useCPLMatakuliah = () => {
  // --- STATE: Master Data ---
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [matakuliahList, setMatakuliahList] = useState<Matakuliah[]>([]);
  
  // --- STATE: Filter Controls ---
  const [filterType, setFilterType] = useState<FilterType>("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // --- STATE: Data Report ---
  const [radarData, setRadarData] = useState<RadarItem[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  
  // --- STATE: UI ---
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Initial Load: Ambil Daftar Tahun Ajaran & Matakuliah
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const resSemester = await fetch("/api/tahunAjaran");
        const jsonSemester = await resSemester.json();
        const dataSemester = Array.isArray(jsonSemester) ? jsonSemester : jsonSemester.data || [];
        setSemesterList(dataSemester);

        const resCourse = await fetch("/api/matakuliah");
        const jsonCourse = await resCourse.json();
        const rawCourse = Array.isArray(jsonCourse) ? jsonCourse : jsonCourse.data || [];
        
        const dataCourse = rawCourse.map((c: any) => ({
            id: c.id,
            code: c.kode_mk || c.code || "",
            name: c.nama || c.name || ""
        }));
        setMatakuliahList(dataCourse);

        if (dataSemester.length > 0) {
          setSelectedSemesterId(String(dataSemester[0].id));
          setSelectedYear(dataSemester[0].tahun);
        }
        if (dataCourse.length > 0) {
          setSelectedCourseId(String(dataCourse[0].id));
        }
      } catch (err) {
        console.error("Gagal load data awal", err);
      }
    };
    fetchInitialData();
  }, []);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(semesterList.map(s => s.tahun)));
  }, [semesterList]);

  const loadReport = async () => {
    if (!selectedCourseId) {
      alert("Pilih matakuliah terlebih dahulu");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    let semesterIds: number[] = [];
    if (filterType === "SEMUA") {
      semesterIds = semesterList.map(s => Number(s.id));
    } else if (filterType === "TAHUN") {
      semesterIds = semesterList.filter(s => s.tahun === selectedYear).map(s => Number(s.id));
    } else {
      semesterIds = [Number(selectedSemesterId)];
    }

    try {
      const res = await fetch("/api/laporan/cpl-matakuliah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matakuliah_id: Number(selectedCourseId), // Sesuaikan dengan DB
          semester_ids: semesterIds,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data");

      const formattedRadar = (json.radarData || []).map((item: any) => ({
          subject: item.subject,
          prodi: item.prodi || 0,
          target: 75 
      }));

      setRadarData(formattedRadar);
      setClassDetails(json.classData || []);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      setRadarData([]);
      setClassDetails([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    semesterList, matakuliahList, uniqueYears, radarData, classDetails,
    loading, hasSearched, filterType, setFilterType, selectedYear, setSelectedYear,
    selectedSemesterId, setSelectedSemesterId, selectedCourseId, setSelectedCourseId,
    loadReport,
  };
};